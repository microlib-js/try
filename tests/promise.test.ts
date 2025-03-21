import { describe, expect, test } from "bun:test";
import { Failure, Success, Try } from "@microlib/try";

describe("Try API Mimics Promise", () => {
  test("Try.success behaves like Promise.resolve", () => {
    const success = Try.success(42);
    expect(success.ok).toBe(true);
    expect(success).toBeInstanceOf(Success);
    expect(Try.unwrap(success)).toBe(42);
  });

  test("Try.failure behaves like Promise.reject", () => {
    const error = new Error("Failure");
    const failure = Try.failure(error);
    expect(failure.ok).toBe(false);
    expect(failure).toBeInstanceOf(Failure);
    expect(() => Try.unwrap(failure)).toThrow(error);
  });

  test("Try.then() propagates success like Promise.then()", () => {
    const result = Try.success(5).then((x) => x * 2);
    expect(result.ok).toBe(true);
    expect(result).toBeInstanceOf(Success);
    expect(Try.unwrap(result)).toBe(10);
  });

  test("Try.then() skips failure like Promise.then()", () => {
    const error = new Error("Oops");
    const result = Try.failure(error).then((x) => (x as number) * 2);
    expect(result.ok).toBe(false);
    expect(result).toBeInstanceOf(Failure);
    expect(() => Try.unwrap(result)).toThrow(error);
  });

  test("Try.catch() catches errors like Promise.catch()", () => {
    const error = new Error("Oops");
    const recovered = Try.failure(error).catch(() => 42);
    expect(recovered.ok).toBe(true);
    expect(recovered).toBeInstanceOf(Success);
    expect(Try.unwrap(recovered)).toBe(42);
  });

  test("Try.finally() runs like Promise.finally()", () => {
    let called = false;
    const success = Try.success(10).finally(() => {
      called = true;
    });

    expect(success.ok).toBe(true);
    expect(success).toBeInstanceOf(Success);
    expect(Try.unwrap(success)).toBe(10);
    expect(called).toBe(true);

    called = false;
    const failure = Try.failure("error").finally(() => {
      called = true;
    });

    expect(failure.ok).toBe(false);
    expect(failure).toBeInstanceOf(Failure);
    expect(called).toBe(true);
  });

  test("Try.finally() does not change the result", () => {
    const success = Try.success(5).finally(() => {});
    expect(success).toBeInstanceOf(Success);
    expect(Try.unwrap(success)).toBe(5);

    const failure = Try.failure("error").finally(() => {});
    expect(failure).toBeInstanceOf(Failure);
    expect(failure.ok).toBe(false);
  });

  test("Try applies function and handles exceptions", () => {
    const success = Try.apply(() => 100);
    expect(success.ok).toBe(true);
    expect(success).toBeInstanceOf(Success);
    expect(Try.unwrap(success)).toBe(100);

    const failure = Try.apply(() => {
      throw new Error("Oops");
    });
    expect(failure.ok).toBe(false);
    expect(failure).toBeInstanceOf(Failure);
  });

  test("Try.promise handles async functions like Promise", async () => {
    const success = await Try.promise(async () => 123);
    expect(success).toBe(123);

    await expect(
      Try.promise(async () => {
        throw new Error("Async Error");
      })
    ).rejects.toThrow("Async Error");
  });

  test("Try.success unwraps nested Trys like Promise.resolve", () => {
    const nested = Try.success(Try.success(50));
    expect(nested).toBeInstanceOf(Success);
    expect(Try.unwrap(nested)).toBe(50);
  });

  test("Try.success unwraps deeply nested Trys", () => {
    const deeplyNested = Try.success(Try.success(Try.success(99)));
    expect(deeplyNested).toBeInstanceOf(Success);
    expect(Try.unwrap(deeplyNested)).toBe(99);
  });
});
