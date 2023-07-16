# Open 777



## Publishing to GitHub Pages

To publish a new build:

```
npm install -g gh-pages --save-dev
```

Then publish through:

```
npm run build
```

The command above will build an optimized Standalone React Build, then commit this data the gh-pages branch. In GitHub this deployment can then be selected in Settings>Pages, allowing for free gitHub pages deployment.