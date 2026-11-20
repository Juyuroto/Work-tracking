import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatShortDate, formatPercent, plural, localToday, labelOf } from '../src/lib/format.js';

test('formatDate / formatShortDate : date ISO, vide si invalide', () => {
  assert.equal(formatDate('2026-03-05'), '5 mars 2026');
  assert.equal(formatDate('2026-03-05T23:30:00'), '5 mars 2026');
  assert.equal(formatShortDate('2026-03-05'), '05/03');
  for (const bad of [null, undefined, '', 'nimporte quoi']) {
    assert.equal(formatDate(bad), '');
    assert.equal(formatShortDate(bad), '');
  }
});

test('formatPercent', () => {
  assert.equal(formatPercent(null), '—');
  assert.equal(formatPercent(undefined), '—');
  assert.match(formatPercent(0.5), /^50\s%$/);
  assert.match(formatPercent(0), /^0\s%$/);
});

test('plural', () => {
  assert.equal(plural(0, 'mot'), '0 mot');
  assert.equal(plural(1, 'mot'), '1 mot');
  assert.equal(plural(2, 'mot'), '2 mots');
});

test('localToday : date locale, pas UTC', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 0, 2, 0, 30) });
  assert.equal(localToday(), '2026-01-02');
  assert.match(localToday(), /^\d{4}-\d{2}-\d{2}$/);
});

test('labelOf', () => {
  const list = [{ value: 'a', label: 'A' }];
  assert.equal(labelOf(list, 'a'), 'A');
  assert.equal(labelOf(list, 'z'), 'z');
});
