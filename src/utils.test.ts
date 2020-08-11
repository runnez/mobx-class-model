import { pick, omit } from "./utils";

describe("pick", () => {
  it("picks selected properties", () => {
    const obj = pick({ a: 1, b: 2 }, ["a"]);
    expect(Object.keys(obj)).toEqual(["a"]);
    expect(obj.a).toEqual(1);
  });

  it("skips unselected properties", () => {
    const obj = pick({ a: 1, b: 2 }, []);
    expect(Object.keys(obj).length).toBe(0);
  });
});

describe("omit", () => {
  it("omit selected properties", () => {
    const obj = omit({ a: 1, b: 2 }, ["a"]);
    expect(Object.keys(obj)).toEqual(["b"]);
    expect(obj.b).toEqual(2);
  });

  it("skips unselected properties", () => {
    const obj = omit({ a: 1, b: 2 }, []);
    expect(obj.a).toEqual(1);
    expect(obj.b).toEqual(2);
    expect(Object.keys(obj).length).toBe(2);
  });
});
