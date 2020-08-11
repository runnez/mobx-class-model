export const prop = (target: any, key: string) => {
  if (!target.constructor.props) target.constructor.props = {};
  target.constructor.props[key] = 1;
};

export const identifier = (target: any, key: string) => {
  if (target.constructor.hasOwnProperty("idKey")) {
    throw new Error("should be only one identifier");
  }

  target.constructor.idKey = key;
};

// @TODO add generic type
// it doesn't work function ref<T extends typeof Model>(Class: T)
export function ref(Class: any) {
  return innerRef(Class);
}

ref.array = (Class: any) => {
  return innerRef([Class]);
};

const innerRef = (type: any) => {
  return (target: any, key: string) => {
    if (!target.constructor.relations) {
      target.constructor.relations = {};
    }

    if (!target.constructor.relations[key]) {
      target.constructor.relations[key] = type;
    }
  };
};
