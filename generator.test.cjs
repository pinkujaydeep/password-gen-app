const test = require('node:test');
const assert = require('node:assert/strict');
const { randomIndex, compactPassword, passphrase, randomPassword } = require('./generator.js');

const dictionary = Array.from({ length: 1296 }, (_, index) => {
  let suffix = '';
  for (let position = 0; position < 3; position++) {
    suffix += String.fromCharCode(97 + index % 26);
    index = Math.floor(index / 26);
  }
  return `word${suffix}`;
});

test('passphrases retain every complete word and report only word-selection entropy', () => {
  for (const count of [5, 6, 10]) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = passphrase({ words: count, separator: '.', capitalize: false, numbers: true, symbols: true }, dictionary);
      assert.equal(result.words.length, count);
      assert.ok(result.words.every(word => dictionary.includes(word)));
      assert.ok(result.password.startsWith(result.words.join('.')));
      assert.match(result.password, /\d{2}[!@#$%^&*?]$/);
      assert.equal(result.bits, count * Math.log2(dictionary.length));
      assert.ok(result.password.length > 16);
    }
  }
});

test('random passwords meet all selected classes and exact lengths', () => {
  for (const length of [8, 9, 10, 11, 12, 13, 14, 15, 16]) {
    for (const numbers of [false, true]) {
      for (const symbols of [false, true]) {
        for (const excludeAmbiguous of [false, true]) {
          for (let attempt = 0; attempt < 40; attempt++) {
            const result = randomPassword({ length, numbers, symbols, excludeAmbiguous });
            assert.equal(result.password.length, length);
            assert.match(result.password, /[a-z]/);
            assert.match(result.password, /[A-Z]/);
            assert.equal(/[0-9]/.test(result.password), numbers);
            assert.equal(/[!@#$%^&*?]/.test(result.password), symbols);
            if (excludeAmbiguous) assert.doesNotMatch(result.password, /[Il1O0o]/);
            assert.ok(Number.isFinite(result.bits) && result.bits > 40);
          }
        }
      }
    }
  }
});

test('invalid inputs fail closed', () => {
  for (const maximum of [0, -1, 1.5, NaN, 0x100000001]) assert.throws(() => randomIndex(maximum));
  for (const length of [7, 17, 8.5, NaN]) {
    assert.throws(() => randomPassword({ length }));
    assert.throws(() => compactPassword(dictionary, length));
  }
  assert.throws(() => passphrase({ words: 4, separator: '.' }, dictionary));
  assert.throws(() => passphrase({ words: 6, separator: '.' }, ['tiny']));
  assert.throws(() => passphrase({ words: 6, separator: '' }, dictionary));
  assert.throws(() => passphrase({ words: 6, separator: '.' }, [...dictionary, dictionary[0]]));
});

test('rejection sampling discards biased tail values', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  let calls = 0;
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
    getRandomValues(buffer) { buffer[0] = calls++ === 0 ? 0xffffffff : 7; return buffer; }
  } });
  try {
    assert.equal(randomIndex(10), 7);
    assert.equal(calls, 2);
  } finally { Object.defineProperty(globalThis, 'crypto', original); }
});

test('missing Web Crypto does not fall back to insecure randomness', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined });
  try { assert.throws(() => randomIndex(10), /Secure randomness/); }
  finally { Object.defineProperty(globalThis, 'crypto', original); }
});

test('bundled EFF list has 7,776 unique entries and six-word passphrases exceed 77 bits', () => {
  require('./wordlist.js');
  assert.equal(globalThis.PASSKEE_WORDS.length, 7776);
  assert.equal(new Set(globalThis.PASSKEE_WORDS).size, 7776);
  const result = passphrase({ words: 6, separator: ' ', capitalize: true, numbers: true, symbols: false }, globalThis.PASSKEE_WORDS);
  assert.ok(result.bits > 77);
  assert.equal(result.password.split(' ').length, 6);
});

test('compact passwords meet every 8-16 character length with whole words and shuffled pieces', () => {
  require('./wordlist.js');
  const words = globalThis.PASSKEE_WORDS;
  const patterns = new Set();
  for (const length of [8, 9, 10, 11, 12, 13, 14, 15, 16]) {
    const wordLength = Math.min(6, Math.floor((length - 2) / 2));
    const digitCount = length - wordLength * 2 - 1;
    const candidates = words.filter(word => /^[a-z]+$/.test(word) && word.length === wordLength);
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = compactPassword(words, length);
      assert.equal(result.password.length, length);
      assert.doesNotMatch(result.password, /\s/);
      const tokens = result.password.match(/[A-Z][a-z]+|[!@#$%^&*?]|\d+/g);
      assert.equal(tokens.length, 4);
      assert.equal(tokens.join(''), result.password);
      assert.equal(tokens.filter(token => /^[A-Z]/.test(token)).length, 2);
      assert.equal(tokens.filter(token => /^\d+$/.test(token) && token.length === digitCount).length, 1);
      assert.equal(tokens.filter(token => /^[!@#$%^&*?]$/.test(token)).length, 1);
      assert.ok(result.words.every(word => candidates.includes(word)));
      assert.deepEqual(tokens.filter(token => /^[A-Z]/.test(token)).map(word => word.toLowerCase()).sort(), [...result.words].sort());
      assert.equal(result.bits, 2 * Math.log2(candidates.length) + Math.log2(9) + digitCount * Math.log2(10));
      assert.ok(result.bits < 60);
      patterns.add(tokens.map(token => /^[A-Z]/.test(token) ? 'W' : /^\d/.test(token) ? 'N' : 'S').join(''));
    }
  }
  assert.ok(patterns.size > 4);
});

test('compact passwords reject invalid or unsuitable dictionaries', () => {
  assert.throws(() => compactPassword(undefined));
  assert.throws(() => compactPassword(['canvas', 'rocket']));
  assert.throws(() => compactPassword(dictionary), /6-letter/);
});