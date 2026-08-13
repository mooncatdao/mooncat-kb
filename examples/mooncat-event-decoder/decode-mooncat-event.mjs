import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const HEX_WORD = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HEX_DATA = /^0x(?:[0-9a-fA-F]{2})*$/;

export class MooncatEventDecoderError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'MooncatEventDecoderError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new MooncatEventDecoderError(code, message);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail('INVALID_ARTIFACT', `Invalid JSON registry artifact: ${filePath}`);
    }
    fail('MISSING_ARTIFACT', `Unable to read local registry artifact: ${filePath}`);
  }
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function requireRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    fail('INVALID_INPUT', 'Expected { contract: { key, address }, log }.');
  }
  if (request.assertCurrentState === true || request.requireCurrentState === true) {
    fail('CURRENT_STATE_UNSUPPORTED', 'Decoded event logs are historical evidence, not current-state proof.');
  }
  const contract = request.contract;
  const log = request.log;
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    fail('INVALID_CONTRACT_CONTEXT', 'Explicit contract context must include a reviewed key and address.');
  }
  if (typeof contract.key !== 'string' || typeof contract.address !== 'string') {
    fail('INVALID_CONTRACT_CONTEXT', 'Explicit contract context must include a reviewed key and address.');
  }
  if (!ADDRESS.test(contract.address)) {
    fail('INVALID_CONTRACT_CONTEXT', 'Contract context address must be a 20-byte hexadecimal address.');
  }
  if (!log || typeof log !== 'object' || Array.isArray(log)) {
    fail('INVALID_LOG', 'A supplied Ethereum log object is required.');
  }
  if (!ADDRESS.test(log.address)) {
    fail('MALFORMED_LOG', 'Log address must be a 20-byte hexadecimal address.');
  }
  if (!Array.isArray(log.topics) || log.topics.length === 0 || !log.topics.every((topic) => typeof topic === 'string' && HEX_WORD.test(topic))) {
    fail('MALFORMED_TOPICS', 'Log topics must be a non-empty array of 32-byte hexadecimal words.');
  }
  if (typeof log.data !== 'string' || !HEX_DATA.test(log.data)) {
    fail('MALFORMED_DATA', 'Log data must be an even-length hexadecimal byte string.');
  }
  return { contract, log };
}

function parseType(type) {
  const fixedArray = /^(.*)\[(\d+)\]$/.exec(type);
  if (fixedArray) {
    const length = Number(fixedArray[2]);
    if (!Number.isSafeInteger(length) || length < 1) {
      fail('UNSUPPORTED_ABI_TYPE', `Unsupported fixed-array ABI type: ${type}`);
    }
    const base = parseType(fixedArray[1]);
    if (base.dynamic) {
      fail('UNSUPPORTED_ABI_TYPE', `Dynamic fixed-array ABI type is unsupported: ${type}`);
    }
    return { kind: 'fixed-array', base, length, words: base.words * length, dynamic: false };
  }
  if (type === 'address') return { kind: 'address', words: 1, dynamic: false };
  if (type === 'bool') return { kind: 'bool', words: 1, dynamic: false };
  const uint = /^uint(\d*)$/.exec(type);
  if (uint) {
    const width = uint[1] ? Number(uint[1]) : 256;
    if (width < 8 || width > 256 || width % 8 !== 0) {
      fail('UNSUPPORTED_ABI_TYPE', `Unsupported unsigned integer ABI type: ${type}`);
    }
    return { kind: 'uint', width, words: 1, dynamic: false };
  }
  const bytes = /^bytes(\d+)$/.exec(type);
  if (bytes) {
    const length = Number(bytes[1]);
    if (length < 1 || length > 32) {
      fail('UNSUPPORTED_ABI_TYPE', `Unsupported fixed-bytes ABI type: ${type}`);
    }
    return { kind: 'fixed-bytes', length, words: 1, dynamic: false };
  }
  if (type === 'bytes' || type === 'string' || type.endsWith('[]') || type.startsWith('tuple')) {
    return { kind: 'dynamic', words: null, dynamic: true };
  }
  fail('UNSUPPORTED_ABI_TYPE', `Unsupported ABI type: ${type}`);
}

function lowerWord(word) {
  return `0x${word.slice(2).toLowerCase()}`;
}

function decodeWord(word, type, { indexed = false } = {}) {
  const parsed = parseType(type);
  if (parsed.dynamic) {
    if (indexed) {
      return { kind: 'indexed-topic-hash', recoverable: false, topic: lowerWord(word) };
    }
    fail('UNSUPPORTED_ABI_TYPE', `Non-indexed dynamic ABI value is unsupported: ${type}`);
  }
  if (parsed.kind === 'fixed-array') {
    const values = [];
    for (let index = 0; index < parsed.length; index += 1) {
      const start = index * parsed.base.words;
      if (parsed.base.words !== 1) {
        fail('UNSUPPORTED_ABI_TYPE', `Nested ABI array value is unsupported: ${type}`);
      }
      values.push(decodeWord(word[start], type.slice(0, type.lastIndexOf('[')), { indexed }));
    }
    return values;
  }
  const normalized = lowerWord(word);
  const body = normalized.slice(2);
  if (parsed.kind === 'address') {
    if (!/^0{24}/.test(body)) fail('MALFORMED_VALUE', 'ABI address word has non-zero leading padding.');
    return `0x${body.slice(-40)}`;
  }
  if (parsed.kind === 'bool') {
    const numeric = BigInt(normalized);
    if (numeric !== 0n && numeric !== 1n) fail('MALFORMED_VALUE', 'ABI bool word must encode zero or one.');
    return numeric === 1n;
  }
  if (parsed.kind === 'uint') {
    const numeric = BigInt(normalized);
    if (numeric >= (1n << BigInt(parsed.width))) fail('MALFORMED_VALUE', `ABI ${type} value exceeds its declared width.`);
    return numeric.toString(10);
  }
  if (parsed.kind === 'fixed-bytes') {
    const valueEnd = parsed.length * 2;
    if (!/^0*$/.test(body.slice(valueEnd))) fail('MALFORMED_VALUE', `ABI ${type} word has non-zero trailing padding.`);
    return `0x${body.slice(0, valueEnd)}`;
  }
  fail('UNSUPPORTED_ABI_TYPE', `Unsupported ABI type: ${type}`);
}

function wordsFromData(data) {
  const body = data.slice(2);
  if (body.length % 64 !== 0) fail('MALFORMED_DATA', 'Log data must contain complete 32-byte ABI words.');
  return body.match(/.{64}/g)?.map((word) => `0x${word}`) ?? [];
}

function parameterMetadata(parameter) {
  return {
    position: parameter.position,
    name: parameter.name,
    type: parameter.type,
    indexed: parameter.indexed,
    ...(parameter.identifierKind ? { identifierKind: parameter.identifierKind } : {}),
  };
}

function findContract(registry, context) {
  const contract = registry.contracts.find((candidate) => candidate.key === context.key);
  if (!contract) fail('UNKNOWN_CONTRACT', `Unknown reviewed contract key: ${context.key}`);
  if (contract.abiStatus !== 'exact-local-abi-extracted') {
    fail('UNSUPPORTED_CONTRACT', `Contract ${context.key} does not have an exact local ABI artifact.`);
  }
  if (contract.address.toLowerCase() !== context.address.toLowerCase()) {
    fail('CONTRACT_ADDRESS_MISMATCH', `Contract key ${context.key} does not match the supplied reviewed address.`);
  }
  return contract;
}

function decodeEvent(event, log) {
  if (event.anonymous) fail('UNSUPPORTED_EVENT', 'Anonymous events are not supported by this topic0 decoder.');
  const indexed = event.parameters.filter((parameter) => parameter.indexed);
  if (log.topics.length !== indexed.length + 1) {
    fail('TOPIC_SHAPE_MISMATCH', `Event ${event.signature} expects ${indexed.length + 1} topics.`);
  }
  if (log.topics[0].toLowerCase() !== event.topic0.toLowerCase()) {
    fail('UNKNOWN_EVENT_TOPIC', `Topic0 does not identify an event on ${event.contractKey}.`);
  }
  const dataWords = wordsFromData(log.data);
  const nonIndexedParameters = event.parameters.filter((parameter) => !parameter.indexed);
  const parsedNonIndexed = nonIndexedParameters.map((parameter) => ({
    parameter,
    parsed: parseType(parameter.type),
  }));
  if (parsedNonIndexed.some(({ parsed }) => parsed.dynamic)) {
    fail('UNSUPPORTED_ABI_TYPE', 'Non-indexed dynamic ABI event values are unsupported.');
  }
  const expectedDataWords = parsedNonIndexed.reduce((total, { parsed }) => total + parsed.words, 0);
  if (dataWords.length !== expectedDataWords) {
    fail('DATA_SHAPE_MISMATCH', `Event ${event.signature} expects ${expectedDataWords} non-indexed ABI words.`);
  }

  let topicIndex = 1;
  let dataIndex = 0;
  const decoded = {};
  const parameters = event.parameters.map((parameter) => {
    const parsed = parseType(parameter.type);
    const sourceWords = parameter.indexed
      ? [log.topics[topicIndex++]]
      : dataWords.slice(dataIndex, dataIndex + parsed.words);
    if (!parameter.indexed) dataIndex += parsed.words;
    const raw = parsed.words === 1 ? sourceWords[0] : sourceWords;
    const value = parameter.indexed || parsed.words === 1
      ? decodeWord(sourceWords[0], parameter.type, { indexed: parameter.indexed })
      : decodeWord(sourceWords, parameter.type, { indexed: parameter.indexed });
    if (Object.hasOwn(decoded, parameter.name)) fail('INVALID_ARTIFACT', `Event has duplicate parameter name: ${parameter.name}`);
    decoded[parameter.name] = value;
    return { ...parameterMetadata(parameter), raw, decoded: value };
  });

  return { decoded, parameters };
}

/**
 * Decode one already-supplied Ethereum log using only the reviewed local
 * contract and event registries. No network, RPC, history scan, or state read
 * is performed.
 */
export async function decodeMooncatEvent(request, { rootDir = DEFAULT_ROOT } = {}) {
  const { contract: context, log } = requireRequest(request);
  const [contractRegistry, eventRegistry] = await Promise.all([
    readJson(path.join(rootDir, 'data/contract-registry.json')),
    readJson(path.join(rootDir, 'data/event-registry.json')),
  ]);
  const contract = findContract(contractRegistry, context);
  if (contract.address.toLowerCase() !== log.address.toLowerCase()) {
    fail('LOG_CONTRACT_MISMATCH', 'Log address does not match the explicit reviewed contract context.');
  }
  const topic0 = log.topics[0].toLowerCase();
  const event = eventRegistry.events.find((candidate) => (
    candidate.contractKey === contract.key && candidate.topic0.toLowerCase() === topic0
  ));
  if (!event) fail('UNKNOWN_EVENT_TOPIC', `Unknown topic0 for reviewed contract ${contract.key}.`);
  const result = decodeEvent(event, log);
  return {
    contract: {
      key: contract.key,
      name: contract.name,
      address: contract.address,
      classification: contract.classification,
      abiStatus: contract.abiStatus,
    },
    event: {
      key: event.key,
      name: event.name,
      signature: event.signature,
      topic0: event.topic0,
      category: event.category,
      mooncatSpecific: event.mooncatSpecific,
      semantics: cloneJson(event.semantics),
      parameters: event.parameters.map(parameterMetadata),
    },
    rawLog: cloneJson(log),
    parameters: result.parameters,
    decoded: result.decoded,
  };
}
