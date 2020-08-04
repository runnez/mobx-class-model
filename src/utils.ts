export function pick<T, K extends keyof T>(object: T, keys: K[]) {
  const result: Partial<T> = {};

  keys.forEach(key => {
    result[key] = object[key];
  });

  return result as {
    [P in K]: T[P]
  };
}

const pickobj = pick({ a: 1, b: 2, c: undefined }, ['a', 'c']);

export function omit <T extends { [key: string]: any }, K extends keyof T>(object: T, keys: K[]) {
  const result: Partial<T> = {};

  Object.keys(object).forEach(key => {
    if (!keys.includes(key as K)) {
      result[key as K] = object[key as K];
    }
  });

  return result as Omit<T, K>;
}

export function isEmpty(obj: {}) {
  return Object.keys(obj).length === 0;
}
