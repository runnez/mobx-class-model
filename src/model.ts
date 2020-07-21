import { action, extendObservable, observable, set, isObservableObject } from 'mobx';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import isEmpty from 'lodash/isEmpty';

export class Model <Props> {
  id: string | number;
  context: {};

  static relations = {};

  static create<T extends Model<P>, P>(this: new (props: P) => T, props: P) {
    const model = new this(props) as T & P;
    model.patch(props);
    return model;
  }

  patch(props: Partial<Props>) {
    const keys = Object.keys(props).reduce(
      (acc, key) => {
        // @ts-ignore
        acc[this.hasOwnProperty(key) ? 'oldKeys' : 'newKeys'][key] = props[key];
        return acc;
      },
      { oldKeys: {}, newKeys: {} } as { oldKeys: Props, newKeys: Props }
    );

    if (!isEmpty(keys.oldKeys)) {
      set(this, this._prepareProps(keys.oldKeys));
    }

    if (!isEmpty(keys.newKeys)) {
      extendObservable(this, this._prepareProps(keys.newKeys));
    }
  }

  private _prepareProps(props: Props) {
    // @ts-ignore
    const relationsKeys = Object.keys(this.constructor.relations);
    const attrs = omit(props as {}, relationsKeys);
    const relations = pick(props as {}, relationsKeys);

    return {
      ...attrs,
      ...(isEmpty(relations) ? {} : this._applyReferences(relations as Props))
    };
  }

  private _applyReferences(json: Props) {
    return (
      // @ts-ignore
      Object.entries(this.constructor.relations)
        // @ts-ignore
        .filter(([key]) => json[key] !== undefined)
        // @ts-ignore
        .reduce((acc, [key, definition]) => {
          const isArray = definition instanceof Array;
          // @ts-ignore
          const model = isArray ? definition[0] : definition;

          // @ts-ignore
          const build = item =>
            isObservableObject(item)
              ? item
              : model.store
              ? model.store.put(item)
              : model.create(item);

          // @ts-ignore
          const data = json[key];

          const result = data ? (isArray ? data.map(build) : build(data)) : isArray ? [] : null;
          // @ts-ignore
          acc[key] = result;

          return acc;
        }, {})
    );
  }
}

export function relation() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log(target, propertyKey, descriptor);
  };
}

export class Store<T extends Model<P>, P extends { id: number | string }> {
  @observable map = observable.map<number | string, T & P>();

  model: new(props: P) => T;

  constructor(model: new(props: P) => T) {
    this.model = model;
  }

  get(id: number | string) {
    return this.map.get(String(id));
  }

  @action
  put = (props: P) => {
    if (this.map.has(props.id)) {
      return this.patch(props.id, props)!;
    }

    return this.map.set(props.id, new this.model(props) as T & P).get(props.id)!;
  };

  @action
  patch = (id: number | string, props: P) => {
    const item = this.map.get(id);
    if (!item) return;
    item.patch(props);
    return item;
  };

  @action
  remove = (id: number | string) => {
    return this.map.delete(id);
  };
}
