# 🔐 Password Generator App

A powerful, feature-rich password generator with 800+ curated words across multiple themes. Fully responsive, works on all modern browsers, and includes advanced customization options.

## ✨ Features

### Core Features
- ✅ Generates customizable passwords (8-32 characters)
- ✅ **800+ curated words** across 4 comprehensive themes
  - **DevOps** (200+ words): CI/CD, containers, cloud, IaC, monitoring, networking
  - **Nature** (200+ words): Landscapes, weather, flora, fauna, celestial, elements
  - **Tech** (200+ words): Computing, AI, protocols, blockchain, sci-fi concepts
  - **Security** (200+ words): Authentication, encryption, network security, protocols
- ✅ **Optional online word API** for unlimited variety
- ✅ Word-based memorable patterns
- ✅ Password strength indicator with visual meter
- ✅ Real-time strength analysis

### Advanced Features
- 🎨 **Dark Mode** - Toggle between light and dark themes
- ⚙️ **Customization Options**
  - Adjustable password length (8-32 chars)
  - Toggle character types (symbols, numbers, words)
  - Select word theme (DevOps, Nature, Tech, Security, All)
- ⌨️ **Keyboard Shortcuts**
  - `Enter` - Generate new password
  - `Ctrl+K` - Copy to clipboard
- 📜 **Password History**
  - Stores last 10 passwords locally in your browser
  - Private to your device (not shared with anyone)
  - Quick copy from history
  - Clear all option
- 📥 **Export Functionality**
  - Download password history as text file
  - Timestamped export

### Security & Privacy
- 🔒 100% client-side generation (no server required)
- 🛡️ Secure random number generation
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
2. Adjust password length with the slider (8-32 characters)
3. Toggle character types (symbols, numbers, word-based)
4. Select your preferred word theme (DevOps, Nature, Tech, Security, All)
5. **Optional**: Enable "Use online word API" for additional variety
   - Fetches 200 words and intelligently filters for memorable ones
   - Excludes mundane words (like "table", "chair")
   - Keeps only cool-sounding, easy-to-remember words
   - Automatically falls back to local 800+ word library if offline or insufficient quality words
   - No authentication required
6. Settings are saved automatically in your browser

### Dark Mode
- Click the 🌙/☀️ icon in the top-right corner
- Your preference is remembered

### Password History
- Last 10 generated passwords are saved locally
- Click **Copy** on any history item to copy it
- Click **Clear All** to remove history
- History is private to your browser/device

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
- **History**: Stored in `localStorage` as `pwdHistory` (max 10 items)
- **Dark Mode**: Stored in `localStorage` as `darkMode`
- All data is private to your browser and never leaves your device

## Security Features

- ✅ Client-side generation only (no server communication)
- ✅ Secure random number generation using `Math.random()`
- ✅ No data collection, analytics, or tracking
- ✅ No cookies used
- ✅ localStorage is domain-specific and private
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

**Q: Are the passwords truly random?**  
A: Yes, passwords use JavaScript's `Math.random()` for randomization. For highly sensitive accounts, consider using a dedicated password manager.

**Q: What themes are available?**  
A: Four comprehensive themes with 800+ total words:
- **DevOps** (200+ words): CI/CD tools, containers, cloud platforms, IaC, monitoring
- **Nature** (200+ words): Landscapes, weather, flora, fauna, celestial bodies
- **Tech** (200+ words): Computing, AI, protocols, blockchain, sci-fi concepts  
- **Security** (200+ words): Authentication, encryption, network security
- **All**: Combines all themes for maximum variety

**Q: What is the online word API feature?**  
A: An optional feature that fetches random words from the internet for additional variety. It uses intelligent filtering to:
- Exclude mundane words (table, chair, door, etc.)
- Filter out hard-to-remember words (too many vowels, simple patterns)
- Keep only memorable, cool-sounding words (4-12 characters)
- Falls back to your local 800+ word library if offline or if not enough quality words are found

The API is free, requires no authentication, and results are cached in memory.

**Q: Will enabling online words slow down generation?**  
A: No! Words are pre-fetched in the background when you enable the feature, so password generation remains instant.

**Q: Can I use this offline?**  
A: Yes! Once loaded, the app works completely offline with the built-in 800+ word library. The online API is optional and only for additional variety.

**Q: Can I adjust the password length?**  
A: Yes! Use the slider in Customize Settings to select anywhere from 8 to 32 characters.

**Q: How many unique passwords can this generate?**  
A: With 800+ words across 4 themes, plus numbers and symbols, the app can generate trillions of unique password combinations. Enabling the online API increases this to virtually unlimited possibilities.

## License

Free to use and modify.
