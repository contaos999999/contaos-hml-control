import fs from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { inflateRawSync, crc32 } from "node:zlib";
import childProcess from "node:child_process";
import { pathToFileURL } from "node:url";

export const BUN_PIN = Object.freeze({
  version: "1.4.4",
  name: "@oven/bun-linux-x64",
  url: "https://registry.npmjs.org/@oven/bun-linux-x64/-/bun-linux-x64-1.4.4.tgz",
  size: 52418437,
  sri: "sha512-CHbbkmHVM28T1GFq+6GL4Ao4ujwwYwj1CxFFwEFzLanPfNsId9AhbIP0Q4reWuWBkGimUkoQygrK7Rgjtj3vog==",
  sha256: "93ca5a2abe45f3bcac6dd55baff8bb06c4ac824b70f89650b54e5c8b80dbef18",
  binarySize: 107308936,
  binarySha256: "10702245766b225e70bbf6235fd6b47214fd94b4760d00ffaed8ab0df57ac235",
});
const MAX_DOWNLOAD = 64 * 1024 * 1024,
  MAX_UNPACKED = 128 * 1024 * 1024;
const FILES = ["package/bin/bun", "package/package.json", "package/README.md"];
const fail = (code) => {
  throw new Error(code);
};
const hash = (bytes, algorithm = "sha256", encoding = "hex") =>
  createHash(algorithm).update(bytes).digest(encoding);
export function validateHost(
  platform = process.platform,
  arch = process.arch,
  node = process.versions.node,
) {
  if (platform !== "linux" || arch !== "x64" || node.split(".")[0] !== "24") fail("BUN_PLATFORM");
}
const aborted = (signal) => {
  if (signal.aborted) fail("BUN_DEADLINE");
};
export async function downloadArchive(signal) {
  aborted(signal);
  let response,
    reader,
    complete = false;
  try {
    response = await fetch(BUN_PIN.url, { redirect: "error", credentials: "omit", signal });
    if (response.status !== 200 || response.url !== BUN_PIN.url || response.redirected)
      fail("BUN_DOWNLOAD");
    const rawLength = response.headers.get("content-length");
    if (rawLength !== null && !/^(0|[1-9][0-9]*)$/.test(rawLength)) fail("BUN_DOWNLOAD_SIZE");
    const declared = rawLength === null ? null : Number(rawLength);
    if (declared !== null && (!Number.isSafeInteger(declared) || declared > MAX_DOWNLOAD))
      fail("BUN_DOWNLOAD_SIZE");
    if (!response.body) fail("BUN_DOWNLOAD");
    reader = response.body.getReader();
    const chunks = [];
    let count = 0;
    while (true) {
      aborted(signal);
      const next = await reader.read();
      if (next.done) break;
      count += next.value.byteLength;
      if (count > MAX_DOWNLOAD) fail("BUN_DOWNLOAD_SIZE");
      chunks.push(Buffer.from(next.value));
    }
    if (declared !== null && count !== declared) fail("BUN_DOWNLOAD_SIZE");
    aborted(signal);
    complete = true;
    return Buffer.concat(chunks, count);
  } finally {
    if (reader) {
      if (!complete) await reader.cancel().catch(() => {});
      reader.releaseLock();
    } else if (response?.body) await response.body.cancel().catch(() => {});
  }
}
export function decodeGzip(bytes) {
  if (
    !Buffer.isBuffer(bytes) ||
    bytes.length < 18 ||
    bytes[0] !== 31 ||
    bytes[1] !== 139 ||
    bytes[2] !== 8 ||
    bytes[3] !== 0
  )
    fail("BUN_GZIP");
  try {
    const compressed = bytes.subarray(10, -8),
      result = inflateRawSync(compressed, { info: true, maxOutputLength: MAX_UNPACKED }),
      out = result.buffer;
    if (
      result.engine.bytesWritten !== compressed.length ||
      crc32(out) !== bytes.readUInt32LE(bytes.length - 8) ||
      out.length !== bytes.readUInt32LE(bytes.length - 4)
    )
      fail("BUN_GZIP");
    return out;
  } catch {
    fail("BUN_GZIP");
  }
}
function tarText(header, start, end) {
  const b = header.subarray(start, end),
    zero = b.indexOf(0),
    data = zero < 0 ? b : b.subarray(0, zero);
  if ((zero >= 0 && b.subarray(zero).some((x) => x !== 0)) || data.some((x) => x < 32 || x > 126))
    fail("BUN_TAR");
  return data.toString("ascii");
}
function octal(header, start, end) {
  if (header.subarray(start, end).every((x) => x === 0)) return 0;
  if (header.subarray(start, end).some((byte) => byte > 127)) fail("BUN_TAR");
  const value = header.subarray(start, end).toString("ascii");
  if (!/^[0-7]+[ \0]*$/.test(value)) fail("BUN_TAR");
  const n = Number.parseInt(value, 8);
  if (!Number.isSafeInteger(n) || n < 0) fail("BUN_TAR");
  return n;
}
export function parseTar(tar) {
  if (!Buffer.isBuffer(tar) || tar.length > MAX_UNPACKED || tar.length % 512 !== 0) fail("BUN_TAR");
  const result = new Map();
  let offset = 0,
    ended = false;
  while (offset + 512 <= tar.length) {
    const h = tar.subarray(offset, offset + 512);
    if (h.every((x) => x === 0)) {
      if (
        result.size !== 3 ||
        offset + 1024 > tar.length ||
        tar.subarray(offset).some((x) => x !== 0)
      )
        fail("BUN_TAR");
      ended = true;
      break;
    }
    if (
      result.size >= 3 ||
      h.subarray(257, 265).toString("hex") !== "7573746172003030" ||
      h[156] !== 48 ||
      h.subarray(500).some((x) => x !== 0)
    )
      fail("BUN_TAR");
    const sum = octal(h, 148, 156);
    let actual = 0;
    for (let i = 0; i < 512; i++) actual += i >= 148 && i < 156 ? 32 : h[i];
    if (sum !== actual) fail("BUN_TAR");
    const name = tarText(h, 0, 100),
      mode = octal(h, 100, 108),
      size = octal(h, 124, 136);
    octal(h, 108, 116);
    octal(h, 116, 124);
    octal(h, 136, 148);
    if (
      !FILES.includes(name) ||
      result.has(name) ||
      ![0o644, 0o755].includes(mode) ||
      size > MAX_UNPACKED ||
      tarText(h, 157, 257) !== "" ||
      tarText(h, 345, 500) !== ""
    )
      fail("BUN_TAR");
    tarText(h, 265, 297);
    tarText(h, 297, 329);
    for (const field of [
      [329, 337],
      [337, 345],
    ])
      if (h.subarray(...field).some((x) => x !== 0) && octal(h, ...field) !== 0) fail("BUN_TAR");
    const start = offset + 512,
      end = start + size,
      next = start + Math.ceil(size / 512) * 512;
    if (end > tar.length || next > tar.length || tar.subarray(end, next).some((x) => x !== 0))
      fail("BUN_TAR");
    result.set(name, tar.subarray(start, end));
    offset = next;
  }
  if (!ended || FILES.some((name) => !result.has(name))) fail("BUN_TAR");
  return result;
}
function strictJSON(text) {
  let p = 0;
  const ws = () => {
    while (/\s/.test(text[p] || "") && p < text.length) p++;
  };
  const str = () => {
    const start = p++;
    while (p < text.length) {
      const c = text[p++];
      if (c === "\\") {
        p++;
        continue;
      }
      if (c === '"') return JSON.parse(text.slice(start, p));
    }
    fail("BUN_PACKAGE");
  };
  const value = () => {
    ws();
    if (text[p] === "{") {
      p++;
      ws();
      const keys = new Set();
      if (text[p] === "}") {
        p++;
        return;
      }
      while (p < text.length) {
        ws();
        if (text[p] !== '"') fail("BUN_PACKAGE");
        const key = str();
        if (keys.has(key)) fail("BUN_PACKAGE");
        keys.add(key);
        ws();
        if (text[p++] !== ":") fail("BUN_PACKAGE");
        value();
        ws();
        const c = text[p++];
        if (c === "}") return;
        if (c !== ",") fail("BUN_PACKAGE");
      }
      fail("BUN_PACKAGE");
    } else if (text[p] === "[") {
      p++;
      ws();
      if (text[p] === "]") {
        p++;
        return;
      }
      while (p < text.length) {
        value();
        ws();
        const c = text[p++];
        if (c === "]") return;
        if (c !== ",") fail("BUN_PACKAGE");
      }
      fail("BUN_PACKAGE");
    } else if (text[p] === '"') {
      str();
    } else {
      const m = /^(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/.exec(
        text.slice(p),
      );
      if (!m) fail("BUN_PACKAGE");
      p += m[0].length;
    }
  };
  const object = JSON.parse(text);
  value();
  ws();
  if (p !== text.length) fail("BUN_PACKAGE");
  return object;
}
export function validatePackage(bytes) {
  try {
    if (bytes.length > 16384) fail("BUN_PACKAGE");
    const m = strictJSON(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (
      m?.name !== BUN_PIN.name ||
      m.version !== BUN_PIN.version ||
      JSON.stringify(m.os) !== '["linux"]' ||
      JSON.stringify(m.cpu) !== '["x64"]'
    )
      fail("BUN_PACKAGE");
  } catch {
    fail("BUN_PACKAGE");
  }
}
export function validateBinary(bytes) {
  if (
    bytes.length !== BUN_PIN.binarySize ||
    hash(bytes) !== BUN_PIN.binarySha256 ||
    bytes.subarray(0, 4).toString("hex") !== "7f454c46" ||
    bytes[4] !== 2 ||
    bytes[5] !== 1 ||
    bytes.readUInt16LE(18) !== 62
  )
    fail("BUN_BINARY");
}
export function validateArchive(bytes) {
  if (
    !Buffer.isBuffer(bytes) ||
    bytes.length !== BUN_PIN.size ||
    hash(bytes) !== BUN_PIN.sha256 ||
    "sha512-" + hash(bytes, "sha512", "base64") !== BUN_PIN.sri
  )
    fail("BUN_ARCHIVE_INTEGRITY");
  const entries = parseTar(decodeGzip(bytes));
  validatePackage(entries.get("package/package.json"));
  const binary = entries.get("package/bin/bun");
  validateBinary(binary);
  return binary;
}
async function canonicalDirectory(value) {
  if (
    typeof value !== "string" ||
    !path.isAbsolute(value) ||
    path.normalize(value) !== value ||
    /[\r\n\0]/.test(value)
  )
    fail("BUN_ENV");
  let current = path.parse(value).root;
  for (const part of value.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const s = await fs.lstat(current);
    if (s.isSymbolicLink() || !s.isDirectory()) fail("BUN_ENV");
  }
  if ((await fs.realpath(value)) !== value) fail("BUN_ENV");
  return value;
}
const sameIdentity = (a, b) => a.dev === b.dev && a.ino === b.ino;
export async function validateEnvironment(env) {
  const runnerTemp = await canonicalDirectory(env.RUNNER_TEMP),
    file = env.GITHUB_PATH;
  if (
    typeof file !== "string" ||
    !path.isAbsolute(file) ||
    path.normalize(file) !== file ||
    /[\r\n\0]/.test(file) ||
    path.dirname(file) !== path.join(runnerTemp, "_runner_file_commands") ||
    !/^add_path_[a-zA-Z0-9-]+$/.test(path.basename(file))
  )
    fail("BUN_ENV");
  await canonicalDirectory(path.dirname(file));
  const stat = await fs.lstat(file);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    stat.nlink !== 1 ||
    (await fs.realpath(file)) !== file
  )
    fail("BUN_ENV");
  return { runnerTemp, pathFile: file, pathStat: stat };
}
export function verifyVersion(stdout) {
  if (stdout !== "1.4.4\n" && stdout !== "1.4.4") fail("BUN_VERSION");
}
export async function installPinnedBun() {
  validateHost();
  const control = new AbortController(),
    expires = performance.now() + 30000;
  const timer = setTimeout(() => control.abort(), 30000);
  let env = null,
    ownStat = null,
    executableStat = null,
    publication = null;
  let own = null,
    binaryHandle = null,
    pathHandle = null,
    success = false;
  const check = () => {
    aborted(control.signal);
    if (performance.now() >= expires) fail("BUN_DEADLINE");
  };

  const revalidateOwned = async () => {
    check();
    const directory = await fs.lstat(own);
    if (
      !directory.isDirectory() ||
      directory.isSymbolicLink() ||
      !sameIdentity(directory, ownStat) ||
      (directory.mode & 0o777) !== 0o700 ||
      (await fs.realpath(own)) !== own
    )
      fail("BUN_WRITE");
    if (executableStat) {
      const executable = path.join(own, "bun"),
        stat = await fs.lstat(executable);
      if (
        !stat.isFile() ||
        stat.isSymbolicLink() ||
        stat.nlink !== 1 ||
        !sameIdentity(stat, executableStat) ||
        (await fs.realpath(executable)) !== executable
      )
        fail("BUN_WRITE");
    }
    check();
  };
  const rollback = async () => {
    if (!publication) return;
    const h = await fs.open(publication.file, constants.O_RDWR | constants.O_NOFOLLOW);
    try {
      const stat = await h.stat(),
        tail = Buffer.alloc(publication.line.length);
      if (!sameIdentity(stat, publication.stat) || stat.size !== publication.offset + tail.length)
        fail("BUN_WRITE");
      const read = await h.read(tail, 0, tail.length, publication.offset);
      if (read.bytesRead !== tail.length || !tail.equals(publication.line)) fail("BUN_WRITE");
      await h.truncate(publication.offset);
      await h.sync();
      publication = null;
    } finally {
      await h.close();
    }
  };
  const cleanupOwned = async () => {
    if (!own) return;
    // Never recurse through a name whose directory identity changed.
    const named = await fs.lstat(own).catch(() => null);
    if (named?.isSymbolicLink()) await fs.unlink(own);
    if (!ownStat || !env) return;
    for (const name of await fs.readdir(env.runnerTemp)) {
      const candidate = path.join(env.runnerTemp, name),
        stat = await fs.lstat(candidate).catch(() => null);
      if (
        stat?.isDirectory() &&
        !stat.isSymbolicLink() &&
        sameIdentity(stat, ownStat) &&
        (await fs.realpath(candidate)) === candidate
      )
        await fs.rm(candidate, { recursive: true, force: true });
    }
  };
  try {
    env = await validateEnvironment(process.env);
    check();
    const archive = await downloadArchive(control.signal);
    check();
    const binary = validateArchive(archive);
    check();
    // A private directory is not created until the complete archive is verified.
    own = await fs.mkdtemp(path.join(env.runnerTemp, "contaos-bun-"));
    ownStat = await fs.lstat(own);
    await fs.chmod(own, 0o700);
    if ((await fs.realpath(own)) !== own || (await fs.lstat(own)).mode % 512 !== 0o700)
      fail("BUN_WRITE");
    const executable = path.join(own, "bun");
    binaryHandle = await fs.open(
      executable,
      constants.O_CREAT | constants.O_EXCL | constants.O_RDWR | constants.O_NOFOLLOW,
      0o600,
    );
    await binaryHandle.writeFile(binary);
    await binaryHandle.sync();
    check();
    const stored = Buffer.alloc(binary.length);
    const copied = await binaryHandle.read(stored, 0, stored.length, 0);
    if (copied.bytesRead !== stored.length) fail("BUN_WRITE");
    validateBinary(stored);
    const openStat = await binaryHandle.stat(),
      namedStat = await fs.lstat(executable);
    if (
      !openStat.isFile() ||
      openStat.nlink !== 1 ||
      !sameIdentity(openStat, namedStat) ||
      namedStat.isSymbolicLink()
    )
      fail("BUN_WRITE");
    executableStat = openStat;
    await binaryHandle.chmod(0o700);
    await binaryHandle.close();
    binaryHandle = null;
    check();
    if (
      !sameIdentity(openStat, await fs.lstat(executable)) ||
      (await fs.realpath(executable)) !== executable
    )
      fail("BUN_WRITE");
    const stdout = await new Promise((resolve, reject) =>
      childProcess.execFile(
        executable,
        ["--version"],
        {
          env: {},
          cwd: own,
          timeout: Math.max(1, Math.floor(expires - performance.now())),
          signal: control.signal,
          killSignal: "SIGKILL",
          encoding: "utf8",
          maxBuffer: 64,
        },
        (error, out, stderr) =>
          error ? reject(error) : stderr ? reject(new Error("BUN_VERSION")) : resolve(out),
      ),
    );
    check();
    verifyVersion(stdout);
    await revalidateOwned();
    await fs.symlink("bun", path.join(own, "bunx"));
    await revalidateOwned();
    const current = await validateEnvironment(process.env);
    if (
      current.runnerTemp !== env.runnerTemp ||
      current.pathFile !== env.pathFile ||
      !sameIdentity(current.pathStat, env.pathStat)
    )
      fail("BUN_ENV");
    pathHandle = await fs.open(
      env.pathFile,
      constants.O_WRONLY | constants.O_APPEND | constants.O_NOFOLLOW,
    );
    const before = await pathHandle.stat();
    if (!sameIdentity(before, env.pathStat) || before.nlink !== 1) fail("BUN_ENV");
    check();
    try {
      publication = {
        file: env.pathFile,
        stat: before,
        offset: before.size,
        line: Buffer.from(own + "\n"),
      };
      await pathHandle.writeFile(own + "\n", "utf8");
      await pathHandle.sync();
      check();
    } catch (error) {
      await pathHandle.truncate(before.size);
      publication = null;
      throw error;
    }
    await pathHandle.close();
    pathHandle = null;
    await revalidateOwned();
    check();
    success = true;
    return Object.freeze({
      phase: "BUN_BOOTSTRAP",
      state: "PASS",
      version: BUN_PIN.version,
      sha256: BUN_PIN.binarySha256,
    });
  } catch (error) {
    if (control.signal.aborted || performance.now() >= expires) fail("BUN_DEADLINE");
    throw error;
  } finally {
    clearTimeout(timer);
    control.abort();
    if (binaryHandle) await binaryHandle.close().catch(() => {});
    if (pathHandle) await pathHandle.close().catch(() => {});
    if (!success) {
      if (publication) await rollback();
      await cleanupOwned();
    }
  }
}
const codes = new Set([
  "BUN_PLATFORM",
  "BUN_DEADLINE",
  "BUN_DOWNLOAD",
  "BUN_DOWNLOAD_SIZE",
  "BUN_ARCHIVE_INTEGRITY",
  "BUN_GZIP",
  "BUN_TAR",
  "BUN_PACKAGE",
  "BUN_BINARY",
  "BUN_ENV",
  "BUN_WRITE",
  "BUN_VERSION",
]);
export function failureCode(error) {
  let message;
  try {
    message = Object.getOwnPropertyDescriptor(error, "message")?.value;
  } catch {}
  return codes.has(message) ? message : "BUN_INSTALL_FAILED";
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 2) fail("BUN_ENV");
    console.log(JSON.stringify(await installPinnedBun()));
  } catch (error) {
    console.error(
      JSON.stringify({
        phase: "BUN_BOOTSTRAP",
        state: "FAIL",
        code: failureCode(error),
      }),
    );
    process.exitCode = 1;
  }
}
