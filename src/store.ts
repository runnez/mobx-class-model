import { action, observable } from 'mobx';
import { Model } from './model';

type Id = number | string;

export class Store<T extends Model<P>, P extends { id: Id }> {
  @observable map = observable.map<Id, T>();

  Model: new(props: P) => T;

  constructor(constructor: new(props: P) => T) {
    this.Model = constructor;
  }

  get(id: number | string) {
    return this.map.get(id);
  }

  @action
  put = (props: P) => {
    if (this.map.has(props.id)) {
      return this.patch(props.id, props)!;
    }
    const model = new this.Model(props);
    model.patch(props);
    this.map.set(props.id, model);
    return model;
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
};
