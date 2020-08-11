import { autorun } from "mobx";
import { Model, prop } from "./index";

describe("Model static methods", () => {
  const factoryClient = (id = 1) => ({
    id,
    name: "client",
    user: { id: 1, name: "user" },
  });

  type IUser = {
    id: number;
    name: string;
  };

  class User extends Model<IUser> {
    @prop id: number;
    @prop name: string;
  }

  interface IClient {
    id: number;
    name: string;
    user: IUser;
  }

  interface Client extends IClient {}
  class Client extends Model<IClient> {
    static relations = { user: User };
  }

  beforeEach(() => {
    Client.flush();
    User.flush();
  });

  test("create", () => {
    const props = factoryClient();
    const client = Client.create(props);
    expect(client).toMatchObject(props);
    expect(client).toBeInstanceOf(Client);
    expect(Client.create(props) === client).toEqual(false);
  });

  test("put", () => {
    const props = factoryClient();
    const client = Client.put(props);
    expect(client).toMatchObject(props);
    expect(client).toBeInstanceOf(Client);
    expect(Client.put(props) === client).toEqual(true);
  });

  test("get", () => {
    const subscriber = jest.fn();

    const disposer = autorun(() => {
      Client.get(1);
      subscriber();
    });

    Client.put(factoryClient());

    const client = Client.get(1)!;
    expect(client).toBeTruthy();
    expect(subscriber.mock.calls.length).toBe(2);
    disposer();
    expect(client.name).toEqual("client");
  });

  test("patch", () => {
    const client = Client.put(factoryClient());
    Client.patch(1, { name: "new name" });
    expect(client.name).toEqual("new name");
  });

  test("remove", () => {
    const client = Client.put(factoryClient());
    Client.remove(1);
    expect(Client.get(1)).toEqual(undefined);
  });

  test("all", () => {
    const client = Client.put(factoryClient());
    const client2 = Client.put(factoryClient(2));
    expect(Client.all()).toEqual([client, client2]);
  });

  test("flush", () => {
    Client.put(factoryClient());
    Client.flush();
    expect(Client.get(1)).toEqual(undefined);
    expect(Client.all()).toEqual([]);
  });
});
