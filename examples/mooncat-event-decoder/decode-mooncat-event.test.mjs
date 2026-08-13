import assert from 'node:assert/strict';
import test from 'node:test';
import { MooncatEventDecoderError, decodeMooncatEvent } from './decode-mooncat-event.mjs';

const CONTRACTS = {
  rescue: { key: 'mooncatRescue', address: '0x60cd862c9C687A9dE49aecdC3A99b74A4fc54aB6' },
  acclimated: { key: 'acclimatedMoonCats', address: '0xc3f733ca98E0daD0386979Eb96fb1722A1A05E69' },
  accessories: { key: 'mooncatAccessories', address: '0x8d33303023723dE93b213da4EB53bE890e747C63' },
  wrapped: { key: 'moonCatsWrapped', address: '0x7C40c393DC0f283F318791d746d894DdD3693572' },
};

const TOPICS = {
  catNamed: '0xaf93a6d1ccdac374cb23b8a45184a5fbcb33c51e4471f69c088ebc18627fbd0f',
  moonCatAcclimated: '0x166a86c03a6732f4f3ef16e479711bbe434ae08a4d9adcfd0beb04d8ea4762f7',
  accessoryApplied: '0xb29ec167f10071d18b40fbdc0ebc48c3ff7067f80dec3b4c9cc820ef491d91cc',
  accessoryCreated: '0x35b015e2255af00e1aaa29c36f7afac7799aacb512ed266fa7fc50d1aa2ed2eb',
  genesisCatsAdded: '0xb18efff3589e0e6e1f1fdd8be3f2d2250429a242997d2a6ac3aa6f7ef1296ca9',
  wrapped: '0x82db4ed538dc0007cca5910a46d167b9ada30509d730f441f8fd8e426b1dbecb',
};

const catId = '0x00958b3253';
const owner = '0x1111111111111111111111111111111111111111';

function word(hex) {
  const body = hex.replace(/^0x/, '');
  assert.equal(body.length, 64);
  return `0x${body}`;
}

function uint(value) {
  return word(BigInt(value).toString(16).padStart(64, '0'));
}

function addressValue(value) {
  return word(`${'0'.repeat(24)}${value.slice(2)}`);
}

function bytes5Value(value) {
  return word(`${value.slice(2)}${'0'.repeat(54)}`);
}

function bytes32Text(value) {
  const bytes = Buffer.from(value, 'utf8').toString('hex');
  return word(`${bytes}${'0'.repeat(64 - bytes.length)}`);
}

function dataWords(...values) {
  return `0x${values.map((value) => uint(value).slice(2)).join('')}`;
}

function dataWordsRaw(...words) {
  return `0x${words.map((value) => value.slice(2)).join('')}`;
}

function log(contract, topics, data, extras = {}) {
  return { address: contract.address, topics, data, ...extras };
}

async function expectCode(request, code) {
  await assert.rejects(
    decodeMooncatEvent(request),
    (error) => error instanceof MooncatEventDecoderError && error.code === code,
  );
}

test('decodes original CatNamed while preserving raw bytes and identifier annotations', async () => {
  const suppliedLog = log(CONTRACTS.rescue, [TOPICS.catNamed, bytes5Value(catId)], bytes32Text('wiggles'), {
    blockNumber: '4140771',
    transactionHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  });
  const result = await decodeMooncatEvent({ contract: CONTRACTS.rescue, log: suppliedLog });

  assert.equal(result.event.signature, 'CatNamed(bytes5,bytes32)');
  assert.equal(result.decoded.catId, catId);
  assert.equal(result.decoded.catName, bytes32Text('wiggles').toLowerCase());
  assert.equal(result.parameters[0].identifierKind, 'mooncatIdBytes5');
  assert.equal(result.parameters[0].raw, suppliedLog.topics[1]);
  assert.deepEqual(result.rawLog, suppliedLog);
  assert.match(result.event.semantics.stateRelationship, /persistent naming state/);
});

test('decodes Acclimation token IDs with their contract-scoped annotation', async () => {
  const result = await decodeMooncatEvent({
    contract: CONTRACTS.acclimated,
    log: log(CONTRACTS.acclimated, [TOPICS.moonCatAcclimated, addressValue(owner)], uint(17)),
  });

  assert.equal(result.event.name, 'MoonCatAcclimated');
  assert.equal(result.decoded.tokenId, '17');
  assert.equal(result.decoded.owner, owner);
  assert.equal(result.parameters[0].identifierKind, 'erc721TokenId');
});

test('decodes WMCR and accessory events without collapsing identifier kinds', async () => {
  const wrapped = await decodeMooncatEvent({
    contract: CONTRACTS.wrapped,
    log: log(CONTRACTS.wrapped, [TOPICS.wrapped, bytes5Value(catId)], uint(42)),
  });
  const applied = await decodeMooncatEvent({
    contract: CONTRACTS.accessories,
    log: log(CONTRACTS.accessories, [TOPICS.accessoryApplied], dataWords(7, 100, 3, 12)),
  });

  assert.equal(wrapped.decoded.catId, catId);
  assert.equal(wrapped.decoded.tokenID, '42');
  assert.equal(wrapped.parameters[1].identifierKind, 'moonCatsWrappedTokenId');
  assert.equal(applied.decoded.accessoryId, '7');
  assert.equal(applied.decoded.rescueOrder, '100');
  assert.equal(applied.decoded.paletteIndex, '3');
  assert.equal(applied.decoded.zIndex, '12');
  assert.equal(applied.parameters[1].identifierKind, 'mooncatRescueOrder');
  assert.equal(applied.parameters[2].identifierKind, 'paletteIndex');
});

test('decodes fixed bytes arrays and bytes30 values from the exact registry shapes', async () => {
  const genesisIds = Array.from({ length: 16 }, (_, index) => `0x${index.toString(16).padStart(2, '0')}00000000`);
  const genesis = await decodeMooncatEvent({
    contract: CONTRACTS.rescue,
    log: log(CONTRACTS.rescue, [TOPICS.genesisCatsAdded], dataWordsRaw(...genesisIds.map(bytes5Value))),
  });
  const created = await decodeMooncatEvent({
    contract: CONTRACTS.accessories,
    log: log(CONTRACTS.accessories, [TOPICS.accessoryCreated], dataWordsRaw(
      uint(3), addressValue(owner), uint(5), uint(10), bytes32Text('hat'),
    )),
  });

  assert.equal(genesis.decoded.catIds.length, 16);
  assert.equal(genesis.decoded.catIds[0], genesisIds[0]);
  assert.equal(genesis.decoded.catIds[15], genesisIds[15]);
  assert.equal(created.decoded.accessoryId, '3');
  assert.equal(created.decoded.name.startsWith('0x686174'), true);
});

test('decodes generic Transfer only in the explicit emitting contract scope', async () => {
  const result = await decodeMooncatEvent({
    contract: CONTRACTS.wrapped,
    log: log(CONTRACTS.wrapped, [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      addressValue('0x0000000000000000000000000000000000000000'),
      addressValue(owner),
      uint(42),
    ], '0x'),
  });

  assert.equal(result.event.name, 'Transfer');
  assert.equal(result.decoded.tokenId, '42');
  assert.equal(result.parameters[2].identifierKind, 'moonCatsWrappedTokenId');
});

test('preserves indexed dynamic values only as non-recoverable topic hashes', async () => {
  const original = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../../data/event-registry.json', import.meta.url), 'utf8'));
  const dynamicEvent = {
    ...original.events.find((event) => event.contractKey === 'mooncatRescue' && event.name === 'CatNamed'),
    key: 'syntheticIndexedDynamic',
    name: 'SyntheticIndexedDynamic',
    signature: 'SyntheticIndexedDynamic(string)',
    topic0: TOPICS.catNamed,
    parameters: [{ position: 0, name: 'value', type: 'string', indexed: true }],
  };
  const fs = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mooncat-event-decoder-'));
  try {
    await fs.mkdir(path.join(tmp, 'data'), { recursive: true });
    await fs.copyFile(new URL('../../data/contract-registry.json', import.meta.url), path.join(tmp, 'data/contract-registry.json'));
    await fs.writeFile(path.join(tmp, 'data/event-registry.json'), JSON.stringify({ ...original, events: [dynamicEvent] }));
    const topicHash = word('1'.repeat(64));
    const result = await decodeMooncatEvent({
      contract: CONTRACTS.rescue,
      log: log(CONTRACTS.rescue, [TOPICS.catNamed, topicHash], '0x'),
    }, { rootDir: tmp });
    assert.deepEqual(result.decoded.value, {
      kind: 'indexed-topic-hash',
      recoverable: false,
      topic: topicHash,
    });
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});

test('rejects unknown, mismatched, and malformed supplied logs', async () => {
  await expectCode({ contract: { key: 'notReviewed', address: CONTRACTS.rescue.address }, log: log(CONTRACTS.rescue, [TOPICS.catNamed], '0x') }, 'UNKNOWN_CONTRACT');
  await expectCode({ contract: { key: CONTRACTS.rescue.key, address: CONTRACTS.wrapped.address }, log: log(CONTRACTS.rescue, [TOPICS.catNamed], '0x') }, 'CONTRACT_ADDRESS_MISMATCH');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.wrapped, [TOPICS.catNamed], '0x') }, 'LOG_CONTRACT_MISMATCH');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, [TOPICS.wrapped], '0x') }, 'UNKNOWN_EVENT_TOPIC');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, ['0x1234'], '0x') }, 'MALFORMED_TOPICS');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, [TOPICS.catNamed, bytes5Value(catId), uint(1)], bytes32Text('x')) }, 'TOPIC_SHAPE_MISMATCH');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, [TOPICS.catNamed, bytes5Value(catId)], '0x12') }, 'MALFORMED_DATA');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, [TOPICS.catNamed, bytes5Value(catId)], dataWords(1, 2)) }, 'DATA_SHAPE_MISMATCH');
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, [TOPICS.catNamed, bytes5Value(catId)], '0x0') }, 'MALFORMED_DATA');
});

test('rejects state assertions and malformed ABI values explicitly', async () => {
  await expectCode({ contract: CONTRACTS.rescue, log: log(CONTRACTS.rescue, [TOPICS.catNamed, bytes5Value(catId)], bytes32Text('x')), assertCurrentState: true }, 'CURRENT_STATE_UNSUPPORTED');
  await expectCode({
    contract: CONTRACTS.acclimated,
    log: log(CONTRACTS.acclimated, [TOPICS.moonCatAcclimated, word('f'.repeat(64))], uint(1)),
  }, 'MALFORMED_VALUE');
});
