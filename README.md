# Active Model [Draft]
Class-transformer allows you to transform plain object to some instance of class with Mobx in mind

It helps you
- Convert json to model
- Deal with nested model relations
- Have single instance of model

```javascript
import { Model, Store } from 'mobx-active-model';

class User extends Model {
  hi() {
    console.log('hi ' + this.name);
  }
};

const user = User.create({ id: 1, name: 'John' });

console.log(user.name); // John
console.log(user.hi()); // hi John

user.patch({ name: 'New John' });
```
Let's add relations
```javascript
class Todo extends Model {
  static relations = { user: User };
};

const todo = Todo.create({
  id: 1,
  title: 'todo',
  user: { id: 1, name: 'user' }
});

console.log(todo.user.name); // John
console.log(todo.user.hi()); // hi John
```
Let's add store and unlock methods
```javascript
class Todo extends Model {
  static relations = { user: User };
  static store = new Store(Todo);
};

const todo = Todo.put({
  id: 1,
  title: 'todo',
  user: { id: 1, name: 'user' }
});

console.log(todo === Todo.get(1)); // true
console.log(todo.user === User.get(1)); // true

Todo.patch(1, { title: 'new name' });
```

Usage with typescript

```typescript
interface IUser {
  id: number;
  name: string;
};

class User extends Model<IUser> {
  @prop id: number;
  @prop name: string;
  @relation user: User;
};

interface Todo extends ITodo {};
```

how to use RootStore injection?

```typescript
class RootStore {
  constructor() {
    Model.prototype.rootStore = this;
  }
}

class User extends Model<{}> {
  rootStore: RootStore
}

const context = new RootStore();
```
