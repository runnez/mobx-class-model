import { Model } from './model';

export const prop = (target: any, key: string) => {
  if (!target.constructor.props) target.constructor.props = {};
  target.constructor.props[key] = 1;
};

export function ref<T extends typeof Model>(Class: T) {
  return innerRef(Class);
}

ref.array = function<T extends typeof Model>(Class: T) {
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
