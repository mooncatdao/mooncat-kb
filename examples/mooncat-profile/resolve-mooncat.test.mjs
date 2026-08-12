import assert from 'node:assert/strict';
import test from 'node:test';
import { MooncatProfileResolverError, resolveMooncat } from './resolve-mooncat.mjs';

async function expectCode(input, code) {
  await assert.rejects(
    resolveMooncat(input),
    (error) => error instanceof MooncatProfileResolverError && error.code === code,
  );
}

test('resolves rescue-order boundary rows from the committed shards', async () => {
  const first = await resolveMooncat({ kind: 'rescueOrder', value: 0 });
  const last = await resolveMooncat({ kind: 'rescueOrder', value: 25439 });

  assert.equal(first.row.rescueOrder, 0);
  assert.equal(first.row.catId, '0x00d658d50b');
  assert.equal(first.row.name, null);
  assert.equal(last.row.rescueOrder, 25439);
  assert.equal(last.row.catId, '0x0076fe2589');
  assert.equal(first.provenance.manifestPath, 'data/mooncat-population/manifest.json');
  assert.equal(first.provenance.shardPath, 'data/mooncat-population/shards/00000-00999.json');
});

test('resolves a Genesis row and preserves its existing fields', async () => {
  const result = await resolveMooncat({ kind: 'rescueOrder', value: 84 });

  assert.equal(result.row.catId, '0xff00000ca7');
  assert.equal(result.row.genesis, true);
  assert.deepEqual(result.row.rescueBuckets, ['day1', 'genesis', 'rescued2017', 'sub100', 'week1']);
  assert.equal(result.provenance.fieldProvenance.genesis.trust, 'canonical-membership');
});

test('resolves named and unnamed rows by normalized catIdBytes5', async () => {
  const named = await resolveMooncat({ kind: 'catIdBytes5', value: '0x00958B3253' });
  const unnamed = await resolveMooncat({ kind: 'catIdBytes5', value: '0x00D658D50B' });

  assert.equal(named.identifier.normalizedValue, '0x00958b3253');
  assert.equal(named.row.rescueOrder, 100);
  assert.equal(named.row.name.text, 'wiggles');
  assert.equal(unnamed.row.rescueOrder, 0);
  assert.equal(unnamed.row.name, null);
});

test('does not add live-state fields or a competing profile schema', async () => {
  const result = await resolveMooncat({ kind: 'rescueOrder', value: 100 });

  assert.equal(result.row.owner, undefined);
  assert.equal(result.row.accessories, undefined);
  assert.equal(result.row.price, undefined);
  assert.equal(result.provenance.exclusions.includes('live API/RPC/chain state'), true);
});

test('rejects malformed and unknown Cat IDs', async () => {
  await expectCode({ kind: 'catIdBytes5', value: '0x1234' }, 'INVALID_CAT_ID');
  await expectCode({ kind: 'catIdBytes5', value: '0X00958b3253' }, 'INVALID_CAT_ID');
  await expectCode({ kind: 'catIdBytes5', value: '0xgg958b3253' }, 'INVALID_CAT_ID');
  await expectCode({ kind: 'catIdBytes5', value: '0x0000000000' }, 'UNKNOWN_CAT_ID');
});

test('rejects invalid rescue orders and numeric text', async () => {
  await expectCode({ kind: 'rescueOrder', value: -1 }, 'INVALID_RESCUE_ORDER');
  await expectCode({ kind: 'rescueOrder', value: 25440 }, 'INVALID_RESCUE_ORDER');
  await expectCode({ kind: 'rescueOrder', value: 1.5 }, 'INVALID_RESCUE_ORDER');
  await expectCode({ kind: 'rescueOrder', value: '0' }, 'INVALID_RESCUE_ORDER');
});

test('rejects bare, generic, and unsupported identifier kinds', async () => {
  await expectCode(0, 'INVALID_INPUT');
  await expectCode({ value: 0 }, 'INVALID_INPUT');
  await expectCode({ kind: 'tokenId', value: 0 }, 'UNSUPPORTED_IDENTIFIER_KIND');
  await expectCode({ kind: 'wmcrTokenId', value: 0 }, 'UNSUPPORTED_IDENTIFIER_KIND');
  await expectCode({ kind: 'accessoryId', value: 0 }, 'UNSUPPORTED_IDENTIFIER_KIND');
});

