# Active models

Active model has roots from Rails Active Record model
It helps to deal with nested model relations and provides us clean way to deal with models.
Also it has helper to define model instance storage to guarantee having only one instance for record.

```typescript
class User extends Model<IClient> {}

class Todo extends Model<ITodo> {
  static store = new Store<Todo, IClient>(Client);

  static relations = { user: User };

  user: User;
};

const client = Client.create({
  id: 1,
  name: 'client',
  user: {
    id: 1,
    name: 'user'
  }
});
```

```typescript
class User {
  static fetch(id: number) {
    return getClient(id).then(this.store.put);
  }
}

Client.fetch(10);
Client.store.get(10);

class RootStore {
  global: string = 'global';

  constructor() {
    Model.prototype.context = this;
  }
}

const context = new RootStore();
```
