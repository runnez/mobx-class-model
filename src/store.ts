import { action, observable } from 'mobx';
import { Model } from './model';

export class Store<T extends Model<P>, P> {
  @observable map = observable.map<typeof Model['id'], T>();

  Model: new(props: P) => T;

  constructor(constructor: new(props: P) => T) {
    this.Model = constructor;
  }

  get(id: typeof Model['id']) {
    return this.map.get(id);
  }

  @action
  put = (props: P) => {
    // @ts-ignore
    const id = props[this.Model.idKey] as typeof Model['id'];

    if (this.map.has(id)) {
      return this.patch(id, props)!;
    }
    const model = new this.Model(props);
    model.patch(props);
    this.map.set(id, model);
    return model;
  };

  @action
  patch = (id: typeof Model['id'], props: P) => {
    const item = this.get(id);
    if (!item) return;
    item.patch(props);
    return item;
  };

  @action
  remove = (id: typeof Model['id']) => {
    return this.map.delete(id);
  };
}
