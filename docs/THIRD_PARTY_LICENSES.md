# TheTowerSDK reference catalogue

Selected names, level limits, card factors, relic bonuses and unlock metadata are derived from TheTowerSDK at commit `6a6d3bc9101d68ad65b355122c6fe66af0a4610f`. The metadata is a community reference; it is not an official game specification. Rebuild with `python scripts/build-knowledge.py /path/to/pinned/checkout`.

MIT License

Copyright (c) 2026 TmRxJD

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

This project includes work derived from other open source projects.
See NOTICE for their copyright and license terms.


## Relic visual reference collection (Account Intelligence 2)

The twelve bundled, manually curated name-to-image references in `account/relic-vision.js` point to original game art hosted in [AngryBrit/tower-smith](https://github.com/AngryBrit/tower-smith/tree/da361120e28de87b33ffc340d25962b966dc6150/public/relics), pinned at `da361120e28de87b33ffc340d25962b966dc6150`. Mapping attribution: AngryBrit / TowerSmith, [CC BY-NC-SA 4.0](https://github.com/AngryBrit/tower-smith/blob/da361120e28de87b33ffc340d25962b966dc6150/LICENCE). Game artwork belongs to Tech Tree Games. This limited reference collection is attributed under that licence; the matching algorithm and UI were independently implemented here. No TowerSmith application code is copied. The original image files and their Git blob checksums are bundled in `account/references/`, with a collection licence notice. They are loaded from the same app origin only when the user requests visual matching; screenshots are processed on-device. CI evidence includes downloaded source reference images and reconstructed raster layouts for reproducibility, with the same attribution.
