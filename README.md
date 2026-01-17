# Element Inspector

A Chrome Extension that allows you to inspect HTML elements on web pages and automatically copy their information to the clipboard.

## Features

- **Easy Activation**: Click the extension icon to start inspection mode
- **Element Selection**: Hover over any element on the webpage
- **Automatic AI-Ready Copying**: Click on an element to copy a compact summary to your clipboard, formatted for AI prompts:
  - **Compact DOM Path**: Abbreviated path with shortened class names for brevity
  - **Position**: Size and position of the element
  - **React Component**: Automatic detection of React component names
  - **Smart HTML**: A compact representation of the element's HTML including attributes and text preview
- **Optimization**: All data is wrapped in backticks and formatted to minimize token usage in chat interfaces

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `element-inspector` folder

## Usage

1. **Activate Extension**: Click the Element Inspector icon in the Chrome toolbar
2. **Start Inspection Mode**: Click "Start Inspecting" in the popup
3. **Select Element**: Move your mouse over the webpage - elements will be highlighted on hover
4. **Copy Information**: Click on the desired element
5. **Done**: The information is now in your clipboard and can be pasted into AI prompts

### Tips

- The copied information is in a **compact format** and can be directly pasted into AI prompts
- Inspection mode automatically ends after an element is selected
- Press `ESC` to exit inspection mode early
- The format is optimized for maximum readability and minimal space in chat interfaces
- React components are automatically detected and displayed (if available)

## Project Structure

```
element-inspector/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── styles.css            # Popup styles
├── content.js            # Content script for webpage interaction
├── content-styles.css    # Styles for highlight overlays
├── icons/                # Extension icons
└── README.md             # This file
```

## Technical Details

- **Manifest Version**: 3
- **Permissions**:
  - `activeTab`: Access to the active tab
  - `scripting`: Injection of content scripts
- **Content Script**: Dynamically injected when inspection mode is activated
- **Communication**: Uses Chrome's Message Passing API

## Features in Detail

### Visual Feedback

- Elements are highlighted with a blue overlay on hover
- Smooth transitions for a pleasant user experience
- Cursor changes to a crosshair in inspection mode

### Copied Data

The extension copies data in a compact, backtick-wrapped format designed for AI prompts:

```
`DOM Path: div#root > div.min-h.font-mono > header.fixed.top-0.left-0.right-0.z-50 > button.px-4.h-8.flex.items.
Position: top=16px, left=1261px, width=73px, height=32px
React Component: Header
HTML Element: <button class="px-4 h-8 flex items-center justify-center text-sm font-bold uppercase transition-all duration-200 hover:opacity-70 rounded-full" style="border: 1px solid var(--border-primary);">LOGIN</button>`
```

## Development

### Prerequisites

- Google Chrome Browser
- Basic knowledge of HTML, CSS, and JavaScript

### Testing Local Changes

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the reload icon on the Element Inspector extension
4. Test the changes on any webpage

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Feedback and suggestions for improvement are welcome!

---

**Version**: 1.0.0  
**Created**: 2026
