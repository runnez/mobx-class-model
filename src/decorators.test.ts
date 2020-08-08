import { Model } from './model';
import { prop, ref } from './decorators';

test('prop', () => {
  class User extends Model<{}>{
    @prop name: string;
  }

  User.create({ name: 'name' });

  // @ts-ignore
  expect(User.props.name).toEqual(1);
});

test('ref', () => {
  class Manager extends Model<{}> {};

  class User extends Model<{}>{
    @ref(Manager) manager: Manager;
    @ref.array(User) friends: User[];
  }

  User.create({ friends: [] });

  // @ts-ignore
  expect(User.relations.friends).toEqual([User]);
});
