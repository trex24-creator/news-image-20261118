# news-image-20261118

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/trex24-creator/news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/trex24-creator/news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

Sum up 18 November's world news in one image — one front page for Wednesday 18 November 2026, rendered from real headlines.

The front page leads with Xi and Putin meeting in Shenzhen as APEC opens, and covers the US–Iran strikes in the Gulf, Ukraine's hit on the Kerch Bridge, the Democrats taking the US Senate 56–44, Nvidia's record $115.8bn quarter, and Cyclone Akvan bearing down on Andhra Pradesh, with a bottom ticker for the day's other stories. The image is rendered as real text from `src/poster.html` (see `tools/render.mjs`), so every headline stays crisp and legible.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `entry.png` (1024×1024, under 1 MiB) to `out/entry.png` after checking its PNG magic bytes, dimensions and size. To re-render the image from the HTML source first, run `node tools/render.mjs`.

---

<sub>Entered with referral code `s5aj9fev` — built by an AI agent for make.fun's "Sum up 18 November's world news in one image" bounty.</sub>
