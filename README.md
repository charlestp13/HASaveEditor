# Tauri Base App

A minimal, reusable Tauri + React + TypeScript base for building desktop apps.

## Stack

- **Tauri 2** - Desktop app framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Router** - Navigation
- **shadcn/ui-style components** - Pre-built Button, Card, Input

## Getting Started

### Prerequisites

1. [Node.js](https://nodejs.org/) (v18+)
2. [Rust](https://www.rust-lang.org/tools/install)
3. Platform-specific dependencies:
   - **Windows**: WebView2 (usually pre-installed)
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
   - **Linux**: See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Development

```bash
# Install dependencies
npm install

# Run in development (opens desktop window with hot reload)
npm run tauri:dev

# Or run just the web version in browser
npm run dev
```

### Build

```bash
# Build for production
npm run tauri:build
```

Output will be in `src-tauri/target/release/`.

## Project Structure

```
tauri-skeleton/
├── src/                    # React frontend
│   ├── components/
│   │   └── ui/             # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── index.ts
│   ├── pages/              # Route pages
│   │   ├── HomePage.tsx
│   │   ├── ExamplePage.tsx
│   │   └── index.ts
│   ├── lib/
│   │   └── utils.ts        # Utility functions (cn for classnames)
│   ├── App.tsx             # Router setup
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs         # Tauri entry point
│   ├── tauri.conf.json     # Tauri configuration
│   └── Cargo.toml          # Rust dependencies
└── package.json
```

## Adding Components

### shadcn CLI

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

## Tauri APIs

```tsx
import { open } from "@tauri-apps/plugin-dialog"
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"

// Open file dialog
const file = await open({ filters: [{ name: "JSON", extensions: ["json"] }] })

// Read/write files
const content = await readTextFile(file.path)
await writeTextFile("data.json", JSON.stringify(data))
```

Note: Some APIs require enabling plugins in `src-tauri/Cargo.toml` and `tauri.conf.json`.

## Customization

### Change App Name

1. Update `productName` in `src-tauri/tauri.conf.json`
2. Update `identifier` (use reverse domain notation like `com.yourname.appname`)
3. Update `name` in `package.json`

### Add Dark Mode Toggle

The CSS variables in `index.css` support dark mode. Add a `.dark` class to `<html>` to enable.

### Add Routes

1. Create a new page in `src/pages/`
2. Export from `src/pages/index.ts`
3. Add route in `src/App.tsx`

