# GridPhoto — Grid Stitcher

GridPhoto is a React + Vite web app that lets you stitch multiple photos into printable grids entirely in the browser. Drop in batches of photos (including HEIC shots from iOS), choose the layout and print dimensions, and download a ZIP archive of ready-to-print images with consistent sizing.

## Features
- Drag-and-drop or file picker support for batching up to ~50 source photos.
- Flexible grid layouts (1–6 rows/columns) with live previews and pixel dimensions.
- Precise print controls: set physical size (cm), DPI, gap width, separator color, rotation, and JPG quality.
- Automatic HEIC → JPG conversion via WebAssembly for Apple Live Photos and iPhone captures.
- 100% client-side processing; nothing leaves the browser.
- Bulk ZIP export with numbered grid files for easy printing.

## Requirements
- Node.js 20.x or newer (18+ should work, but 20 LTS is recommended).
- npm (bundled with Node.js) or another compatible package manager.

## Quick Start
```bash
# Install dependencies
npm install

# Start the development server with hot reload
npm run dev
```

Open the printed local URL (default `http://localhost:5173`) in your browser. Drag images onto the drop zone or use the **Browse files** button, adjust the layout and output settings, then click **Download all (ZIP)** to export your grids.

## Building for Production
```bash
# Generate type definitions and a production bundle in dist/
npm run build

# Optionally preview the built app locally
npm run preview
```

The build output lives in the `dist/` directory and can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Tech Stack
- React 18 with hooks for stateful UI.
- Vite for fast local development and bundling.
- Tailwind CSS for utility-first styling.
- JSZip for client-side ZIP archive generation.
- heic2any for converting HEIC/HEIF photos in the browser.

## Contributing
Contributions are welcome! Feel free to open issues for bugs or ideas, or submit pull requests that describe the changes you are proposing. Before committing, please ensure the app builds (`npm run build`) and keep the UI consistent with the current styling.