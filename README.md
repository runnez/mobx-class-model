# Active Model
Class-transformer allows you to transform plain object to some instance of class with mobx in mind

It helps you
- Convert json to model
- Deal with nested model relations
- Have single instance of model

```javascript
import { Model, Store } from 'mobx-active-model';

class User extends Model {
  static store = new Store(User);

  hi() {
    console.log('hi ' + this.name);
  }
};

class Todo extends Model {
  static store = new Store(Todo);
  static relations = { user: User };
};

const todo = Todo.put({
  id: 1,
  title: 'todo',
  user: { id: 1, name: 'user' }
});

console.log(todo.title); // todo
console.log(todo.user.hi()); // hi user
console.log(todo === Todo.get(1)); // true
console.log(todo.user === User.get(1)); // true

todo.patch({ title: 'new title' });

console.log(todo.title === 'new title'); // true;

Todo.put({
  id: 1,
  title: 'update',
  user: { id: 1, name: 'user' }
});

console.log(todo.title === 'update'); // true;

class Todo extends Model {
  static relations = { user: User };
  static store = new Store(Todo);

  static fetch = function(id) {
    return fetchTodo(id).then(this.store.put);
  }

  update(props) {
    updateTodo(this.id, props).then(this.store.put);
  }
};

Todo.fetch(1);
Todo.get(1); // undefined, but it's get to observable map
// after request
const todo = Todo.get(1);
```

Usage with typescript

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
  static store = new Store(Todo);
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

User.fetch(10).then(client => console.log(client)); // User
console.log(Client.get(10)); //User
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
