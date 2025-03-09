# Open 777

<p align="center">
  <img width="120" height="120" src="./docs/docs_logo.png">
</p>

### 🜁🜂 Visit [Open 777 Here](https://adamblvck.github.io/open_777/) 🜄🜃

![](./docs/screenshot_2025.png)

## Changelog 2025 march 9

- Added Card Wiew
  - Tree of Life visualization of each pathway
  - Perfect for mobile and desktop usage  
  - Added ability to quickly copy all correspondences of a certain pathway. This is perfect for AI usage.
- Vastly improved search throughout the library
- 98% completion of Liber 777 correspondences, thanks to an anonymous contributer from [Liber Oz](https://liberoz.org/)

## About

Open 777 is a small online website for easily looking up Crowley's Esoteric Kabbalistic / Qabalistic correspondences, meant for Esoteric Study & Practice.

The website consists of transcriptions done by [ADAM BLVCK](https://adamblvck.com) from the now in open-domain book "777" by Aleister Crowley (with the help of Occultish Angel, and also an anonymous Frater from [Liber Oz](https://liberoz.org/)). Since looking up of correspondences in the actual book can be quite tedious, and since no courated dataset of these correspondences could be found (which in itself is a treasure mine for enhancing AI-tools), it's been decided to create one.

If you're looking for a way to look-up Gene Keys and IChing-based correspondences, I refer to [Gnomon](https://gnomon.adamblvck.com/).

Since 777 includes correspondences from the Kabbalistic Scale to the 64 hexagram, and the Gene Keys include correspondences to Tarot's 22 pathways, a marriage between both systems might result one day.

## The Website

In the books, the tables of correspondences is organized in 32 rows which represent the Kabbalistic scale of meaning, which spans many pages of correspondence categories. In the app a transposed approach is used, where the 32 "steps" on the scale are presented as columns, whereas the rows indicate categories.

The website uses [Glide Data Grid](https://github.com/glideapps/glide-data-grid) which is most suitable for this purpose, and includes search-functionality across the whole table.

**Update 2025: a new card-view update has been added, for better immersion and searching through the library. It's also mobile friendly now!**

## The Data

The to-transcribe data is huge, and thus this website will be updated every few days until all correspondences are covered. If you think you can help with transcription, please message me here or at contact@adamblvck.com.

The correspondence dataset can be found as a json object in the file `src/liber_777.js`, or `docs/liber_777.csv`, but the source of both these files is now hosted on [Google Sheets](https://docs.google.com/spreadsheets/d/1bJPN_gs6USHniUfmWFIACCroOAzOq8jX2XWITclSBA0/edit?usp=sharing). The python notebook located at `docs/convert_json.ipynb` can be used to convert a csv (exported from the Google Sheet) into an appropriate format for use in a website, or javascript environment.

A recent contribution by an anonymous frater completed almost all columns from Liber 777.

**Please note, that this app capture's Aleister Crowley's Correspondences, not all other correspondences from the many esotericists out there. The idea to capture many magicinan's correspondences in a beautiful correspondence platform is a truly blessed idea.**

### 🜁🜂 Visit [Open 777 Here](https://adamblvck.github.io/open_777/) 🜄🜃

## Publishing to GitHub Pages

To publish a new build:

```
npm install -g gh-pages --save-dev
```

Then publish through:

```
npm run deploy
```

The command above will build an optimized Standalone React Build, then commit this data the gh-pages branch. In GitHub this deployment can then be selected in Settings>Pages, allowing for free gitHub pages deployment.