# OCR regression image provenance

Public screenshots of The Tower game UI, used as recognition regression samples. Game artwork belongs to Tech Tree Games. The images contain game statistics, not account names or IDs.

- `history-compact.jpg`: u/Eeriestwolf1032, [Is this normal?](https://www.reddit.com/r/TheTowerGame/comments/1pem3lk/is_this_normal/), original image https://i.redd.it/h0qbibpbfb5g1.jpeg
- `history-tall.jpg`: u/ghettodactyl, [Battle History got added](https://www.reddit.com/r/TheTowerGame/comments/1o36mg7/battle_history_got_added/), original image https://i.redd.it/pf1cuxwufbuf1.jpg

Retrieved 2026-10-17. The private user-supplied screenshot used for local tournament/Dissonance checks is deliberately excluded. It can be supplied locally with `TOWER_PRIVATE_HISTORY_IMAGE`; it is never uploaded by the test runner.

## Account OCR fixtures (added 2026-10-18)

- `account-labs.jpg`: real game Lab 4/Game Speed Lv.7/Rush screenshot, MuMuPlayer lab guide, https://www.mumuplayer.com/blog/the-tower-lab-research-guide.html , image https://mumuglobal-res.fp.ps.easebar.com/file/69ddb4cd227cf8da7c0e4d9eN1iky74h03 . Tests treat the displayed running research as a target, not a completed level.
- `account-workshop.jpg`: real two-column defense workshop screenshot, MuMuPlayer turtle guide, https://www.mumuplayer.com/blog/the-tower-idle-tower-defense-turtle-build-guide.html , image https://mumuglobal-res.fp.ps.easebar.com/file/69cb3b82033f9b3293db5d0aRWSTZxOg03 . Only image layout is used as a fixture, not the article's strategy or mechanics claims. Visible costs remain unconfirmed OCR proposals (small decimal points may be missed).

Images show game UI only. No private user screenshots or OCR transcripts are included. Retained solely for recognizer regression testing; copyrights remain with their respective owners.


## Account Intelligence 2 regression provenance

- `tests/account/browser.cjs` renders explicitly reconstructed dark lab/relic lists into actual raster pixels. Values are synthetic test data, never a claimed account state. Tesseract's real Worker/WASM recognizes the pixels; outputs are not mocked.
- Symbol-only regression raster combines the actual Flux, Lumin and Pulse game art from the versioned reference collection documented in THIRD_PARTY_LICENSES.md. This is a composite test image, not an actual collected-relic screenshot.
- Public actual multi-relic shop screenshot: u/destructor212113, [New Relics](https://www.reddit.com/r/TheTowerGame/comments/1t3z6s5/new_relics/), original `https://i.redd.it/a5clov19m7zg1.png`. Names visible in the source page: Falling Apple, Haunted Mirror, 3 Body Solution, Crop Circle. The shop proves neither purchase nor ownership. The actual public image is retained as `relics-real-shop.png` for deterministic, mandatory image tests. Text OCR and icon matching are logged separately.
- Images and browser screenshots are attached to the workflow evidence artifact. No private player screenshots are uploaded.

- `labs-real-list.jpg`: u/kindahipster, [Worth it to continue lab speed?](https://www.reddit.com/r/TheTowerGame/comments/1uc0tgs/worth_it_to_continue_lab_speed_also_share_any_lab/), original `https://i.redd.it/2q8na1fi7p8h1.jpg`. A real two-column Select Research screen. Visible levels are research targets, not completed levels. Current Attack Speed51/x2.02 and Critical Factor34/x2.02 are review proposals verified against the target levels52/35 and pinned linear formulas; users must confirm them. No private name or game ID is included.
