# CODE SELA UI regression results

Tested on 2026-10-27 with Playwright 1.62.1 and installed Microsoft Edge (Chromium), Windows.

## Automated checks passed

- 1440×1000 desktop, 768×1024 tablet, and 320×740 compact phone layouts.
- Search all 16 original person/place records; all 8 original item combinations unlock every deduction.
- Complete r1–r9 and final r10, build ten timeline entries, save version-1 state, reload, continue and reach ending.html with lost_memory_complete=1.
- Incorrect deduction retains selected terms, marks the sentence slot and gives a specific clue; it does not advance progress.
- Click card list, previous/next and keyboard arrow alternatives.
- Distance swipe changes the selected card; a short, slow drag restores it. Pointer cancellation clears dragging. Viewport rotation/resize leaves no dragging state.
- No horizontal document overflow at 320px. Tested navigation buttons are 52px tall; settings labels provide 52px activation areas.
- Reduced-motion system preference skips the long opening; normal opening is skippable. Continue bypasses the opening.
- Separate media/effect mute preferences and motion preference persist across refresh.
- Legacy version-1 save maps 事故后存活→事故后仍有哭声 and 现场封锁→外围未封闭, retains deduction state and normalizes 六岁/6岁→三岁/3岁.
- No JavaScript page errors during these scenarios.

The main investigation script, save-system.js, ending.html and thanks.html are preserved. No story, answer or unlock-condition changes are intended.

## Reproduce

Install Node.js, then run `npm install`, `npx playwright install chromium`, and `npm test`. If using installed Edge, set `TEST_BROWSER_CHANNEL=msedge` instead of downloading Chromium. The runner serves the repository on 127.0.0.1:8123 and shuts down afterwards. Screenshots are written to ignored `tests/artifacts/`.

## Still requires device validation

These checks are Chromium automation, not Safari or Android certification. Android Chrome, iOS Safari and iPad Safari on actual devices have not been tested. Verify safe-area rendering, real touch scrolling versus swiping, software keyboard opening, system gesture interruption, real video playback and the complete flow on those devices. The existing binary media files were not downloaded into the local test workspace, so media playback and the images on the thanks page are not covered by the automated run. Their repository paths and files are unchanged.
