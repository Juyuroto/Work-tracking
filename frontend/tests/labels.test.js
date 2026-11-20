import test from 'node:test';
import assert from 'node:assert/strict';
import * as labels from '../src/lib/labels.js';

test('chaque liste : valeurs uniques, libellés non vides', () => {
  const lists = Object.values(labels).filter(Array.isArray);
  assert.ok(lists.length >= 3);
  for (const list of lists) {
    assert.equal(new Set(list.map((i) => i.value)).size, list.length);
    for (const { value, label } of list) {
      assert.ok(value && label);
    }
  }
});

test('statuts de candidature', () => {
  assert.equal(labels.APPLICATION_STATUSES[0].value, 'a_postuler');
  assert.equal(labels.APPLICATION_STATUSES.length, 7);
});
