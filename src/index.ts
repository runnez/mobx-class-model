import { extendObservable, set, isObservableObject } from 'mobx';
import { omit, pick, isEmpty } from 'lodash-es';

type RootStore = any;

export class Model {
  static relations = {};

  static create<T extends typeof Model & { props: unknown }>(
    this: T,
    props: T['props'],
    rootStore: RootStore
  ) {
    // Обманываем систему типов, добавляем метод patch с нужным интерфейсом пропсов
    const model = new this(rootStore) as InstanceType<T> & {
      afterCreate?: () => void;
      patch(props: T['props']): void;
    };

    model.patch(props);

    if (model.afterCreate) {
      model.afterCreate();
    }

    return model;
  }

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    if (!rootStore) {
      throw new Error('rootStore must be passed');
    }

    this.rootStore = rootStore;
  }

  // Обманываем систему типов, делаем метод uncallable
  // По настоящему метод описываем внутри метода create
  patch(props: Record<string, never>) {
    const keys = Object.keys(props).reduce(
      (acc, key) => {
        // @ts-ignore
        acc[this.hasOwnProperty(key) ? 'oldKeys' : 'newKeys'][key] = props[key];
        return acc;
      },
      { oldKeys: {}, newKeys: {} }
    );

    if (!isEmpty(keys.oldKeys)) {
      set(this, this._prepareProps(keys.oldKeys));
    }

    if (!isEmpty(keys.newKeys)) {
      extendObservable(this, this._prepareProps(keys.newKeys));
    }
  }

  // @ts-ignore
  private _prepareProps(props) {
    // @ts-ignore
    const relationsKeys = Object.keys(this.constructor.relations);
    const attrs = omit(props, relationsKeys);
    const relations = pick(props, relationsKeys);

    return {
      ...attrs,
      ...(isEmpty(relations) ? {} : this._applyReferences(relations))
    };
  }

  // @ts-ignore
  private _applyReferences(json) {
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
              : model.dictionary && this.rootStore[model.dictionary]
              ? this.rootStore[model.dictionary].put(item)
              : model.create(item, this.rootStore);

          const data = json[key];

          const result = data ? (isArray ? data.map(build) : build(data)) : isArray ? [] : null;
          // @ts-ignore
          acc[key] = result;

          return acc;
        }, {})
    );
  }
}
