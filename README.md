# @microlib/try

Easily convert promises or lazy synchronous functions to result

### 🚀 Installation

```bash
npm install @microlib/try
```

```bash
bun add @microlib/try
```

### 📖 Usage

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
OR
{ ok: false, error: Error: Something went wrong }

*/
```

## 🍀 Show your Support

Give a ⭐️ if this project helped you!
