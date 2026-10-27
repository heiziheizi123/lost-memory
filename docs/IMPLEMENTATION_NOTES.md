# UI redesign compatibility baseline

Base commit: a5cc6ed79da2a5cbc39367a106d52ff886dd70f9.

- Narrative tables P/L/R/C/RS remain authoritative. R has 16 lookup records, C has 8 unordered item combinations, RS has r1–r9 plus r10 (final deduction).
- Lookup requires registered person/place indexes; after() preserves the J, D and P unlock conditions. ready() requires every record and term listed by the deduction.
- State sets: p, l, t, seen, items, rest, comb; sel is an array limited to three items. UI selection and animation state are separate from game state.
- SAVE_KEY stays lost_memory_save_v1; version stays 1. Preserve all fields, transcript output, legacy term migration and age normalization. No automatic save overwrites. Continue loads the existing save before entering play.
- finish() keeps lost_memory_complete and ending.html; ending.html and thanks.html remain unchanged. Video completion still adds 寻人启事录像记录.
- UI preferences use a separate key, lost_memory_ui_v1. Timeline derives only from completed deductions; no new story facts.
- Wrong answers retain selections and identify the sentence slot to review, referencing the existing clue rather than adding facts.

Implementation uses native HTML/CSS/JS and a locally defined SVG assistant; no runtime framework or external font dependency. The follow-up reference-scene presentation uses a local user-supplied image atlas and browser SVG viewports/masks for the reference illustration, with Canva's element map recorded in assets/canva-elements.json.
