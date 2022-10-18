# Plus One Action

This is a GitHub action that adds +1 and +2 labels to a Pull Request based on review
approval.


Sample config, place in `.github/workflows/plusone.yml`
```
name: Plus one

on:
  pull_request_review:
    types: [submitted, dismissed]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - uses: planningcenter/plus-one-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Copyright & License

Copyright (c) Planning Center, licensed MIT. See LICENSE file in this repo.
