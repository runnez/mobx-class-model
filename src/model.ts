import { extendObservable, set, isObservableObject } from 'mobx';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import isEmpty from 'lodash/isEmpty';
import { Store } from './store';

export class Model<Props> {
  static relations = {};

  static create<T extends Model<P>, P>(this: new (props: P) => T, props: P) {
    return new this(props);
  }

  static get<T extends Model<P>, P extends { id: number | string }>(this: { store: Store<T, P>, new (props: P): T }, id: number) {
    return this.store.get(id)
  }

  static put<T extends Model<P>, P extends { id: number | string }>(this: { store: Store<T, P>, new (props: P): T }, props: P) {
    return this.store.put(props);
  }

  id: number | string;
  context: {};

  // we need to define constructor to type props in static create method
  constructor(props: Props) {
    this.patch(props);
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

  private _applyReferences(json: { [key: string]: any }) {
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

