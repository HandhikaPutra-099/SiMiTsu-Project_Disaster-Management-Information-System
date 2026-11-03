# SIMITSU: Sistem Mitigasi Tsunami Indonesia

SIMITSU is an Indonesian-language tsunami education site. It presents historical records, a Leaflet map, cause animations, an interactive Canvas 2D scenario simulator, and practical preparedness guidance. Simulation values are educational illustrations, not forecasts or official warnings.

## Requirements

- Node.js 22.12 or later
- npm

## Run locally

```sh
npm install
npm run dev
```

## Type-check and production build

```sh
npm run typecheck
npm run build
npm run preview
```

The production build is written to `dist/`.

## Project structure

```text
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── database/       # Historical archive, record table, and archive summary
│   ├── education/      # Tsunami-cause explanations and animation canvases
│   ├── home/           # Homepage introduction
│   ├── layout/         # Navigation, page layout, and footer
│   ├── map/            # Existing Leaflet map controls and map container
│   ├── mitigation/     # Public safety guidance
│   └── simulator/      # Existing scenario controls and Canvas 2D visualization
├── data/               # Typed historical-event records
├── integrations/       # Leaflet and preserved classic-script integration
├── styles/              # Tailwind entry and component-specific styling
└── types/               # Shared browser integration types
assets/
├── css/                 # Existing visual identity and responsive styles
└── js/                  # Preserved map, canvas simulator, and cause animations
legacy.html              # Original static page retained as a fallback
```

The typed React archive and history components use `src/data/tsunamiEvents.ts`. The legacy Leaflet and Canvas 2D implementations remain in `assets/js/` and are loaded after React renders their mount elements. This keeps the established map layers and simulator phases without a Three.js replacement.

The original stylesheets remain the baseline for existing sections and responsive behavior. Tailwind utilities are used for component-level layout where they do not duplicate those styles.

## Data and external services

- The nine historical events are selected records from NOAA NCEI, not a complete catalog.
- Esri map tiles and NOAA source links require an internet connection.
- Illustrative sensor points are not verified sensor locations or operational data.
- Contact and evacuation information is educational. Follow official BMKG, BNPB, and local authority instructions during an emergency.
- No API keys or credentials are required by the frontend.

## Vercel deployment

Import the repository with its root directory set to the project root. Vercel can detect Vite automatically. Use `npm install` for dependency installation, `npm run build` for the build command, and `dist` as the output directory. No custom `vercel.json` is needed for this single-page frontend.

`legacy.html` preserves the previous static implementation in the repository as a migration fallback. It is not the Vite production entry; `index.html` is the React application entry point.
