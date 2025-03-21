# 📦 @microlib/try

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Bundlephobia][bundlephobia-src]][bundlephobia-href]

Try is a quasi monad that mimics the Promise API while handling synchronous and asynchronous code safely.

## 🚀 Installation

```bash
npm install @microlib/try
```

```bash
bun add @microlib/try
```

## 🔥 Features

- Supports both synchronous and asynchronous execution.
- Mimics the `Promise` API (`then`, `catch`, `finally`).

## 📖 Usage

Synchronous Usage

```ts
import { Try } from "@microlib/try";

function task() {
  if (Math.random() > 0.5) {
    throw new Error("Something went wrong");
  } else {
    return "Hello";
  }
}

// Try(task: syncfn) returns Success<T> | Failure (which is just like a Promise, but synchronous)
const result = Try(task)
  .catch(() => "Bye")
  .then((v) => v + ", World!");

if (result.ok) {
  console.log(result.value);
}

/* 

Output can be any of these:
- Hello, World!
- Bye, World!

*/
```

Asynchronous Usage

```ts
import { Try } from "@microlib/try";

async function task(): Promise<string> {
  return new Promise((resolve, reject) =>
    setTimeout(
      () => (Math.random() > 0.5 ? resolve("Theo") : reject("Prime")),
      100
    )
  );
}

// Try(task: asyncfn) returns a Promise
await Try(task)
  .then((v) => console.log(`${v} uses VSCode`))
  .catch((e) => console.log("NeoVim FTW"));

/* 

Output can be any of these:
- Theo uses VSCode
- NeoVim FTW

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
