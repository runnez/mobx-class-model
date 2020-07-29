class Todo extends Model {
  static relations = { user: User };
  static store = new Store(Todo);

  static fetch(id) {
    return getTodo(id).then(this.put);
  }

  static add(props) {
    return createTodo(props).then(this.put);
  }

  static onSocket({ key, payload }) {
    if (['todo_added', 'todo_updated'].includes(key)) {
      this.put(payload);
    }
  }

  save(props) {
    return updateTodo(props).then(this.patch);
  }
};

class TodoListStore {
  @observable items = null;

  fetch() {
    fetchTodos().then(data => {
      this.items = data.map(Todo.put)
    })
  }
}

const Todo = observer(({ id }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    Todo.fetch(id).catch(err => setError(error)), [id]
  });

  const handleAdd = () => Todo.add({ title: 'Untitled' });

  if (error) return <div>oops</div>;

  const todo = Todo.get(id);

  if (!todo) return <div>loading</div>;

  return (
    <div>
      {todo.title}

      <Button onClick={handleAdd}>Add</Button>
    </div>
  )
});
