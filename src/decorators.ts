export const prop = (target: any, key: string) => {
  if (!target.constructor.props) target.constructor.props = {};
  target.constructor.props[key] = 1;
};

// @TODO add generic type
// it doesn't work function ref<T extends typeof Model>(Class: T)
export function ref(Class: any) {
  return innerRef(Class);
}

ref.array = function(Class: any) {
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
