import { Model, Store } from './index';

type IUser = {
  email: string;
  name: string;
};

interface User extends IUser {}
class User extends Model<IUser> {
  static store = new Store(User);

  hi() {
    return 'hi ' + this.name;
  }
}

interface IClient {
  id: number;
  name: string;
  user: IUser;
}

interface Client extends IClient {
  context: RootStore;
  user: User;
}

class Client extends Model<IClient> {
  static relations = { user: User };
  static store = new Store(Client);
}

class RootStore {
  global: string = 'global';

  constructor() {
    Model.prototype.context = this;
  }
}

new RootStore();

describe('create', () => {
  beforeEach(() => {
    Client.flush();
    User.flush();
  });

  test('store put', () => {
    const props = {
      id: 1,
      name: 'test',
      user: { email: 'email', name: 'tester' }
    };
    const client = Client.put(props);
    Client.put(props);
    expect(client).toMatchObject(props);
  });

  test('create', () => {
    const props = { id: 2, name: 'name', user: { email: 'email', name: '-1' } };
    const client = Client.create(props);
    expect(client).toMatchObject(props);
  });

  test('relations', () => {
    const client = Client.put({
      id: 1,
      name: 'test',
      user: { email: 'email', name: 'user' }
    });

    expect(client.user.hi()).toEqual('hi user');
  });

  test('get', () => {
    Client.put({
      id: 1,
      name: 'test',
      user: { email: 'email', name: 'user' }
    });

    const client = Client.get(1);

    expect(client).toBeTruthy();
    expect(client?.name).toEqual('test');
  });
});
