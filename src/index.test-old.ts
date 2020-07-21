import { observable, computed, autorun } from 'mobx';
import { Model } from './index';

const rootStore = {};

class Foo extends Model {
  fooProp: string;
}

class Bar extends Model {
  static relations = {
    foo: Foo
  };

  static props: { barProp?: string; foo?: { fooProp: string } };

  foo: Foo;
  barProp: string;
}

test('property', () => {
  const model = Bar.create({ barProp: 'bar', foo: { fooProp: 'foo' } }, rootStore);

  expect(model.barProp).toBe('bar');
  expect(model.rootStore).toBe(rootStore);

  model.patch({ barProp: 'changed' });

  expect(model.barProp).toBe('changed');
});

test('reference', () => {
  const model = Bar.create({ barProp: 'bar', foo: { fooProp: 'foo' } }, rootStore);

  expect(model.foo).toBeInstanceOf(Foo);
  expect(model.foo.fooProp).toBe('foo');
});

test('array of reference', () => {
  class Baz extends Model {
    static relations = {
      foo: [Foo]
    };

    static props: { barProp: string; foo: Array<{ fooProp: string }> };

    foo: Array<Foo>;
  }

  const model = Baz.create({ barProp: 'bar', foo: [{ fooProp: 'foo' }] }, rootStore);

  expect(model.foo[0]).toBeInstanceOf(Foo);
});

test('predefined property', () => {
  class FooWithPredefined extends Model {
    static relations = {
      foo: Foo,
      foo2: Foo
    };

    static props: {
      someProp: number;
      foo: { fooProp: string };
      foo2: { fooProp: string };
      someArray?: Array<number>;
    };

    @observable foo: Foo;
    @observable someProp = 1;
    @observable someArray = observable.array<number>();

    @computed get someComputed() {
      return this.someProp + 1;
    }
  }

  const model = FooWithPredefined.create(
    { someProp: 2, foo: { fooProp: 'fooProp' }, foo2: { fooProp: 'fooProp' }, someArray: [1] },
    rootStore
  );

  expect(model.someProp).toBe(2);
  expect(model.someArray[0]).toBe(1);
  expect(model.someComputed).toBe(3);
  expect(model.foo).toBeInstanceOf(Foo);
  // Тест-кейс для js файлов, у них может быть не описано поле в модели
  // @ts-ignore
  expect(model.foo2).toBeInstanceOf(Foo);
  expect(model.foo.fooProp).toBe('fooProp');

  const subscriber = jest.fn();

  autorun(() => {
    subscriber(model.someProp);
  });

  model.someProp = 5;

  expect(subscriber.mock.calls.length).toBe(2);
});

test('afterCreate hook', () => {
  class InternalModel {
    foo = 'foo';
  }

  class FooWithHook extends Model {
    static props: { someProp: number; fooArray: Array<{ foo: number }> };

    @observable someProp = 1;
    fooArray: InternalModel;

    afterCreate() {
      this.someProp = 5;
      this.fooArray = new InternalModel();
    }
  }

  const model = FooWithHook.create({ someProp: 2, fooArray: [{ foo: 1 }, { foo: 2 }] }, rootStore);

  expect(model.someProp).toBe(5);
  expect(model.fooArray).toBeInstanceOf(InternalModel);
});
