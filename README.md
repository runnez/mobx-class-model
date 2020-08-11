# Mobx Class Model

Model layer for Mobx application, heavily inspired by the server-side model class approach.

It's designed as extension for Mobx store [best practices](https://mobx.js.org/best/store.html), so you can easily adopt it to a standalone project.

Using this you can replace your domain stores and share code between stores and views. So our stores becoming feels like a classical **P** in MVP pattern.

- ⚙️ Class based
- 😎 Reducing boilerplate
- 🏎 Typed (TS)
- 📦 Lightweight (2kb min)

## Getting started

> Mobx Class Model helps to convert JSON structures into complex object graphs and ensures existence single object reference. Underhood each model class has a reference store to deal with that.

### Define model

```typescript
import { Model, prop, ref } from "mobx-class-model";

// 1. Define the expected Props interface. Usually, it's a server-side JSON structure.
interface ApiUser {
  id: number;
  name: string;
  lastName: string;
}

// 2. Extend your class from Model.
// 3. And pass Props as generic (which using while creating an instance and updating it).
// 4. Expose using props by @prop decorator.
class User extends Model<ApiUser> {
  @prop id: number;
  @prop name: string;
  @prop lastName: string;

  @computed get fullName() {
    return this.name + this.lastName;
  }
}
```

### Add relations

```typescript
interface ApiTodo {
  id: number;
  title: string;
  completed: boolean;
  user: ApiUser;
  performers: ApiUser[];
}

// 5. Mark prop as releation and pass your model class
class Todo extends Model<ApiTodo> {
  @ref(User) user: User;
  @ref.array(User) performers: User;

  @prop id: number;
  @prop string: number;
  @prop completed: boolean;
}
```

### Instance methods

`model.patch`
Every instance method has **patch** method.

```typescript
todo.patch({ title: "changed" });
todo.title; // changed
todo.user.patch({ lastName: "Snow" });
todo.user.fullName; // John Snow
```

**`model.onInit`**
We can define **onInit** hook which will be called after an initialization.

> So how can we produce a new instance of a model?

### Class methods

Extending Model also charges your model class by static methods

`Model.put`
Produces a new Model instance or updates existing reference and returns it.

```typescript
const todo = Todo.put(todoJson);
todo.user.fullName; // John Doe
```

`Model.get`
Returns existing instance by id. It's observable.

```typescript
Todo.get(1); // Todo
```

`Model.all`
Returns all existing instance in order of adding.

```typescript
Todo.all(); // [Todo]
```

`Model.remove`
Removes reference from references store.

```typescript
Todo.remove(1);
```

`Model.flush`
Removes all references from references store.

```typescript
Todo.flush();
```

## Examples

### How to use with RootStore?

```typescript
class RootStore {
  constructor() {
    Model.prototype.rootStore = this;
  }
}

class User extends Model<{}> {
  rootStore: RootStore;
}

const context = new RootStore();
```

### Let's make Todo more realistic

```typescript
class Todo extends Model<ApiTodo> {
  rootStore: RootStore

  @ref(User) user: User
  @ref.array(User) performers: User

  @prop id: number
  @prop string: number
  @prop completed: boolean

  static fetch(id: number) {
    fetchTodo(id).then(json => this.put(json))
  }

  canEdit() {
    return this.rootStore.currentUser === this.user
  }

  save(props: Partial<ApiTodo>) {
    if (this.id) {
      return updateTodo(this.id, props).then(this.patch)
    }

    return Todo.save()
  }

  assign(userId: number) {
    return assignTodo(this.id, userId).then(() => {
      this.performers.push(User.get(userId))
    })
  }
}

class TodoScreenStore {
  @observable todos = []

  @action fetch() {
    fetchTodos().then(runInAction(data => {
      this.todos = data.map(json =>
        Todo.put(json)
      )
    }))
  }

  @action create(props: Partial<ApiTodo>) {
    createTodo(props).then(todo =>
      this.todos.push(Todo.put(todo))
    )
  }
}

const TodosScreen = () => {
  const { todosScreenStore } = useStores()

  useEffect(() => {
    todosScreenStore.fetch()
  })

  return ...
}

const TodoModal = ({ id }: { id: number }) => {
  const todo = Todo.get(id)

  return ...
}

// Or if we need fetch before showing

const TodoModal = () => {
  const { id } = useRouteMatch()

  useEffect(() => {
    Todo.fetch(id)
  }, [id])

  const todo = Todo.get(id)

  return ...
}

```
