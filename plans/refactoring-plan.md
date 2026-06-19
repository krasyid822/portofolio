# Refactoring Plan: Clean Architecture + One Feature One File + SEO

## Current State Analysis

The project is a single-page retro portfolio with all CSS inlined in `index.html` and all JS in two monolithic files (`interactive.js` and `repo-index.js`). This violates clean architecture and makes maintenance difficult.

### Current File Structure
```
/
├── index.html          # 1110 lines: ALL HTML + ALL CSS + inline scripts
├── rsc/js/
│   ├── interactive.js  # 384 lines: scan transition, circular reveal, page routing,
│   │                   #   magnetic cursor, balloon popup, theme toggle
│   └── repo-index.js   # 1401 lines: GitHub API, bookmark cards, repo cards,
│                       #   search/filter, dark mode, caching
└── rsc/Rasyid Kurniawan's Bookmarks/
    └── index.html      # Standalone bookmarks page with inline CSS+JS
```

### Features Identified (to split into separate files)

| # | Feature | Currently In | Lines |
|---|---------|-------------|-------|
| 1 | CSS Design System (variables, layout, components) | `index.html` `<style>` | ~810 lines |
| 2 | Scan-line Page Transition | `interactive.js` | ~94 lines |
| 3 | Circular Reveal Theme Transition | `interactive.js` | ~50 lines |
| 4 | Page Routing / SPA Navigation | `interactive.js` | ~40 lines |
| 5 | Logo Hover Effect | `interactive.js` | ~12 lines |
| 6 | Magnetic Cursor Effect | `interactive.js` | ~55 lines |
| 7 | Balloon Popup System | `interactive.js` | ~65 lines |
| 8 | Theme Toggle (Light/Dark) | `interactive.js` | ~25 lines |
| 9 | Service Worker Registration | `index.html` inline | ~12 lines |
| 10 | Projects Loader (from projects.json) | `index.html` inline | ~28 lines |
| 11 | GitHub Repo Index (API, cache, cards) | `repo-index.js` | ~1401 lines |
| 12 | Bookmarks Page (standalone) | `rsc/Rasyid.../index.html` | ~630 lines |

## Proposed New Architecture

### Directory Structure
```
/
├── index.html              # Main entry: minimal HTML skeleton, loads assets
├── assets/
│   ├── css/
│   │   ├── design-system.css    # CSS variables, reset, base styles
│   │   ├── layout.css           # Header, nav, hero, grid, footer
│   │   ├── components.css       # Cards, buttons, badges, featured projects
│   │   ├── transitions.css      # Scan-line overlay, circular reveal, page routing
│   │   ├── balloon-popup.css    # Balloon popup styles
│   │   └── responsive.css       # All media queries
│   ├── js/
│   │   ├── main.js              # Entry point: imports/loads all modules
│   │   ├── modules/
│   │   │   ├── scan-transition.js    # Canvas scan-line page transition
│   │   │   ├── theme-transition.js   # Circular reveal theme toggle
│   │   │   ├── page-router.js        # SPA page routing/navigation
│   │   │   ├── magnetic-cursor.js    # Magnetic attraction effect
│   │   │   ├── balloon-popup.js      # Iframe popup system
│   │   │   ├── theme-toggle.js       # Light/dark mode with localStorage
│   │   │   ├── service-worker.js     # SW registration (moved from inline)
│   │   │   └── projects-loader.js    # Fetch projects.json, render cards
│   │   └── vendor/
│   │       └── repo-index.js         # Standalone GitHub repo index (kept separate)
│   └── images/               # Moved from rsc/jpg/ and rsc/png/
│       ├── jpg/
│       └── png/
├── rsc/                      # Legacy - kept for backward compat
│   └── Rasyid Kurniawan's Bookmarks/
│       └── index.html        # Refactored to load external CSS/JS
├── projects.json
├── manifest.json
├── service-worker.js
├── sitemap.xml
├── robots.txt
└── CNAME
```

### Module Dependency Graph
```
main.js
  ├── page-router.js        (no deps)
  ├── scan-transition.js    (no deps, uses #scan-canvas)
  ├── theme-transition.js   (no deps, uses #transition-overlay)
  ├── theme-toggle.js       (no deps, uses localStorage)
  ├── magnetic-cursor.js    (no deps)
  ├── balloon-popup.js      (no deps, exposes window.openPopup)
  ├── projects-loader.js    (no deps, fetches projects.json)
  └── service-worker.js     (no deps)
```

### Data Flow
```
User clicks nav tab
  → page-router.js:switchPage()
    → scan-transition.js:playScanTransition(callback)
      → callback: show/hide sections via .inactive class

User clicks theme toggle
  → theme-toggle.js: click handler
    → theme-transition.js:playRevealTransition(x, y, callback)
      → callback: toggle .light-theme class, save to localStorage

User clicks external link (data-popup)
  → balloon-popup.js: click delegation
    → openPopup(url, title)
      → creates iframe overlay

Page load
  → projects-loader.js: fetch projects.json
    → render featured cards
  → service-worker.js: register SW
```

## SEO Optimization Plan

### Current SEO Issues
1. **No semantic HTML structure** - Missing `<article>`, `<section>` with proper headings hierarchy
2. **No Open Graph / Twitter Card meta tags** - Poor social sharing preview
3. **No structured data (JSON-LD)** - No rich search results
4. **No canonical URL** - Possible duplicate content issues
5. **No image alt text on dynamic images** - Project thumbnails lack alt text
6. **No heading hierarchy** - Multiple `<h1>`? Let me check... Currently one `<h1>` which is good, but needs verification
7. **No breadcrumb navigation** - Not critical for SPA but helpful
8. **No lazy loading on above-fold images** - Profile image should load eagerly
9. **No `lang` attribute refinement** - Currently `lang="id"` which is correct
10. **No performance optimization** - CSS inlined blocks rendering

### SEO Fixes
1. Add Open Graph (`og:title`, `og:description`, `og:image`, `og:url`)
2. Add Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
3. Add JSON-LD structured data (Person, Portfolio, WebSite)
4. Add canonical URL
5. Fix heading hierarchy (h1 → h2 → h3)
6. Add `loading="lazy"` to below-fold images, `eager` to hero image
7. Add proper `alt` text to dynamically loaded project images
8. Add `aria-label` to interactive elements (buttons, links)
9. Ensure proper `meta description` and `meta keywords`

## Implementation Steps (Ordered)

### Phase 1: Create Directory Structure
1. Create `assets/css/`, `assets/js/modules/`, `assets/images/` directories
2. Move image files from `rsc/jpg/` and `rsc/png/` to `assets/images/`

### Phase 2: Extract CSS into Separate Files
3. Create `assets/css/design-system.css` - CSS variables, reset, base styles
4. Create `assets/css/layout.css` - Header, nav, hero, grid, footer
5. Create `assets/css/components.css` - Cards, buttons, badges, featured projects
6. Create `assets/css/transitions.css` - Scan overlay, circular reveal, page routing
7. Create `assets/css/balloon-popup.css` - Popup styles
8. Create `assets/css/responsive.css` - All media queries

### Phase 3: Split JavaScript into Modules
9. Create `assets/js/modules/scan-transition.js`
10. Create `assets/js/modules/theme-transition.js`
11. Create `assets/js/modules/page-router.js`
12. Create `assets/js/modules/magnetic-cursor.js`
13. Create `assets/js/modules/balloon-popup.js`
14. Create `assets/js/modules/theme-toggle.js`
15. Create `assets/js/modules/projects-loader.js`
16. Create `assets/js/modules/service-worker.js`
17. Create `assets/js/main.js` - Entry point that initializes all modules

### Phase 4: Refactor index.html
18. Replace inline `<style>` with `<link>` to CSS files
19. Replace inline `<script>` with `<script src>` to JS modules
20. Add SEO meta tags (OG, Twitter, JSON-LD)
21. Fix heading hierarchy and ARIA attributes
22. Add canonical URL

### Phase 5: Update Other Files
23. Update `manifest.json` paths if images moved
24. Update `service-worker.js` cache paths
25. Update `sitemap.xml` if needed
26. Refactor bookmarks page to use external CSS/JS

### Phase 6: Verify
27. Test all features work correctly
28. Validate HTML/CSS/JS
29. Test SEO meta tags with validator
30. Test PWA functionality

## Key Design Decisions

1. **No build tools** - Keep vanilla JS/CSS to maintain simplicity and PWA compatibility
2. **ES Modules** - Use `type="module"` for JS files to get clean imports without bundlers
3. **CSS custom properties** - Already using `:root` variables, just split into files
4. **Backward compatibility** - Keep `rsc/` directory for existing bookmarks page
5. **Progressive enhancement** - Core content loads without JS; JS adds interactivity
