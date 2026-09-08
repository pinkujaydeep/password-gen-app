# � Passkee - Password Generator

A powerful, feature-rich password generator with word-based patterns. Fully responsive, works on all modern browsers, and includes advanced customization options.

## ✨ Features

### Core Features
- ✅ Generates passwords with a 12-32 character minimum-length setting
- ✅ Memorable passphrases made from complete, unrelated words
- ✅ Random-character mode for password managers
- ✅ Password strength indicator with pattern-aware feedback
- ✅ Individual word regeneration for passphrases
- ✅ Real-time strength analysis

### Advanced Features
- 🎨 **Dark Mode** - Toggle between light and dark themes
- ⚙️ **Customization Options**
  - Adjustable minimum length (12-32 chars)
  - Memorable passphrase or random-character mode
  - Toggle numbers and symbols
  - Compatibility presets for restrictive services
- 👁️ **Password Privacy Controls**
  - Show or hide the generated password on screen
  - Password history is off by default
  - Optional local history expiry after 1, 7, or 30 days
  - Explicit confirmation before plaintext export
- ⌨️ **Keyboard Shortcuts**
  - `Enter` - Generate new password
  - `Ctrl+K` - Copy to clipboard
- 📜 **Password History**
  - Stores last 10 passwords locally in your browser
  - Private to your device (not shared with anyone)
  - Quick copy from history
  - Add or edit an app/service tag after generation
  - Clear all option
- 📥 **Export Functionality**
  - Download password history as text file
  - Timestamped export

### Security & Privacy
- 🔒 100% client-side generation (no server required)
- 🛡️ Secure random number generation using the Web Crypto API
- 🔐 No data collection or tracking
- 💾 Local storage only (localStorage in your browser)
- 🚫 No passwords sent over the network

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)
- ✅ Supports both light and dark mode
- ✅ Fully responsive design

## How to Use

### Basic Usage
1. Click **Generate** button or press `Enter` to create a password
2. Click **Copy** button or press `Ctrl+K` to copy to clipboard
3. Password strength is shown automatically

### Customization
1. Click **Customize Settings** to expand options
2. Adjust the minimum length with the slider (12-32 characters)
3. Choose memorable passphrases or random characters
4. Toggle numbers and symbols when supported by the service
5. Choose a compatibility preset when a service rejects certain characters
6. Regenerate individual words with the `↻` controls below a passphrase
7. Settings are saved automatically in your browser

### Dark Mode
- Click the 🌙/☀️ icon in the top-right corner
- Your preference is remembered

### Password History
- History is disabled by default; enable it in Settings only when needed
- When enabled, the last 10 generated passwords are saved locally
- Click **Copy** on any history item to copy it
- Add or edit an app/service tag after generation
- Click **Clear All** to remove history
- History is private to your browser/device and can expire automatically

### Export
- Click **Export Passwords** to download your history as a text file
- File is timestamped and contains all saved passwords
- **Important:** Keep export files secure and delete after use

## Deploy to Netlify

### Method 1: Drag and Drop (Easiest)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire project folder onto the page
3. Your site will be deployed instantly!

### Method 2: Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

4. Follow the prompts and select this directory

### Method 3: Git-based Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Set build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
6. Click "Deploy site"

## Local Development

Simply open `Index.html` in your browser. No build process required!

## Project Structure

```
PasswordGenApp/
├── Index.html          # Main application file (includes all CSS & JS)
├── netlify.toml        # Netlify configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Technical Details

### Technologies Used
- Pure HTML5, CSS3, and JavaScript (no dependencies)
- CSS Variables for theming
- localStorage API for persistent settings
- Modern Clipboard API with fallback
- Responsive CSS with multiple breakpoints

### Storage
- **Settings**: Stored in `localStorage` as `pwdGenSettings`
- **History**: Stored in `localStorage` as `pwdHistory` (max 10 items, opt-in)
- **Dark Mode**: Stored in `localStorage` as `darkMode`
- All data is private to your browser and never leaves your device

## Security Features

- ✅ Client-side generation only (no server communication)
- ✅ Secure random number generation using the Web Crypto API
- ✅ No data collection, analytics, or tracking
- ✅ No cookies used
- ✅ localStorage is domain-specific and private
- ✅ History storage is opt-in and supports automatic expiry
- ✅ HTTPS enforced when deployed
- ✅ Security headers configured in netlify.toml

### Privacy Notice
**Your password history is stored ONLY in your browser's localStorage**. This means:
- ✅ Passwords never leave your device
- ✅ Not shared between browsers or devices
- ✅ Not visible to other users
- ✅ Cleared when you clear browser data
- ✅ No server storage or transmission

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Generate new password |
| `Ctrl+K` (or `Cmd+K` on Mac) | Copy password to clipboard |

## FAQ

**Q: Is my password history shared with others?**  
A: No! History is stored only in your browser's localStorage and never leaves your device.

**Q: Can I use this offline?**  
A: Yes! Once loaded, the app works completely offline.

**Q: Why doesn't my history sync across devices?**  
A: For security and privacy, all data is stored locally in your browser only.

**Q: How do I clear my history?**  
A: Click the "Clear All" button in the Password History section, or clear your browser's localStorage.

**Q: Is history enabled by default?**
A: No. Enable "Save history locally" in Settings only if you need the convenience. Saved passwords remain plaintext in this browser's local storage.

**Q: Are the passwords truly random?**
A: Yes, passwords use the browser's Web Crypto API for randomization. For highly sensitive accounts, consider using a dedicated password manager.

**Q: Can I adjust the password length?**  
A: Yes! Use the slider in Customize Settings to select a minimum length from 12 to 32 characters. Memorable mode adds complete words until that minimum is reached.

**Q: How many unique passwords can this generate?**  
A: The available combinations depend on the selected mode, length, word list, numbers, and symbols. For important accounts, use a password manager and avoid reusing passwords.

## License

Free to use and modify.
