(function (root) {
  'use strict';

  const SYMBOLS = '!@#$%^&*?';
  const AMBIGUOUS = /[Il1O0o]/g;

  function randomIndex(maximum) {
    if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 0x100000000) {
      throw new RangeError('Invalid random selection range.');
    }
    if (!globalThis.crypto?.getRandomValues) {
      throw new Error('Secure randomness is unavailable. Try a current browser.');
    }
    const limit = Math.floor(0x100000000 / maximum) * maximum;
    const buffer = new Uint32Array(1);
    do {
      globalThis.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % maximum;
  }

  function integer(value, minimum, maximum) {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new RangeError(`Choose a whole number between ${minimum} and ${maximum}.`);
    }
    return value;
  }

  function validateDictionary(dictionary) {
    if (!Array.isArray(dictionary) || dictionary.length < 1296 ||
        new Set(dictionary).size !== dictionary.length ||
        !dictionary.every(word => typeof word === 'string' && /^[a-z]+(-[a-z]+)*$/.test(word))) {
      throw new Error('The local word list is missing or invalid.');
    }
  }

  function compactPassword(dictionary, targetLength = 16) {
    const length = integer(targetLength, 8, 16);
    validateDictionary(dictionary);
    const wordLength = Math.min(6, Math.floor((length - 2) / 2));
    const digitCount = length - wordLength * 2 - 1;
    const candidates = dictionary.filter(word => /^[a-z]+$/.test(word) && word.length === wordLength);
    if (candidates.length < 2) throw new Error(`The local list needs more ${wordLength}-letter words.`);
    const words = Array.from({ length: 2 }, () => candidates[randomIndex(candidates.length)]);
    const tokens = words.map(word => word[0].toUpperCase() + word.slice(1));
    tokens.push(SYMBOLS[randomIndex(SYMBOLS.length)], String(randomIndex(10 ** digitCount)).padStart(digitCount, '0'));
    for (let index = tokens.length - 1; index > 0; index--) {
      const swapIndex = randomIndex(index + 1);
      [tokens[index], tokens[swapIndex]] = [tokens[swapIndex], tokens[index]];
    }
    const bits = 2 * Math.log2(candidates.length) + Math.log2(SYMBOLS.length) + digitCount * Math.log2(10);
    return { password: tokens.join(''), bits, words };
  }

  function passphrase(options, dictionary) {
    const count = integer(options.words, 5, 10);
    validateDictionary(dictionary);
    if (!['/', ' ', '.'].includes(options.separator)) {
      throw new RangeError('Unsupported word separator.');
    }
    const words = Array.from({ length: count }, () => dictionary[randomIndex(dictionary.length)]);
    const formatted = words.map(word => options.capitalize ? word[0].toUpperCase() + word.slice(1) : word);
    let password = formatted.join(options.separator);
    if (options.numbers) password += String(randomIndex(100)).padStart(2, '0');
    if (options.symbols) password += SYMBOLS[randomIndex(SYMBOLS.length)];
    const bits = count * Math.log2(dictionary.length);
    return { password, bits, words };
  }

  function randomPassword(options) {
    const length = integer(options.length, 8, 16);
    const filter = text => options.excludeAmbiguous ? text.replace(AMBIGUOUS, '') : text;
    const groups = [filter('abcdefghijklmnopqrstuvwxyz'), filter('ABCDEFGHIJKLMNOPQRSTUVWXYZ')];
    if (options.numbers) groups.push(filter('0123456789'));
    if (options.symbols) groups.push(SYMBOLS);
    const alphabet = groups.join('');
    let characters;
    do {
      characters = Array.from({ length }, () => alphabet[randomIndex(alphabet.length)]);
    } while (!groups.every(group => characters.some(character => group.includes(character))));
    let acceptance = 0;
    for (let subset = 0; subset < 2 ** groups.length; subset++) {
      let excluded = 0;
      let size = 0;
      groups.forEach((group, index) => {
        if (subset & (1 << index)) {
          excluded += group.length;
          size++;
        }
      });
      acceptance += (size % 2 ? -1 : 1) * ((alphabet.length - excluded) / alphabet.length) ** length;
    }
    return { password: characters.join(''), bits: length * Math.log2(alphabet.length) + Math.log2(acceptance) };
  }

  const api = Object.freeze({ randomIndex, compactPassword, passphrase, randomPassword });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PasskeeCore = api;
})(globalThis);