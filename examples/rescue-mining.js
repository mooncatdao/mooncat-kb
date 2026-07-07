/*
 * Wallet-free MoonCat normal rescue seed search example.
 *
 * Dependency note:
 *   Pass an Ethereum-compatible keccak256 implementation as `keccak256`.
 *   It must hash raw bytes equivalent to Solidity packed bytes32 seed plus
 *   bytes32 searchSeed and return a 32-byte hash as hex or bytes.
 *
 * This snippet does not submit transactions, use a wallet, or require network
 * access. It stops before the original browser's mcr.rescueCat(seed) boundary.
 */

"use strict";

const ORIGINAL_SEARCH_SEED =
  "0xd14b1349b8662386a0002c6dbc7f8ced11312226af1da67a1be7b28f66fed6cd";

function findValidNormalMoonCatSeed(options) {
  const {
    searchSeed = ORIGINAL_SEARCH_SEED,
    keccak256,
    nextSeed = randomSeed32,
    maxIterations = Infinity
  } = options || {};

  if (typeof keccak256 !== "function") {
    throw new TypeError("findValidNormalMoonCatSeed requires a keccak256 function");
  }

  const searchSeedBytes = hexToBytes32(searchSeed, "searchSeed");
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations += 1;

    const seedBytes = bytes32From(nextSeed(), "seed");
    const hash = normalizeHash(keccak256(concatBytes(seedBytes, searchSeedBytes)));

    if (hash.slice(2, 8) === "000000") {
      return {
        seed: bytesToHex(seedBytes),
        hash,
        catId: `0x00${hash.slice(-8)}`,
        iterations
      };
    }
  }

  return null;
}

function randomSeed32() {
  const bytes = new Uint8Array(32);

  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  if (typeof require === "function") {
    return require("crypto").randomBytes(32);
  }

  throw new Error("No random byte source available; provide nextSeed");
}

function hexToBytes32(value, label) {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a hex string`);
  }

  const hex = value.startsWith("0x") ? value.slice(2) : value;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(`${label} must be 32 bytes`);
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytes32From(value, label) {
  if (typeof value === "string") {
    return hexToBytes32(value, label);
  }

  if (!value || typeof value.length !== "number" || value.length !== 32) {
    throw new Error(`${label} must be 32 bytes`);
  }

  return Uint8Array.from(value);
}

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function normalizeHash(value) {
  if (typeof value === "string") {
    const hash = value.startsWith("0x") ? value : `0x${value}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      throw new Error("keccak256 returned an invalid 32-byte hash hex string");
    }
    return hash.toLowerCase();
  }

  if (!value || typeof value.length !== "number" || value.length !== 32) {
    throw new Error("keccak256 must return 32 bytes or a 32-byte hash hex string");
  }

  return bytesToHex(value);
}

function bytesToHex(bytes) {
  return `0x${Array.from(bytes, function toHex(byte) {
    return byte.toString(16).padStart(2, "0");
  }).join("")}`;
}

module.exports = {
  ORIGINAL_SEARCH_SEED,
  findValidNormalMoonCatSeed
};
