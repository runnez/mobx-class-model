import { action, observable, values } from 'mobx';
import { Model } from './model';

export class Store<T extends Model<P>, P> {
  @observable map = observable.map<number | string, T>();

  Model: new(props: P) => T;

  constructor(constructor: new(props: P) => T) {
    this.Model = constructor;
  }

  get(id: number | string) {
    return this.map.get(id);
  }

  all() {
    return values(this.map);
  }

  flush() {
    return this.map.clear();
  }

  @action
  put = (props: P) => {
    // @ts-ignore
    const id = props[this.Model.idKey];

    if (this.map.has(id)) {
      return this.patch(id, props)!;
    }
    const model = new this.Model(props);
    model.patch(props);
    this.map.set(id, model);
    return model;
  };

  @action
  patch = (id: number | string, props: Partial<P>) => {
    const item = this.get(id);
    if (!item) return;
    item.patch(props);
    return item;
  };

  @action
  remove = (id: number | string) => {
    return this.map.delete(id);
  };
}
