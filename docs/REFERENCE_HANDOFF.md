# Reference artwork implementation and handoff

## Source and Canva work

The user supplied `ChatGPT 图像 2026年10月27日 01_41_19.png` (1586×992) and requested a close implementation using Canva. The reference is an art-direction sheet. Its illustrative deduction text is not an instruction to change the actual case facts.

Canva image-to-design created a saved, independently editable reference with 59 image assets and separate text elements:

- Design ID: `DAHZIehdGUg`
- Saved reference: https://www.canva.com/d/xmZm0GD_8Vrws6h
- A draft transaction was used to remove the right-hand explanatory panel's foreground elements, leaving the main game composition. This draft was previewed but **not committed**. Canva's commit tool requires an explicit approval after preview; the user asked to defer such approvals until tomorrow. Transactions can expire, so the saved full reference and the local asset manifest are the durable handoff.
- Background removal was attempted for the main SELA figure and six expression assets. Canva reported that it requires a paid plan. No purchase, upgrade or subscription action was taken.

`assets/canva-elements.json` records each asset ID, page location and dimensions. No expiring signed media URLs are used by the game.

## Local implementation

- `reference-atlas.webp` is the complete user reference, re-encoded at quality 90 (455,718 bytes), with no layout changes. Browser SVG viewports crop the photos and expressions from that local atlas; a browser clip path masks the main SELA silhouette. These are browser presentation crops, not transparent exports from Canva.
- Live HTML/CSS reconstructs the dossier layers, left folder tabs, keycaps, nine fanned reasoning cards, red current-selection label, loose illustrated photo, textured paper, desktop objects and assistant paper notes.
- Main SVG character source corresponds to Canva asset `MAHZIeDVah0`; expression tiles use the six corresponding Canva-identified regions. The original SVG state implementation remains available, with ten live textual state names and the reference expression tiles used as the visible art.
- The new reference presentation is in `reference-scene.css` and `reference-scene.js`; the original game script and save-system.js are preserved. `case-ui.js` now preserves the card's baseline transform while dragging so a centered mobile card does not jump sideways.
- Original P/L/R/C/RS facts and answers are retained. Reference photos are illustrative; the full-size photo is labeled accordingly. No weather, identity or driving-visibility conclusion from the illustrative mockup is added to the investigation.
- Desktop matches the reference composition; compact phones use a readable single card and bottom navigation. The right-hand interaction instructions in the reference are a design guide, not permanently displayed game UI.

## Deferred items

1. Review the Canva reference and decide whether to save a cleaned main-view derivative. Re-create the temporary draft if it has expired.
2. Optional: authorize/perform Canva export of clean, higher-quality separate art assets, and replace the local atlas crops. A transparent cutout via Canva requires an eligible paid plan; the current browser mask is the working fallback and does not require an upgrade.
3. Validate Android Chrome, iOS Safari and iPad Safari on actual devices, including media playback and system interruptions. No purchase or deployment/merge was performed.

## Validation

The automated investigation and interaction suites were rerun against the reference-directed layout, including 320px, tablet and desktop widths. See TEST_RESULTS.md. Desktop and phone screenshots accompany the local handoff outputs.
