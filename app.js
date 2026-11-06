(() => {
  'use strict';
  const element = id => document.getElementById(id);
  let current = null;
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

  function render() {
    element('password').textContent = hidden ? '\u2022'.repeat(current.password.length) : current.password;
    element('password').classList.toggle('masked', hidden);
    element('password').setAttribute('aria-label', hidden ? 'Password hidden' : 'Generated password');
    element('character-count').textContent = `${current.password.length} characters`;
    element('output-mode').textContent = mode === 'compact' ? 'MEMORABLE PASSWORD' : 'RANDOM PASSWORD';
    element('word-summary').textContent = mode === 'compact' ? '2 words + symbol + digits' : `${passwordLength} characters`;
    element('entropy').textContent = `${Math.floor(current.bits)} bits of estimated entropy`;
    const fullStrength = Number(element('strength').max);
    const quality = current.bits >= fullStrength ? 'Very strong' : current.bits >= 75 ? 'Strong' : current.bits >= 60 ? 'Moderate' : 'Limited strength';
    element('strength').value = Math.min(fullStrength, current.bits);
    element('strength').setAttribute('aria-valuetext', `${quality}, ${Math.floor(current.bits)} bits of estimated entropy`);
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
        : PasskeeCore.randomPassword({ ...options, length: passwordLength, excludeAmbiguous: element('ambiguous').checked });
      render();
      element('copy').disabled = false;
      if (announce) status('New password generated.');
    } catch (error) {
      current = null;
      element('copy').disabled = true;
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
    element('compact-details').hidden = !memorable;
    element('random-options').hidden = memorable;
    element('length').value = passwordLength;
    element('length-value').textContent = element('length').value;
    const wordLength = Math.min(6, Math.floor((passwordLength - 2) / 2));
    const digitCount = passwordLength - wordLength * 2 - 1;
    element('digit-summary').textContent = `${digitCount} random ${digitCount === 1 ? 'digit' : 'digits'}`;
    element('compatibility-note').textContent = memorable
      ? 'Limited strength: short word patterns are easier to guess. Choose Random for sensitive accounts and enable MFA.'
      : passwordLength < 12
        ? 'Short passwords are easier to guess. Prefer 16 characters, a unique password, and MFA.'
        : 'Uppercase and lowercase letters are always included. Prefer 16 characters and enable MFA.';
    element('compatibility-note').classList.toggle('limited', memorable || passwordLength < 12);
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
  for (const id of ['numbers', 'symbols', 'ambiguous']) {
    element(id).addEventListener('change', () => generate());
  }
  element('reset').addEventListener('click', () => {
    mode = 'compact';
    passwordLength = 16;
    document.querySelector('input[value="compact"]').checked = true;
    element('numbers').checked = true;
    element('symbols').checked = true;
    element('ambiguous').checked = true;
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
    if (document.hidden && current) { hidden = true; render(); }
  });
  globalThis.addEventListener('pagehide', () => {
    generation++;
    current = null;
    element('password').textContent = 'Password cleared';
    element('copy').disabled = true;
  });
  globalThis.addEventListener('pageshow', event => { if (event.persisted) generate(false); });
  syncMode();
  icons();
  generate(false);
})();