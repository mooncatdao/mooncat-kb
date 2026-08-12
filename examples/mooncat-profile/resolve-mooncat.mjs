import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const CAT_ID_PATTERN = /^0x[0-9a-fA-F]{10}$/;
const SUPPORTED_KINDS = new Set(['catIdBytes5', 'rescueOrder']);

export class MooncatProfileResolverError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'MooncatProfileResolverError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new MooncatProfileResolverError(code, message);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail('INVALID_ARTIFACT', `Invalid JSON artifact: ${filePath}`);
    }
    fail('MISSING_ARTIFACT', `Unable to read local artifact: ${filePath}`);
  }
}

function containedPath(rootDir, relativePath) {
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    fail('INVALID_ARTIFACT', `Manifest path escapes the repository root: ${relativePath}`);
  }
  return resolved;
}

function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    fail('INVALID_INPUT', 'Expected an object tagged with catIdBytes5 or rescueOrder.');
  }
  const { kind, value } = input;
  if (!SUPPORTED_KINDS.has(kind)) {
    if (typeof kind === 'string') {
      fail('UNSUPPORTED_IDENTIFIER_KIND', `Unsupported identifier kind: ${kind}`);
    }
    fail('INVALID_INPUT', 'Expected an object tagged with catIdBytes5 or rescueOrder.');
  }

  if (kind === 'catIdBytes5') {
    if (typeof value !== 'string' || !CAT_ID_PATTERN.test(value)) {
      fail('INVALID_CAT_ID', 'catIdBytes5 must use a lowercase 0x prefix and exactly five hexadecimal bytes.');
    }
    return { kind, value, normalizedValue: value.toLowerCase() };
  }

  if (!Number.isInteger(value) || value < 0 || value > 25439) {
    fail('INVALID_RESCUE_ORDER', 'rescueOrder must be an integer in the inclusive range 0..25439.');
  }
  return { kind, value, normalizedValue: value };
}

function validateManifest(manifest) {
  const shards = manifest?.layout?.shards;
  if (!Array.isArray(shards) || manifest.rowCount !== 25440) {
    fail('INVALID_ARTIFACT', 'Population manifest is missing the expected 25,440-row shard layout.');
  }
  return shards;
}

function shardForOrder(shards, rescueOrder) {
  const shard = shards.find((candidate) => (
    rescueOrder >= candidate.startRescueOrder && rescueOrder <= candidate.endRescueOrder
  ));
  if (!shard) {
    fail('INVALID_ARTIFACT', `No population shard covers rescueOrder ${rescueOrder}.`);
  }
  return shard;
}

function rowFromShard(shardData, predicate) {
  if (!Array.isArray(shardData?.rows)) {
    fail('INVALID_ARTIFACT', 'Population shard is missing its rows array.');
  }
  return shardData.rows.find(predicate);
}

function provenanceFor(manifest, shardPath) {
  return {
    manifestPath: 'data/mooncat-population/manifest.json',
    shardPath,
    scope: manifest.scope,
    sourceRefs: manifest.sourceRefs,
    fieldProvenance: manifest.fieldProvenance,
    exclusions: manifest.exclusions,
  };
}

/**
 * Resolve one explicitly tagged static identifier against the committed
 * population manifest and rescue-order shards. This function performs no
 * network or contract calls and returns the generated row without reshaping it.
 */
export async function resolveMooncat(input, { rootDir = DEFAULT_ROOT } = {}) {
  const identifier = validateInput(input);
  const manifest = await readJson(path.join(rootDir, 'data/mooncat-population/manifest.json'));
  const shards = validateManifest(manifest);
  let row;
  let shard;

  if (identifier.kind === 'rescueOrder') {
    shard = shardForOrder(shards, identifier.normalizedValue);
    const shardPath = containedPath(rootDir, shard.path);
    const shardData = await readJson(shardPath);
    row = rowFromShard(shardData, (candidate) => candidate.rescueOrder === identifier.normalizedValue);
  } else {
    for (const candidateShard of shards) {
      const shardPath = containedPath(rootDir, candidateShard.path);
      const shardData = await readJson(shardPath);
      row = rowFromShard(shardData, (candidate) => candidate.catId === identifier.normalizedValue);
      if (row) {
        shard = candidateShard;
        break;
      }
    }
  }

  if (!row || !shard) {
    fail(identifier.kind === 'catIdBytes5' ? 'UNKNOWN_CAT_ID' : 'UNKNOWN_RESCUE_ORDER',
      `No committed population row matches ${identifier.kind} ${identifier.value}.`);
  }

  return {
    identifier,
    row,
    provenance: provenanceFor(manifest, shard.path),
  };
}

