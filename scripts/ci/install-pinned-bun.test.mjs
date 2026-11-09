import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import childProcess from "node:child_process";
import { gzipSync } from "node:zlib";
const api = await import("./install-pinned-bun.mjs").catch(() => null);
function sut() {
  assert.ok(api, "pinned bootstrap is not implemented");
  return api;
}
const pkg = Buffer.from(
  JSON.stringify({ name: "@oven/bun-linux-x64", version: "1.4.4", os: ["linux"], cpu: ["x64"] }),
);
function header(name, data, type = "0") {
  const h = Buffer.alloc(512);
  h.write(name);
  h.write("0000755\0", 100);
  h.write("0000000\0", 108);
  h.write("0000000\0", 116);
  h.write(data.length.toString(8).padStart(11, "0") + "\0", 124);
  h.write("00000000000\0", 136);
  h.fill(32, 148, 156);
  h.write(type, 156);
  h.write("ustar\0", 257);
  h.write("00", 263);
  h.write(
    [...h]
      .reduce((a, b) => a + b, 0)
      .toString(8)
      .padStart(6, "0") + "\0 ",
    148,
  );
  return h;
}
function archive(
  entries = [
    ["package/bin/bun", Buffer.from("synthetic-not-executable")],
    ["package/package.json", pkg],
    ["package/README.md", Buffer.from("offline")],
  ],
) {
  return Buffer.concat([
    ...entries.flatMap(([n, b, t]) => [
      header(n, b, t),
      b,
      Buffer.alloc((512 - (b.length % 512)) % 512),
    ]),
    Buffer.alloc(1024),
  ]);
}
async function envFixture() {
  const dir = await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()), "bun-test-"));
  const commands = path.join(dir, "_runner_file_commands");
  await fs.mkdir(commands, { mode: 0o700 });
  const target = path.join(commands, "add_path_unit");
  await fs.writeFile(target, "", { mode: 0o600 });
  return { dir, target, env: { RUNNER_TEMP: dir, GITHUB_PATH: target } };
}
function response(
  bytes,
  {
    status = 200,
    url = "https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz",
    length = String(bytes.length),
  } = {},
) {
  const r = new Response(bytes, {
    status,
    headers: length === null ? {} : { "content-length": length },
  });
  Object.defineProperty(r, "url", { value: url });
  return r;
}
test("USTAR parser returns only the three approved regular entries", () => {
  const files = sut().parseTar(archive());
  assert.equal(files.size, 3);
  assert.deepEqual(files.get("package/package.json"), pkg);
});
test("USTAR parser rejects traversal absolute backslash duplicate and nonregular entries", () => {
  for (const name of [
    "../bin/bun",
    "/package/bin/bun",
    "package\\bin\\bun",
    "package/bin/bun\0evil",
  ]) {
    const t = archive([
      [name, Buffer.from("x")],
      ["package/package.json", pkg],
      ["package/README.md", Buffer.from("x")],
    ]);
    assert.throws(() => sut().parseTar(t));
  }
  for (const type of ["1", "2", "5", "x", "L", "S", "3"])
    assert.throws(() =>
      sut().parseTar(
        archive([
          ["package/bin/bun", Buffer.from("x"), type],
          ["package/package.json", pkg],
          ["package/README.md", Buffer.from("x")],
        ]),
      ),
    );
  assert.throws(() =>
    sut().parseTar(
      archive([
        ["package/bin/bun", Buffer.from("x")],
        ["package/bin/bun", Buffer.from("y")],
        ["package/package.json", pkg],
      ]),
    ),
  );
});
test("USTAR checksum padding termination and concatenation are enforced", () => {
  const a = archive();
  const checksum = Buffer.from(a);
  checksum[0] ^= 1;
  assert.throws(() => sut().parseTar(checksum));
  const padding = Buffer.from(a);
  padding[512 + 24] = 1;
  assert.throws(() => sut().parseTar(padding));
  assert.throws(() => sut().parseTar(a.subarray(0, a.length - 512)));
  assert.throws(() => sut().parseTar(Buffer.concat([a, archive()])));
  const extra = Buffer.from(a);
  extra[extra.length - 1] = 1;
  assert.throws(() => sut().parseTar(extra));
});
test("gzip parser accepts a complete single member and rejects CRC trailer extra member or garbage", () => {
  const raw = archive(),
    gz = gzipSync(raw);
  assert.deepEqual(sut().decodeGzip(gz), raw);
  const bad = Buffer.from(gz);
  bad[bad.length - 8] ^= 1;
  for (const bytes of [
    bad,
    gz.subarray(0, gz.length - 1),
    Buffer.concat([gz, gz]),
    Buffer.concat([gz, Buffer.from("x")]),
  ])
    assert.throws(() => sut().decodeGzip(bytes));
});
test("package metadata rejects duplicate keys and platform or version substitution", () => {
  sut().validatePackage(pkg);
  for (const text of [
    '{"name":"@oven/bun-linux-x64","name":"other","version":"1.4.4","os":["linux"],"cpu":["x64"]}',
    JSON.stringify({ name: "@oven/bun-linux-x64", version: "1.4.5", os: ["linux"], cpu: ["x64"] }),
    JSON.stringify({ name: "@oven/bun-linux-x64", version: "1.4.4", os: ["darwin"], cpu: ["x64"] }),
  ])
    assert.throws(() => sut().validatePackage(Buffer.from(text)));
});
test("archive and binary pins reject unapproved or modified bytes before execution", () => {
  assert.throws(() => sut().validateArchive(gzipSync(archive())));
  assert.throws(() => sut().validateBinary(Buffer.from("not ELF")));
  assert.throws(() => sut().verifyVersion("1.4.5\n"));
  assert.throws(() => sut().verifyVersion("1.4.4\nextra"));
  sut().verifyVersion("1.4.4\n");
});
test("runner command paths must be canonical regular files bound to runner temp", async () => {
  const f = await envFixture();
  try {
    const valid = await sut().validateEnvironment(f.env);
    assert.equal(valid.runnerTemp, f.dir);
    for (const env of [
      {},
      { ...f.env, RUNNER_TEMP: "relative" },
      { ...f.env, GITHUB_PATH: "relative" },
      { ...f.env, GITHUB_PATH: path.join(f.dir, "outside") },
    ])
      await assert.rejects(sut().validateEnvironment(env));
    await fs.rename(f.target, f.target + ".real");
    await fs.symlink(f.target + ".real", f.target);
    await assert.rejects(sut().validateEnvironment(f.env));
  } finally {
    await fs.rm(f.dir, { recursive: true, force: true });
  }
});
test("runner temp symlink components and hardlinked command files are rejected", async () => {
  const f = await envFixture();
  try {
    const alias = f.dir + "-alias";
    await fs.symlink(f.dir, alias);
    try {
      await assert.rejects(
        sut().validateEnvironment({
          RUNNER_TEMP: alias,
          GITHUB_PATH: path.join(alias, "_runner_file_commands", "add_path_unit"),
        }),
      );
    } finally {
      await fs.unlink(alias);
    }
    await fs.link(f.target, f.target + ".link");
    await assert.rejects(sut().validateEnvironment(f.env));
  } finally {
    await fs.rm(f.dir, { recursive: true, force: true });
  }
});
for (const [label, options] of [
  ["redirect", { status: 302 }],
  ["foreign host", { url: "https://example.invalid/bun.tgz" }],
  ["HTTP504", { status: 504 }],
  ["false length", { length: "7" }],
  ["oversized header", { length: String(64 * 1024 * 1024 + 1) }],
])
  test("download rejects " + label + " without fallback", async (t) => {
    t.mock.method(globalThis, "fetch", async (url, init) => {
      assert.equal(url, "https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz");
      assert.equal(init.redirect, "error");
      return response(Buffer.from("bad"), options);
    });
    await assert.rejects(sut().downloadArchive(new AbortController().signal));
  });
test("streaming byte limit cancels an oversized body even without content length", async (t) => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new Uint8Array(64 * 1024 * 1024));
      c.enqueue(new Uint8Array(1));
    },
    cancel() {
      cancelled = true;
    },
  });
  const r = new Response(stream);
  Object.defineProperty(r, "url", {
    value: "https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz",
  });
  t.mock.method(globalThis, "fetch", async () => r);
  await assert.rejects(sut().downloadArchive(new AbortController().signal));
  assert.equal(cancelled, true);
});
test("installer cannot execute or publish PATH after unverified archive and cleans its own directory", async (t) => {
  const f = await envFixture();
  let executed = false;
  const old = { RUNNER_TEMP: process.env.RUNNER_TEMP, GITHUB_PATH: process.env.GITHUB_PATH };
  Object.assign(process.env, f.env);
  t.mock.method(globalThis, "fetch", async () => response(Buffer.from("unverified")));
  t.mock.method(childProcess, "execFile", () => {
    executed = true;
    throw new Error("canary-secret");
  });
  try {
    await assert.rejects(sut().installPinnedBun());
    assert.equal(executed, false);
    assert.equal(await fs.readFile(f.target, "utf8"), "");
    assert.deepEqual((await fs.readdir(f.dir)).sort(), ["_runner_file_commands"]);
  } finally {
    for (const k of Object.keys(old)) {
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
    }
    await fs.rm(f.dir, { recursive: true, force: true });
  }
});
test("one thirty second deadline aborts acquisition without execution or PATH", async (t) => {
  const f = await envFixture(),
    old = { RUNNER_TEMP: process.env.RUNNER_TEMP, GITHUB_PATH: process.env.GITHUB_PATH };
  Object.assign(process.env, f.env);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(
    globalThis,
    "fetch",
    async (_, { signal }) =>
      new Promise((_, reject) => {
        if (signal.aborted) reject(signal.reason);
        else signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
  );
  try {
    const pending = sut().installPinnedBun();
    t.mock.timers.tick(30001);
    await assert.rejects(pending, { message: "BUN_DEADLINE" });
    assert.equal(await fs.readFile(f.target, "utf8"), "");
  } finally {
    t.mock.timers.reset();
    for (const k of Object.keys(old)) {
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
    }
    await fs.rm(f.dir, { recursive: true, force: true });
  }
});

test("host validation rejects unsupported OS CPU and Node before installing", () => {
  sut().validateHost("linux", "x64", "24.22.1");
  for (const args of [
    ["darwin", "x64", "24.0.0"],
    ["linux", "arm64", "24.0.0"],
    ["linux", "x64", "22.0.0"],
  ])
    assert.throws(() => sut().validateHost(...args));
});
test("seven workflow bootstrap consumers run units and pinned installer before frozen dependencies", async () => {
  const specs = [
    ["contaos-frontend-zero-drift.yml", 1],
    ["contaos-trilha-a-authenticated.yml", 3],
    ["contaos-trilha-a-fixtures.yml", 3],
  ];
  for (const [name, count] of specs) {
    const text = await fs.readFile(
      new URL("../../.github/workflows/" + name, import.meta.url),
      "utf8",
    );
    assert.equal(text.split("node scripts/ci/install-pinned-bun.mjs").length - 1, count, name);
    assert.equal(
      text.split("node --test scripts/ci/install-pinned-bun.test.mjs").length - 1,
      count,
      name,
    );
    assert.equal(text.includes("oven-sh/setup-bun"), false, name);
    assert.ok(
      text.indexOf('node-version: "24"') < text.indexOf("node scripts/ci/install-pinned-bun.mjs"),
      name,
    );
    assert.ok(
      text.indexOf("node scripts/ci/install-pinned-bun.mjs") <
        text.indexOf("bun install --frozen-lockfile"),
      name,
    );
    if (count === 3) {
      const triggers = text.slice(0, text.indexOf("\njobs:"));
      assert.ok(triggers.includes("scripts/ci/install-pinned-bun.mjs"));
      assert.ok(triggers.includes("scripts/ci/install-pinned-bun.test.mjs"));
    }
  }
});

test("USTAR numeric high bits are rejected instead of being masked as ASCII octal", () => {
  const t = archive();
  t[100] |= 128;
  t.fill(32, 148, 156);
  const sum = [...t.subarray(0, 512)].reduce((a, b) => a + b, 0);
  t.write(sum.toString(8).padStart(6, "0") + "\0 ", 148);
  assert.throws(() => sut().parseTar(t));
});
test("failure enums never invoke getters proxies or expose unknown error canaries", () => {
  let reads = 0;
  const error = {
    get message() {
      reads++;
      throw new Error("CANARY_PRIVATE");
    },
  };
  assert.equal(sut().failureCode(error), "BUN_INSTALL_FAILED");
  assert.equal(reads, 0);
  assert.equal(sut().failureCode(new Error("CANARY_PRIVATE")), "BUN_INSTALL_FAILED");
  assert.equal(sut().failureCode(new Error("BUN_DEADLINE")), "BUN_DEADLINE");
  assert.equal(
    sut().failureCode(
      new Proxy(
        {},
        {
          getOwnPropertyDescriptor() {
            throw new Error("CANARY_PRIVATE");
          },
        },
      ),
    ),
    "BUN_INSTALL_FAILED",
  );
});
test("CLI fails with closed technical enum and no canary or arbitrary URL output", () => {
  const script = new URL("./install-pinned-bun.mjs", import.meta.url);
  for (const args of [[], ["https://CANARY_PRIVATE.invalid/override"]]) {
    try {
      childProcess.execFileSync(process.execPath, [script.pathname, ...args], {
        env: { RUNNER_TEMP: "relative", GITHUB_PATH: "relative", TOKEN: "CANARY_PRIVATE" },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      assert.fail("must fail");
    } catch (e) {
      assert.equal(e.status, 1);
      assert.equal(e.stdout, "");
      assert.ok(!e.stderr.includes("CANARY_PRIVATE"));
      const out = JSON.parse(e.stderr);
      assert.equal(out.state, "FAIL");
      assert.ok(["BUN_ENV", "BUN_INSTALL_FAILED"].includes(out.code));
    }
  }
});

const fixtureFetch = globalThis.fetch;
let officialFixture;
async function officialArchiveFixture() {
  if (!officialFixture)
    officialFixture = (async () => {
      const r = await fixtureFetch(
        "https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz",
        { redirect: "error", signal: AbortSignal.timeout(30000) },
      );
      assert.equal(r.status, 200);
      const bytes = Buffer.from(await r.arrayBuffer());
      sut().validateArchive(bytes);
      return bytes;
    })();
  return officialFixture;
}
for (const mode of ["deadline", "swap", "wrong-version"])
  test(
    "verified installer rejects " + mode + " and rolls back only its own publication",
    async (t) => {
      const bytes = await officialArchiveFixture(),
        f = await envFixture();
      const old = { RUNNER_TEMP: process.env.RUNNER_TEMP, GITHUB_PATH: process.env.GITHUB_PATH };
      Object.assign(process.env, f.env);
      const victim = path.join(f.dir, "victim");
      await fs.mkdir(victim);
      await fs.writeFile(path.join(victim, "bun"), "UNVERIFIED_CANARY");
      let clock = 0,
        executions = 0;
      t.mock.method(performance, "now", () => clock);
      t.mock.method(globalThis, "fetch", async () => response(bytes));
      const originalOpen = fs.open.bind(fs);
      t.mock.method(fs, "open", async (name, ...args) => {
        const h = await originalOpen(name, ...args);
        if (mode === "deadline" && name === f.target && args[0] & 1024) {
          const close = h.close.bind(h);
          h.close = async () => {
            await close();
            clock = 30001;
          };
        }
        return h;
      });
      t.mock.method(childProcess, "execFile", (file, args, options, callback) => {
        executions++;
        assert.equal(path.isAbsolute(file), true);
        assert.deepEqual(args, ["--version"]);
        assert.deepEqual(options.env, {});
        assert.equal(options.cwd, path.dirname(file));
        assert.ok(options.timeout <= 30000);
        (async () => {
          if (mode === "swap") {
            await fs.rename(options.cwd, options.cwd + "-original");
            await fs.symlink(victim, options.cwd);
          }
          callback(null, mode === "wrong-version" ? "1.4.5\n" : "1.4.4\n", "");
        })().catch(callback);
      });
      try {
        await assert.rejects(sut().installPinnedBun());
        assert.equal(executions, 1);
        assert.equal(await fs.readFile(f.target, "utf8"), "");
        assert.equal(await fs.readFile(path.join(victim, "bun"), "utf8"), "UNVERIFIED_CANARY");
        await assert.rejects(fs.lstat(path.join(victim, "bunx")), { code: "ENOENT" });
        assert.deepEqual((await fs.readdir(f.dir)).sort(), ["_runner_file_commands", "victim"]);
      } finally {
        for (const k of Object.keys(old)) {
          if (old[k] === undefined) delete process.env[k];
          else process.env[k] = old[k];
        }
        await fs.rm(f.dir, { recursive: true, force: true });
      }
    },
  );

test("gzip output limit refuses a decompression bomb before tar publication", () => {
  const gz = gzipSync(Buffer.alloc(128 * 1024 * 1024 + 1));
  assert.throws(() => sut().decodeGzip(gz), { message: "BUN_GZIP" });
});
