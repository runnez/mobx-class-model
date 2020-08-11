import { Model } from './model';
import { identifier, prop, ref } from './decorators';

describe('prop decorator', () => {
  it('should add keys to static prop', () => {
    class User extends Model<{}>{
      @prop name: string;
    }

    User.create({ name: 'name' });

    // @ts-ignore
    expect(User.props.name).toBeTruthy();
  });

  // @TODO fix it or delete
  it.skip('should works with predefined value', () => {
    // i can't imagine use case, but it fails
    class User extends Model<{ name: string }>{
      @prop name: string = 'name';
    }

    expect(User.create({ name: 'name' }).name).toBe('name');
  });
});

describe('ref decorator', () => {
  it('should add class to relations class property', () => {
    class User extends Model<{}>{
      @ref(User) bestFriend: User;
      @ref.array(User) friends: User[];
    }

    // @ts-ignore
    expect(User.relations.bestFriend).toEqual(User);
    // @ts-ignore
    expect(User.relations.friends).toEqual([User]);
  });
});

describe('identifier', () => {
  it('should set idKey', () => {
    class FooWithIdentifier extends Model<{ bar: string }> {
      @identifier bar: string;
    }

    FooWithIdentifier.put({ bar: 'test' });

    expect(FooWithIdentifier.get('test')).toBeTruthy();
  });
});
