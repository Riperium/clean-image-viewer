# Clean Image Viewer
Enhanced Image Viewer alternative for Chrome
Minimal Chrome extension that replaces the native image viewer with a clean fullscreen viewer for direct images, X and Reddit.

## Features

- Automatic activation on standalone image pages
- No visible toolbar; all controls via keyboard
- Zoom: mouse wheel
- Rotate: `Q` (left), `R` (right)
- Flip: `F` (horizontal), `V` (vertical)
- Reset: `0`
- Zoom adjustment: `+` / `-`
- Save: `S`
- Info: `I`
- Close: `Esc`

## Install

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Open any image URL directly.

## Architecture

- `content.js`: detects image pages and redirects to the custom viewer
- `viewer.html`: the custom image viewer page
- `viewer.js`: handles zoom, rotation, keyboard controls
- `viewer.css`: minimal styling
- `background.js`: extension service worker

No external requests, no malware, no redirect rules.
