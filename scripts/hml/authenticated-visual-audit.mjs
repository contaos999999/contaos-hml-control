import { readFile, mkdir, writeFile, appendFile, lstat, rm, readdir } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { connect } from "node:net";
import ts from "typescript";

const require = createRequire(import.meta.url);
const parse5 = createRequire(require.resolve("jsdom"))("parse5");
export const HML_ORIGIN = "https://contaos-41-hml.vercel.app";
export const API_ORIGIN = "https://gklhhhyosgasnyoxlrui.supabase.co";
const FENCE_COMMANDS = new Set([
  "Target.getTargetInfo",
  "Target.autoAttachRelated",
  "Target.setAutoAttach",
  "Runtime.runIfWaitingForDebugger",
  "Page.enable",
  "Page.getFrameTree",
  "Network.enable",
  "Network.setCacheDisabled",
  "Network.setBlockedURLs",
  "Fetch.enable",
  "Fetch.continueRequest",
  "Fetch.getResponseBody",
  "Fetch.fulfillRequest",
  "Fetch.continueResponse",
  "Fetch.failRequest",
]);
const WIDTHS = [1440, 1280, 768, 390];
const THEMES = ["light", "dark"];
export const PRIVATE_SURFACES = [
  "SYS04",
  "SYS05",
  "ADM01",
  "V101",
  "V102",
  "V103",
  "V104",
  "V105",
  "V106",
  "V107",
  "V108",
  "V109",
  "V110",
  "V111",
  "V112",
  "V113",
  "V114",
  "V115",
  "V116",
  "V117",
  "V118",
  "V¶»§q«^