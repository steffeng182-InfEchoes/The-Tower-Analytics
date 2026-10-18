# OCR regression image provenance

Public screenshots of The Tower game UI, used as recognition regression samples. Game artwork belongs to Tech Tree Games. The images contain game statistics, not account names or IDs.

- `history-compact.jpg`: u/Eeriestwolf1032, [Is this normal?](https://www.reddit.com/r/TheTowerGame/comments/1pem3lk/is_this_normal/), original image https://i.redd.it/h0qbibpbfb5g1.jpeg
- `history-tall.jpg`: u/ghettodactyl, [Battle History got added](https://www.reddit.com/r/TheTowerGame/comments/1o36mg7/battle_history_got_added/), original image https://i.redd.it/pf1cuxwufbuf1.jpg

Retrieved 2026-10-17. The private user-supplied screenshot used for local tournament/Dissonance checks is deliberately excluded. It can be supplied locally with `TOWER_PRIVATE_HISTORY_IMAGE`; it is never uploaded by the test runner.

## Account OCR fixtures (added 2026-10-18)

- `account-labs.jpg`: real game Lab 4/Game Speed Lv.7/Rush screenshot, MuMuPlayer lab guide, https://www.mumuplayer.com/blog/the-tower-lab-research-guide.html , image https://mumuglobal-res.fp.ps.easebar.com/file/69ddb4cd227cf8da7c0e4d9eN1iky74h03 . Tests treat the displayed running research as a target, not a completed level.
- `account-workshop.jpg`: real two-column defense workshop screenshot, MuMuPlayer turtle guide, https://www.mumuplayer.com/blog/the-tower-idle-tower-defense-turtle-build-guide.html , image https://mumuglobal-res.fp.ps.easebar.com/file/69cb3b82033f9b3293db5d0aRWSTZxOg03 . Only image layout is used as a fixture, not the article's strategy or mechanics claims. Visible costs remain unconfirmed OCR proposals (small decimal points may be missed).

Images show game UI only. No private user screenshots or OCR transcripts are included. Retained solely for recognizer regression testing; copyrights remain with their respective owners.
