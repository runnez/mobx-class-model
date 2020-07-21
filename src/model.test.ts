import { Model, Store } from './model';

interface IUser {
  id: number;
  name: string;
}

interface IClient {
  id: number;
  name: string;
  user: IUser;
}

describe('create', () => {
  class User {}

  // @store(new Store<Client, IClient>(Client))
  class Client extends Model<IClient> {
    static store = new Store<Client, IClient>(Client);

    context: RootStore;

    static relations = {
      user: User
    };

    static fetch(id: number) {
      return getClient(id).then(this.store.put);
    }

    fn(arg?: string) {
      if (arg) return arg;
      return 'fn test';
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

  test('store', () => {
    const client = Client.store.put({ id: 1, name: 'test' });
    expect(Client.store).toBeTruthy();
    expect(client.id).toEqual(1);
    expect(client.name).toEqual('test');
    expect(client.fn()).toEqual('fn test');
    expect(client.fn('arg test')).toEqual('arg test');
    client.patch({ name: 'new name' });
    expect(client.name).toEqual('new name');
    expect(client.context.global).toBe(context.global);
  });

  test('create', () => {
    const client = Client.create({ id: 2, name: '' });
    client.patch({ name: '1' });
  });

  test('relatios', () => {
    const client = Client.store.put({
      id: 1,
      name: 'test',
      user: { id: 1, name: 'user' }
    });
  });
});
