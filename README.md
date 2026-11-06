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

Changing preferences generates a new password. Use Generate new for another
candidate, Copy password to copy it, and the eye control to hide or reveal it.
Hidden state is preserved when generating. Switching away masks the password;
page exit clears the app's current reference and displayed value.

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
The long-passphrase library routine remains regression-tested but is not exposed
as an app mode and does not change the app's 8-16 character bounds.

## Privacy Boundaries

- New passwords and preferences are not persisted to localStorage or cookies.
- Password history and plaintext export from the previous version are removed.
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

Browser checks performed during this update covered 320, 375, 390, 768, and 1440px
layouts and the main controls, denied-clipboard fallback, and background masking.
These are focused Chromium checks, not a full Safari/Firefox or accessibility
certification. No Netlify deployment was performed.

## Structure

- [index.html](index.html): semantic interface and fallback CSP.
- [styles.css](styles.css): mobile-first styles and reduced-motion handling.
- [generator.js](generator.js): Web Crypto sampling and entropy calculations.
- [app.js](app.js): UI, clipboard feedback, privacy controls, and legacy cleanup.
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