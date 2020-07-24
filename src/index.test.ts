import { Model, Store } from './index';

interface User extends IUser {}
class User extends Model<IUser> {
  static store = new Store(User);

  hi() {
    return 'hi ' + this.name;
  }
}

const fetchUser = (id: number) => Promise.resolve({
  id,
  name: 'zero',
  user: { id: 0, name: 'zero user' }
});

interface Client extends IClient {
  context: RootStore;
  user: User;
}

class Client extends Model<IClient> {
  static store = new Store(Client);
  static relations = { user: User };

  static fetch(id: number) {
    return fetchUser(id).then(this.store.put);
  }
}

const client = Client.put({
  id: 1,
  name: '1',
  user: {
    id: 1,
    name: '1212'
  }
});


class RootStore {
  global: string = 'global';

  constructor() {
    Model.prototype.context = this;
  }
}

const context = new RootStore();

interface IUser {
  id: number | string;
  name: string;
}

interface IClient {
  id: number | string;
  name: string;
  user: IUser;
}

describe('create', () => {
  test('store', () => {
    const client = Client.store.put({
      id: 1,
      name: 'test',
      user: { id: 1, name: 'tester' }
    });

    const client3 = Client.get(1)!;
    client3.user.hi();

    expect(client.id).toEqual(1);
    const client2 = Client.get(1);
    expect(client.name).toEqual('test');
    client.patch({ name: 'new name' });
    expect(client.name).toEqual('new name');
    expect(client.context.global).toBe(context.global);
  });

  test('create', () => {
    const client = Client.create({ id: 2, name: '', user: { id: -1, name: '-1' } });
    client.patch({ name: '1' });
  });

  test('relations', () => {
    const client = Client.store.put({
      id: 1,
      name: 'test',
      user: { id: 1, name: 'user' }
    });

    expect(client.user.hi()).toEqual('hi user');
  });

  test('get', () => {
    Client.put({
      id: 1,
      name: 'test',
      user: { id: 1, name: 'user' }
    });
    const client = Client.get(1);

    expect(client).toBeTruthy();
    expect(client?.name).toEqual('test');
  })
});
