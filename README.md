# Passkee

A mobile-first, on-device password generator. No build step, account, analytics,
remote generation, or runtime CDN requests.

## Open

Open [index.html](index.html) directly in a modern browser. All scripts, icons,
styles, and words are bundled locally. Clipboard permissions vary on file URLs;
when copying is denied, the app offers manual selection instead of claiming
success. Use HTTPS when hosting the app.

For deployment, publish this directory on Netlify with no build command.
[netlify.toml](netlify.toml) configures security headers and the legacy uppercase
entry-point redirect. Verify the actual response headers after deployment.

## Password Modes

| Setting | Memorable | Random |
| --- | --- | --- |
| Default | 16 characters, shuffled whole words + symbol + number | 16 characters |
| Range | 8-16 exact characters | 8-16 exact characters |
| Alphabet | Length-filtered words from the EFF list, symbols, and digits | Uppercase and lowercase, optional digits/symbols |
| Options | Shared length slider; pieces shuffled on every generation | Shared length slider; numbers; symbols; exclude look-alikes |

Passphrase mode is also available: choose 5-10 words, a space, slash, or period
separator, capitalization, and optional two-digit and symbol suffixes. Its
entropy estimate reflects word choices only and does not count the optional
suffix. Passphrases are generated on demand and are not saved automatically.

Changing preferences generates a new result. Use Generate new for another
candidate, Copy password to copy it, and the eye control to hide or reveal it.
Hidden state is preserved when generating. Switching away masks the password;
page exit clears the app's current reference and displayed value.
Enter an optional label and use Save locally to keep a password in this browser.
Saved entries are masked by default, can be copied or deleted individually, and
can all be removed with Clear all. Revealed entries are masked again when the
page moves to the background.

The selected length is preserved when switching modes. Reset restores 16.
Memorable mode uses two complete title-cased words, one symbol, and 1-3 digits,
shuffled as intact pieces with no spaces. Word length adapts from 3 to 6 letters
to fit the selected length without truncation. For example, `Canvas?Rocket374`
is 16 characters; `Sun!Map7` is 8. These are examples, not passwords to reuse.

**Compact word patterns have limited strength**, even at 16 characters, and are
not equivalent to 16 random characters. The estimate counts the filtered word
choices, symbol, and digits conservatively; it does not credit the shuffled order
or predictable capitalization. Repeated words and leading zeroes can occur.
For sensitive accounts choose Random, keep 16 characters, and enable MFA.

Random mode samples uniformly subject to required character classes; its
estimate accounts for those constraints. Eight-character passwords are allowed
for compatibility, not recommended as strong defaults. No score guarantees
crack time or account security. Look-alike filtering applies only to Random.
The memorable and random modes retain their 8-16 character bounds. Passphrase
mode uses the existing word-based generator with its separate 5-10 word range.

## Privacy Boundaries

- Passwords are saved only after you press Save locally. Saved passwords and
  optional labels are stored unencrypted in this browser's localStorage. Anyone
  with access to the browser profile or same-origin scripts can read them. This
  app does not send saved entries to a service; browser profile sync and backups
  are outside its control.
- Saved entries can be deleted individually or with Clear all. Clearing site
  data in browser settings also removes them. Storage failures are reported and
  existing unreadable data is not overwritten.
- The previous version's `pwdHistory` format and plaintext export are not used
  for the new saved list.
- Existing `pwdHistory` data is detected without rendering it. Delete it using
  the confirmed Delete old history action on the same origin/browser profile.
  It is never deleted automatically; changing origins does not migrate it.
- Clipboard history, cross-device clipboard sync, browser extensions, screenshots,
  OS memory, and existing downloads are outside this app's protection.
- JavaScript cannot guarantee secure memory erasure. Hiding text is not encryption.
- No service worker or automatic offline cache is installed. Downloaded files work
  locally, but visiting the hosted app once does not guarantee offline availability.
- A manifest is included, but cross-browser PWA installability is not promised.

Use a unique password per account, save it in a trusted password manager, and
enable a passkey or multi-factor authentication when supported.

## Tests

Requires a modern Node.js runtime with Web Crypto (Node 22 or newer recommended):

```sh
node --test generator.test.cjs
```

The eight tests cover every supported length (8-16), whole-word preservation,
shuffled pieces, required random-character classes, look-alike filtering, invalid
bounds, rejected biased random values, missing secure randomness, and dictionary
validation. The retained long-passphrase routine also has regression coverage.

Browser checks covered password saving, reload persistence, masking, deletion,
corrupt-storage handling, and 320, 375, 768, and 1440px layouts. These are focused
Chromium checks, not a full Safari/Firefox or accessibility certification. No
Netlify deployment was performed.

## Structure

- [index.html](index.html): semantic interface and fallback CSP.
- [styles.css](styles.css): mobile-first styles and reduced-motion handling.
- [generator.js](generator.js): Web Crypto sampling and entropy calculations.
- [app.js](app.js): UI, mode controls, clipboard feedback, local saves, privacy controls, and legacy cleanup.
- [wordlist.js](wordlist.js): browser wrapper for the official EFF list.
- [eff_large_wordlist.txt](eff_large_wordlist.txt): original EFF list.
- [lucide.min.js](lucide.min.js): pinned, locally served Lucide 0.468.0 icons.
- [generator.test.cjs](generator.test.cjs): focused Node tests.
- [AUDIT.md](AUDIT.md): original findings, remediations, limitations, and credits.

## Credits

EFF Large Wordlist by Electronic Frontier Foundation, available at
https://www.eff.org/dice under CC BY 3.0 US:
https://creativecommons.org/licenses/by/3.0/us/ . Entries are unchanged.

Lucide icons 0.468.0: https://lucide.dev, ISC license; the bundled file retains
its license notice. Third-party updates should be pinned, reviewed, and tested.