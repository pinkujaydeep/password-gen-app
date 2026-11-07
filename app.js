(() => {
  'use strict';
  const element = id => document.getElementById(id);
  const savedPasswordsKey = 'passkeeSavedPasswordsV1';
  let current = null;
  let savedPasswords = [];
  let savedStorageReady = true;
  const savedRevealControls = [];
  let hidden = false;
  let mode = 'compact';
  let passwordLength = 16;
  let generation = 0;
  let statusTimer;

  function icons() {
    globalThis.lucide?.createIcons();
  }

  function status(message, error = false) {
    clearTimeout(statusTimer);
    element('status').textContent = message;
    element('status').classList.toggle('error', error);
    if (!error) statusTimer = setTimeout(() => { element('status').textContent = ''; }, 6500);
  }

  function renderSavedPasswords() {
    const list = element('saved-list');
    list.replaceChildren();
    savedRevealControls.length = 0;
    element('saved-count').textContent = `(${savedPasswords.length})`;
    element('clear-saved').disabled = !savedStorageReady || savedPasswords.length === 0;
    element('saved-empty').hidden = savedStorageReady && savedPasswords.length > 0;
    element('save').disabled = !current || !savedStorageReady;

    if (!savedStorageReady) return;
    if (savedPasswords.length === 0) {
      element('saved-empty').textContent = 'Nothing saved yet. Use “Save locally” to keep a password in this browser.';
      return;
    }

    savedPasswords.forEach((entry, index) => {
      const row = document.createElement('article');
      row.className = 'saved-entry';
      const heading = document.createElement('div');
      heading.className = 'saved-entry-heading';
      const label = document.createElement('h3');
      label.className = 'saved-entry-label';
      label.textContent = entry.label || 'Saved password';
      const time = document.createElement('time');
      time.className = 'saved-entry-time';
      time.dateTime = new Date(entry.createdAt).toISOString();
      time.textContent = new Date(entry.createdAt).toLocaleString();
      heading.append(label, time);

      const password = document.createElement('p');
      password.className = 'saved-entry-password masked';
      password.textContent = '\u2022'.repeat(entry.password.length);
      password.setAttribute('aria-label', 'Saved password hidden');
      let revealed = false;
      const updateVisibility = () => {
        password.textContent = revealed ? entry.password : '\u2022'.repeat(entry.password.length);
        password.classList.toggle('masked', !revealed);
        password.setAttribute('aria-label', revealed ? 'Saved password' : 'Saved password hidden');
        return revealed;
      };
      savedRevealControls.push(() => {
        revealed = false;
        updateVisibility();
        show.textContent = 'Show';
        show.setAttribute('aria-pressed', 'false');
      });

      const actions = document.createElement('div');
      actions.className = 'saved-entry-actions';
      const show = document.createElement('button');
      show.className = 'saved-action';
      show.type = 'button';
      show.textContent = 'Show';
      show.setAttribute('aria-pressed', 'false');
      show.addEventListener('click', () => {
        revealed = !revealed;
        show.textContent = revealed ? 'Hide' : 'Show';
        show.setAttribute('aria-pressed', String(revealed));
        updateVisibility();
      });
      const copySaved = document.createElement('button');
      copySaved.className = 'saved-action';
      copySaved.type = 'button';
      copySaved.textContent = 'Copy';
      copySaved.addEventListener('click', () => copySavedPassword(entry.password, password, () => revealed));
      const remove = document.createElement('button');
      remove.className = 'saved-action';
      remove.type = 'button';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete ${entry.label || 'saved password'}`);
      remove.addEventListener('click', () => {
        const next = savedPasswords.filter((_, savedIndex) => savedIndex !== index);
        if (persistSavedPasswords(next)) status('Saved password deleted from this browser.');
      });
      actions.append(show, copySaved, remove);
      row.append(heading, password, actions);
      list.append(row);
    });
  }

  function loadSavedPasswords() {
    try {
      const stored = localStorage.getItem(savedPasswordsKey);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed) || !parsed.every(entry =>
          entry && typeof entry.password === 'string' && entry.password.length > 0 && entry.password.length <= 512 &&
          typeof entry.label === 'string' && entry.label.length <= 60 &&
          Number.isFinite(entry.createdAt) && !Number.isNaN(new Date(entry.createdAt).getTime())
        )) throw new Error('Invalid saved password data.');
        savedPasswords = parsed;
      }
    } catch {
      savedStorageReady = false;
      element('saved-empty').textContent = 'Saved passwords could not be loaded. Existing browser data was left untouched; clear this site’s data in browser settings to recover.';
      status('Local saved passwords are unavailable. Existing browser data was not changed.', true);
    }
    renderSavedPasswords();
  }

  function persistSavedPasswords(next) {
    if (!savedStorageReady) {
      status('Saved passwords are unavailable. Existing browser data was not changed.', true);
      return false;
    }
    try {
      localStorage.setItem(savedPasswordsKey, JSON.stringify(next));
      savedPasswords = next;
      renderSavedPasswords();
      return true;
    } catch {
      status('Could not update saved passwords. Browser storage may be blocked or full.', true);
      return false;
    }
  }

  function maskSavedPasswords() {
    savedRevealControls.forEach(mask => mask());
  }

  async function copySavedPassword(password, display, isRevealed) {
    try {
      if (!navigator.clipboard?.writeText || !globalThis.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(password);
      status('Copied saved password. Clipboard history and device sync may retain it.');
    } catch {
      if (isRevealed()) {
        const selection = globalThis.getSelection();
        const range = document.createRange();
        range.selectNodeContents(display);
        selection.removeAllRanges();
        selection.addRange(range);
        status('Clipboard blocked. The revealed password is selected for manual copying.', true);
      } else {
        status('Clipboard blocked. Reveal the saved password to select and copy it manually.', true);
      }
    }
  }

  function render() {
    element('password').textContent = hidden ? '\u2022'.repeat(current.password.length) : current.password;
    element('password').classList.toggle('masked', hidden);
    element('password').setAttribute('aria-label', hidden ? 'Password hidden' : 'Generated password');
    element('character-count').textContent = `${current.password.length} characters`;
    element('output-mode').textContent = mode === 'compact' ? 'MEMORABLE PASSWORD' : mode === 'passphrase' ? 'WORD-BASED PASSPHRASE' : 'RANDOM PASSWORD';
    element('word-summary').textContent = mode === 'compact'
      ? '2 words + symbol + digits'
      : mode === 'passphrase'
        ? `${element('phrase-words').value} words · ${element('phrase-separator').selectedOptions[0].textContent.toLowerCase()}`
        : `${passwordLength} characters`;
    const entropyLabel = mode === 'passphrase'
      ? `${Math.floor(current.bits)} bits from word choices`
      : `${Math.floor(current.bits)} bits of estimated entropy`;
    element('entropy').textContent = entropyLabel;
    const fullStrength = Number(element('strength').max);
    const quality = current.bits >= fullStrength ? 'Very strong' : current.bits >= 75 ? 'Strong' : current.bits >= 60 ? 'Moderate' : 'Limited strength';
    element('strength').value = Math.min(fullStrength, current.bits);
    element('strength').setAttribute('aria-valuetext', `${quality}, ${entropyLabel}`);
    element('quality-label').textContent = quality;
    element('quality-label').classList.toggle('limited', current.bits < 60);
    element('visibility').setAttribute('aria-label', hidden ? 'Show password' : 'Hide password');
    element('visibility').title = hidden ? 'Show password' : 'Hide password';
    element('visibility').setAttribute('aria-pressed', String(hidden));
    element('visibility').replaceChildren();
    const icon = document.createElement('i');
    icon.dataset.lucide = hidden ? 'eye' : 'eye-off';
    element('visibility').append(icon);
    icons();
  }

  function generate(announce = true) {
    generation++;
    element('copy-label').textContent = 'Copy password';
    try {
      const options = { numbers: element('numbers').checked, symbols: element('symbols').checked };
      current = mode === 'compact'
        ? PasskeeCore.compactPassword(globalThis.PASSKEE_WORDS, passwordLength)
        : mode === 'passphrase'
          ? PasskeeCore.passphrase({
            words: Number(element('phrase-words').value),
            separator: element('phrase-separator').value,
            capitalize: element('phrase-capitalize').checked,
            numbers: element('phrase-numbers').checked,
            symbols: element('phrase-symbols').checked
          }, globalThis.PASSKEE_WORDS)
          : PasskeeCore.randomPassword({ ...options, length: passwordLength, excludeAmbiguous: element('ambiguous').checked });
      render();
      element('copy').disabled = false;
      element('save').disabled = !savedStorageReady;
      if (announce) status('New password generated.');
    } catch (error) {
      current = null;
      element('copy').disabled = true;
      element('save').disabled = true;
      element('password').textContent = 'Generation unavailable';
      element('character-count').textContent = '0 characters';
      element('strength').value = 0;
      element('quality-label').textContent = 'Unavailable';
      element('entropy').textContent = '';
      status(error.message || 'Secure generation failed. Please reload.', true);
    }
  }

  function syncMode() {
    const memorable = mode === 'compact';
    const passphrase = mode === 'passphrase';
    element('length-controls').hidden = passphrase;
    element('compact-details').hidden = !memorable;
    element('random-options').hidden = memorable || passphrase;
    element('passphrase-options').hidden = !passphrase;
    element('length').value = passwordLength;
    element('length-value').textContent = element('length').value;
    element('phrase-words-value').textContent = element('phrase-words').value;
    const wordLength = Math.min(6, Math.floor((passwordLength - 2) / 2));
    const digitCount = passwordLength - wordLength * 2 - 1;
    element('digit-summary').textContent = `${digitCount} random ${digitCount === 1 ? 'digit' : 'digits'}`;
    element('compatibility-note').textContent = memorable
      ? 'Limited strength: short word patterns are easier to guess. Choose Random for sensitive accounts and enable MFA.'
      : passphrase
        ? 'Each extra word adds more protection. Six or more words is a practical balance of security and ease of typing.'
        : passwordLength < 12
          ? 'Short passwords are easier to guess. Prefer 16 characters, a unique password, and MFA.'
          : 'Uppercase and lowercase letters are always included. Prefer 16 characters and enable MFA.';
    element('compatibility-note').classList.toggle('limited', memorable || (!passphrase && passwordLength < 12));
  }

  async function copy() {
    if (!current) return;
    const version = generation;
    const password = current.password;
    try {
      if (!navigator.clipboard?.writeText || !globalThis.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(password);
      if (version !== generation) return;
      element('copy-label').textContent = 'Copied';
      status('Copied. Clipboard history and device sync may retain this password.');
    } catch {
      if (version !== generation) return;
      if (!hidden) {
        const selection = globalThis.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element('password'));
        selection.removeAllRanges();
        selection.addRange(range);
      }
      status(hidden ? 'Clipboard blocked. Show the password to select and copy it manually.' : 'Clipboard blocked. The password is selected for manual copying.', true);
    }
  }

  element('generate').addEventListener('click', () => generate());
  element('copy').addEventListener('click', copy);
  element('save').addEventListener('click', () => {
    if (!current || !savedStorageReady) return;
    const entry = {
      password: current.password,
      label: element('save-label').value.trim(),
      createdAt: Date.now()
    };
    if (persistSavedPasswords([entry, ...savedPasswords])) {
      element('save-label').value = '';
      status('Password saved unencrypted in this browser. Anyone with access to this profile can read it.');
    }
  });
  element('clear-saved').addEventListener('click', () => {
    if (!savedPasswords.length || !globalThis.confirm('Permanently delete all passwords saved by Passkee in this browser? This cannot be undone.')) return;
    if (persistSavedPasswords([])) status('All Passkee saved passwords were deleted from this browser.');
  });
  element('visibility').addEventListener('click', () => {
    if (!current) return;
    hidden = !hidden;
    render();
  });
  document.querySelectorAll('input[name="mode"]').forEach(input => input.addEventListener('change', () => {
    mode = input.value;
    syncMode();
    generate();
  }));
  element('length').addEventListener('input', () => {
    const value = Number(element('length').value);
    passwordLength = value;
    syncMode();
  });
  element('length').addEventListener('change', () => generate());
  element('phrase-words').addEventListener('input', () => {
    element('phrase-words-value').textContent = element('phrase-words').value;
  });
  element('phrase-words').addEventListener('change', () => generate());
  for (const id of ['numbers', 'symbols', 'ambiguous', 'phrase-separator', 'phrase-capitalize', 'phrase-numbers', 'phrase-symbols']) {
    element(id).addEventListener('change', () => generate());
  }
  element('reset').addEventListener('click', () => {
    mode = 'compact';
    passwordLength = 16;
    document.querySelector('input[value="compact"]').checked = true;
    element('numbers').checked = true;
    element('symbols').checked = true;
    element('ambiguous').checked = true;
    element('phrase-words').value = 6;
    element('phrase-separator').value = ' ';
    element('phrase-capitalize').checked = true;
    element('phrase-numbers').checked = true;
    element('phrase-symbols').checked = true;
    syncMode();
    generate();
  });
  element('delete-legacy').addEventListener('click', () => {
    if (!globalThis.confirm('Permanently delete passwords saved by the previous version? This cannot be undone.')) return;
    try {
      localStorage.removeItem('pwdHistory');
      element('legacy-notice').hidden = true;
      status('Old saved history deleted from this browser.');
    } catch { status('Browser storage is blocked. Clear site data in your browser settings.', true); }
  });
  try { element('legacy-notice').hidden = localStorage.getItem('pwdHistory') === null; }
  catch {}
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (current) { hidden = true; render(); }
      maskSavedPasswords();
    }
  });
  globalThis.addEventListener('pagehide', () => {
    generation++;
    current = null;
    element('password').textContent = 'Password cleared';
    element('copy').disabled = true;
    element('save').disabled = true;
    maskSavedPasswords();
  });
  globalThis.addEventListener('pageshow', event => { if (event.persisted) generate(false); });
  syncMode();
  icons();
  loadSavedPasswords();
  generate(false);
})();