import { extendObservable, set, isObservableObject } from "mobx";
import { pick, omit, isEmpty } from "./utils";
import { Store } from "./store";

type StoreWise<T extends Model<P>, P> = {
  store?: Store<T, P>;
  new (props: P): T;
};

type Exact<T> = {
  [P in keyof T]: T[P];
};

function injectStore<T extends Model<P>, P>(Class: StoreWise<T, P>) {
  if (!Class.store) {
    Class.store = new Store(Class);
  }
}

export class Model<Props> {
  static idKey = "id";

  // @TODO decide should it be public available
  static create<T extends Model<P>, P>(
    this: new (props: P) => T,
    props: Exact<P>
  ) {
    const model = new this(props);
    model.patch(props);
    model.onInit();
    return model;
  }

  static get<T extends Model<P>, P>(
    this: StoreWise<T, P>,
    id: number | string
  ) {
    injectStore(this);
    return this.store!.get(id);
  }

  static all<T extends Model<P>, P>(this: StoreWise<T, P>) {
    injectStore(this);
    return this.store!.all();
  }

  static put<T extends Model<P>, P>(this: StoreWise<T, P>, props: Exact<P>) {
    injectStore(this);
    return this.store!.put(props);
  }

  static patch<T extends Model<P>, P>(
    this: StoreWise<T, P>,
    id: number,
    props: Partial<P>
  ) {
    return this.store?.patch(id, props);
  }

  static remove<T extends Model<P>, P extends {}>(
    this: StoreWise<T, P>,
    id: number
  ) {
    return this.store?.remove(id);
  }

  static flush<T extends Model<P>, P extends {}>(this: StoreWise<T, P>) {
    return this.store?.flush();
  }

  static injectStore<T extends Model<P>, P>(this: StoreWise<T, P>) {
    if (!this.store) {
      this.store = new Store(this);
    }
  }

  context: {};
  rootStore: {};

  // we need to define constructor to type props in static create method
  // tslint:disable-next-line: no-empty
  constructor(props: Props) {}

  // tslint:disable-next-line: no-empty
  onInit() {}

  patch(props: Partial<Props>) {
    const Class = this.constructor as any;
    props = Class.props ? pick(props, Object.keys(Class.props) as any) : props;

    const keys = Object.keys(props).reduce(
      (acc, key) => {
        // @ts-ignore
        acc[this.hasOwnProperty(key) ? "oldKeys" : "newKeys"][key] = props[key];
        return acc;
      },
      { oldKeys: {}, newKeys: {} } as any
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
    const relationsKeys = Object.keys(this.constructor.relations || {});
    const attrs = omit(props as {}, relationsKeys as []);
    const relations = pick(props as {}, relationsKeys as []);

    return {
      ...attrs,
      ...(isEmpty(relations) ? {} : this._applyReferences(relations as Props)),
    };
  }

  private _applyReferences(json: { [key: string]: any }) {
    return (
      // @ts-ignore
      Object.entries(this.constructor.relations || {})
        // @ts-ignore
        .filter(([key]) => json[key] !== undefined)
        // @ts-ignore
        .reduce((acc, [key, definition]) => {
          const isArray = definition instanceof Array;
          // @ts-ignore
          const model = isArray ? definition[0] : definition;

          // @ts-ignore
          const build = (item) =>
            isObservableObject(item)
              ? item
              : model.store
              ? model.put(item)
              : model.create(item);

          // @ts-ignore
          const data = json[key];

          const result = data
            ? isArray
              ? data.map(build)
              : build(data)
            : isArray
            ? []
            : null;
          // @ts-ignore
          acc[key] = result;

          return acc;
        }, {})
    );
  }
}
