import { expect, test } from "bun:test";
import { Failure, Success, Try } from "./try";

test("new Try()", () => {
  const t = new Try(() => true);
  expect(t.ok).toBe(true);
  expect(Try.isTry(t)).toBe(true);
  expect(t.unwrap()).toBe(true);
});

test("Try()", () => {
  const t = Try(() => true);
  expect(t.ok).toBe(true);
  expect(Try.isTry(t)).toBe(true);
  expect(t.unwrap()).toBe(true);
});

test("Try.success()", () => {
  const t = Try.success("pass");
  expect(t.ok).toBe(true);
  expect(Try.isOk(t)).toBe(true);
  expect(Try.isError(t)).toBe(false);
  expect(Try.isTry(t)).toBe(true);
  expect(t).toBeInstanceOf(Success);
  expect(t.unwrap()).toBe("pass");
});

test("Try.failure()", () => {
  const t = Try.failure("fail");
  expect(t.ok).toBe(false);
  expect(Try.isOk(t)).toBe(false);
  expect(Try.isError(t)).toBe(true);
  expect(Try.isTry(t)).toBe(true);
  expect(t).toBeInstanceOf(Failure);
  expect(() => t.unwrap()).toThrowError("fail");
});
