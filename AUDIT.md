# Passkee Security and UX Review

Reviewed November 6, 2026. This is a source review and focused functional
verification, not an independent penetration test or a security certification.
The findings below describe the previous implementation; remediation is noted.

## Current Length Policy

Following the user's preference, both app modes now accept exactly 8-16
characters, defaulting to 16. Memorable mode shuffles two whole title-cased words,
one symbol, and a 1-3 digit number. Word lengths adapt from 3 to 6 characters;
no words are truncated and no spaces are inserted. The shared length slider
retains its value between modes. Compact patterns are labeled Limited strength;
they do not offer security equivalent to equally long random-character passwords.
Random at 16 characters with MFA is recommended for sensitive accounts.
The six-word remediation described historically below is no longer an app mode.

## High Priority

1. **Passphrases silently lost randomness.** `buildMemorablePassword()` sliced
   the joined words to 16 characters, including room for a number suffix.
   Later selected words could contribute nothing, and words could be cut apart.
  Fixed: select whole words that fit the requested length instead of cutting
  selected words. The 8-16 character bounds are explicit in both app modes.

2. **The strength score was not an entropy estimate.** Length and character
   classes earned points even when words were truncated or the selection space
   was small. An eight-item blocklist could not correct this. Fixed: calculate
   estimates from the known generation process, not the appearance of the output.

3. **History was opt-out on a fresh install.** `settings.saveHistory` was `true`,
   contradicting the README. Plaintext passwords and account tags were written
   to localStorage, where same-origin scripts and anyone with access to the
   browser profile could read them. The original remediation removed automatic
   history and export. The current app adds an explicit Save locally action:
   saved entries are still plaintext in localStorage, with an in-app warning,
   default masking, per-entry deletion, and clear-all. Anyone with profile or
   same-origin script access can read them. Existing legacy history is detected
   without rendering it; confirmed deletion is available. Backups, clipboard
   history, and other origins are outside this app's control.

4. **Stored passwords reached an unsafe HTML/JavaScript sink.** History used
   `innerHTML` and interpolated passwords into a double-quoted inline `onclick`
   attribute, escaping only single quotes at that location. Malformed/tampered
   stored data could break attribute context. This is a stored DOM-injection
   risk, not evidence of an unauthenticated remote exploit. Fixed: remove that
   rendering path and all inline event handlers; the current saved list uses
   textContent and event listeners.

## Medium Priority

5. **Small, uneven word distribution.** A few hundred entries included duplicate
   words and specialist terminology. Duplicate entries made some words more
   likely, and selecting three words was insufficient to support strong claims.
    Fixed: the unmodified 7,776-entry EFF Large Wordlist, sampled independently
    with replacement. The compact mode filters entries by length; its smaller
    selection space is reflected in the estimate and warning. Repeated words
    are valid random outcomes, not a reason to edit the result into a familiar quote.

6. **Random-character construction was not uniformly constrained.** The old
   implementation patched missing character types and shuffled the result.
   This does not produce a uniform distribution over all valid strings.
   Fixed: uniformly sample the alphabet and reject candidates missing a selected
   class. Entropy accounts for the required-class constraint.

7. **Privacy hiding was incomplete.** Per-word buttons and visible history could
   reveal a supposedly hidden password. Generating also always revealed it.
   Fixed: remove duplicate secret displays, preserve hidden state across
   generation, mask current and saved entries when the page becomes hidden,
   clear the current reference on page exit, and regenerate on back-forward
   restoration. JavaScript cannot promise secure memory erasure.

8. **Legacy history did not reliably expire.** Entries lacking timestamps were
   retained indefinitely, and opportunistic expiry was not a deletion guarantee.
   Legacy history remains until explicitly deleted. Current opt-in saved
   passwords intentionally persist until individually deleted, cleared with
   the app's Clear all action, or removed by clearing site data.

9. **Clipboard success could be falsely reported.** `execCommand('copy')` can
   return false without throwing, but the fallback announced success anyway.
   Fixed: report success only after Clipboard API resolution; select visible
   text for manual copying when access is denied. Hidden secrets stay hidden.
   No claim is made that clipboard history or cloud sync can be securely cleared.

10. **Storage and settings failures were inconsistent.** Some storage operations
    were unguarded, and partial/corrupt saved objects could leave invalid values.
    Fixed: generation has no storage dependency; saved data is parsed and
    validated before display, legacy access is guarded, and storage failures are
    reported without overwriting unreadable entries. Generator numeric ranges,
    separators, and dictionary structure are validated. Crypto failures disable
    copying rather than offering weak randomness.

11. **Deployment lacked a Content Security Policy.** Inline script/handlers
    complicated a strict policy. HSTS and Permissions-Policy were absent;
    X-XSS-Protection was obsolete. The catch-all rewrite served HTML for missing
    assets. Fixed: local external scripts/styles, restrictive CSP including
    `connect-src 'none'`, framing restrictions, HSTS, permissions restrictions,
    revalidation of assets, no-store HTML, lowercase entry point, and no wildcard
    HTML fallback. Actual deployed headers must still be verified after release.

## UX, Accessibility, and Maintenance

12. **Mobile content could become unreachable.** `overflow: hidden`, nested
    scrollers, and fixed `100vh` heights could clip settings on short screens,
    landscape viewports, and zoomed pages. Fixed: ordinary document scrolling,
    a single-column mobile layout, and a two-column desktop workspace.

13. **Controls were too small or unclear.** Some text was 8-11px and word buttons
    were 28-30px high. Emoji-only primary actions and hidden preferences made
    routine operations difficult to discover. Fixed: labeled primary actions,
    standard locally bundled icons, visible preferences, 48px button targets,
    larger password output, native form controls, visible keyboard focus,
    a skip link, and live status feedback. Visual screenshots and functional
    tests are not a substitute for a full assistive-technology audit.

14. **Keyboard handlers overrode native behavior.** Enter could regenerate instead
    of activating a focused button, and Ctrl/Cmd+K overrode a browser shortcut.
    Fixed: remove global shortcuts; retain ordinary button and form behavior.

15. **Styles were malformed and contradictory.** A declaration block had no
    selector, multiple later overrides fought earlier rules, and dark mode
    required patches over hard-coded light backgrounds. Fixed: one mobile-first
    stylesheet and a coherent light palette. The previous dark theme is removed,
    rather than retained with incomplete contrast support.

16. **Documentation and controls disagreed.** The README promised 12-32 character
    minimums, but the slider and generator capped lengths at 16. "Private to your
    browser" was overstated as not visible to others. Fixed: accurate limits,
    storage behavior, compatibility notes, and security limitations.

17. **Manifest claims were incomplete.** Data-URL emoji SVGs and a manifest alone
    did not establish reliable installability or offline caching. Fixed: a local
    SVG icon and matching metadata. No service worker, automatic offline cache,
    or cross-browser PWA install guarantee is claimed.

18. **Generation had no regression suite.** Security-sensitive logic lived inside
    a roughly 2,000-line HTML file. Fixed: a small standalone generator and
    Node built-in tests for truncation, dictionary validity, required classes,
    bounds, unbiased index rejection, and unavailable Web Crypto.

## Security Model and Remaining Limits

- The old Web Crypto index sampler already used rejection sampling correctly.
  That property is retained; there is never a Math.random fallback.
- Compact estimates count two word choices from the length-filtered dictionary,
  one of nine symbols, and the random digit token. Predictable title case and
  shuffled token order are not credited. Short compact passwords are easier to
  guess; secure randomness does not make a small selection space large.
- Random mode defaults to 16 characters, supports 8-16, always includes upper
  and lowercase, and can require digits and symbols. Look-alike filtering applies
  only to random mode. Compact mode uses only alphabetic dictionary entries.
- Entropy assumes a trustworthy browser/CSPRNG, an unchanged dictionary and code,
  and an attacker who knows the method. It is not a crack-time guarantee and
  cannot predict a service's hashing cost, rate limits, or breach exposure.
- A compromised browser, extension, OS, clipboard manager, hosting account, or
  deployment can still expose passwords. A CSP cannot make malicious first-party
  scripts safe. Protect hosting and repository access, and review bundled updates.
- Passwords remain in page memory while in use. Closing/hiding behavior reduces
  casual exposure but cannot defeat memory inspection, screenshots, or backups.
- Both app modes produce no spaces and honor the selected exact length. Some
  services may still reject particular symbols; Random exposes class toggles.
  Do not truncate results or reuse credentials. Allowing 8 characters is a user
  compatibility preference, not a claim that all 8-character passwords are strong.
- There is no password vault, breach-lookup service, remote API, or analytics.
  Use a trusted password manager and passkeys/MFA for account protection.
- Browser verification here covers the available Chromium environment, not real
  iOS Safari, Firefox, every screen reader, or a deployed Netlify environment.

## Third-Party Assets

- EFF Large Wordlist: https://www.eff.org/dice and
  https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt
  by Electronic Frontier Foundation, CC BY 3.0 US:
  https://creativecommons.org/licenses/by/3.0/us/ . Entries are unchanged.
  The original text is retained; wordlist.js is a mechanical JS wrapper.
- Lucide 0.468.0: https://lucide.dev and https://github.com/lucide-icons/lucide .
  Pinned UMD bundle from unpkg, served locally with its embedded ISC license.