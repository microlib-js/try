# 📦 @microlib/try

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Bundlephobia][bundlephobia-src]][bundlephobia-href]

Easily convert promises or lazy synchronous functions to result

## 🚀 Installation

```bash
npm install @microlib/try
```

```bash
bun add @microlib/try
```

## 📖 Usage

```ts
import { Try } from "@microlib/try";

function myTaskSync() {
  if (Math.random() > 0.5) {
    throw new Error("Something went wrong");
  } else {
    return "Success";
  }
}

function myTaskAsync() {
  return new Promise((resolve, reject) => {
    if (Math.random() > 0.5) {
      reject(new Error("Something went wrong"));
    } else {
      resolve("Success");
    }
  });
}

const resultSync = Try(myTaskSync);
const resultAsync = await Try(myTaskAsync);

console.log(resultSync);
console.log(resultAsync);

/* 

Output can be any of these:

{ ok: true, value: "Success" }
           or
{ ok: false, error: Error: Something went wrong }

*/
```

## 🍀 Show your Support

Give a ⭐️ if this project helped you!

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@microlib/try?style=flat-square
[npm-version-href]: https://npmjs.com/package/@microlib/try
[npm-downloads-src]: https://img.shields.io/npm/dm/@microlib/try?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@microlib/try
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/microlib-js/try/release.yaml?branch=main&style=flat-square
[github-actions-href]: https://github.com/microlib-js/try/actions?query=workflow%3Aci
[bundlephobia-src]: https://img.shields.io/bundlephobia/minzip/@microlib/try?style=flat-square
[bundlephobia-href]: https://bundlephobia.com/package/@microlib/try
