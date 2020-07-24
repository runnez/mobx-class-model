# Active models

- Converts json to models
- Deal with nested model relations
- Also it has helper to define model instance storage to guarantee having only one instance for record.

```typescript

interface IUser {
  id: number;
  name: string;
};

interface User extends IUser {};
class User extends Model<IUser> {
  hi() {
    console.log('hi ' + this.name)
  }
};

interface ITodo {
  id: number;
  title: string;
}

class Todo extends Model<ITodo> {
  static store = new Store(Client);
  static relations = { user: User };
  user: User;
};

const todo = Todo.put({
  id: 1,
  title: 'todo',
  user: { id: 1, name: 'user' }
});

console.log(todo.title) // todo
console.log(todo.user.hi()) // hi user
console.log(User.get(1) === todo.user) // true

const duplicateTodo = Todo.put({
  id: 1,
  title: 'todo',
  user: { id: 1, name: 'user' }
});

console.log(duplicateTodo === todo); // true
console.log(duplicateTodo === Todo.get(1)); // true

User.get(1) // User
Todo.get(1) // Todo
```

```typescript
class User {
  static fetch(id: number) {
    return getClient(id).then(this.store.put);
  }
}

Client.fetch(10).then(client => console.log(client));
const client = Client.get(10);
```
how to use RootStore injection?

```typescript
class RootStore {
  constructor() {
    Model.prototype.rootStore = this;
  }
}

class User extends Model<{
  id: number
}> {
  rootStore: RootStore
}

const context = new RootStore();
```
