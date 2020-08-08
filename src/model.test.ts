import { observable, computed, autorun } from 'mobx';
import { Model } from './model';

interface IFoo {
  fooProp: string;
}

interface Foo extends IFoo {};
class Foo extends Model<IFoo> {};

interface IBar {
  barProp: string;
  foo: IFoo;
}

interface Bar extends IBar {}
class Bar extends Model<IBar> {
  static relations = {
    foo: Foo
  };
  foo: Foo;
}

test('property', () => {
  const model = Bar.create({ barProp: 'bar', foo: { fooProp: 'foo' } });
  expect(model.barProp).toBe('bar');
  model.patch({ barProp: 'changed' });
  expect(model.barProp).toBe('changed');
});

test('reference', () => {
  const model = Bar.create({ barProp: 'bar', foo: { fooProp: 'foo' } });
  expect(model.foo).toBeInstanceOf(Foo);
  expect(model.foo.fooProp).toBe('foo');
});

test('array of reference', () => {
  class Baz extends Model<{ barProp: string; foo: { fooProp: string }[] }> {
    static relations = {
      foo: [Foo]
    };
    foo: Foo[];
  }

  const model = Baz.create({ barProp: 'bar', foo: [{ fooProp: 'foo' }] });

  expect(model.foo[0]).toBeInstanceOf(Foo);
});

test('predefined property', () => {
  class FooWithPredefined extends Model<{
    someProp: number;
    foo: { fooProp: string };
    foo2: { fooProp: string };
    someArray?: Array<number>;
  }> {
    static relations = {
      foo: Foo,
      foo2: Foo
    };

    @observable foo: Foo;
    @observable someProp = 1;
    @observable someArray = observable.array<number>();

    @computed get someComputed() {
      return this.someProp + 1;
    }
  }

  const model = FooWithPredefined.create(
    { someProp: 2, foo: { fooProp: 'fooProp' }, foo2: { fooProp: 'fooProp' }, someArray: [1] }
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

test('onInit hook', () => {
  class InternalModel {
    foo = 'foo';
  }

  class FooWithHook extends Model<{
    someProp: number;
    fooArray: Array<{ foo: number }>
  }> {
    @observable someProp = 1;
    fooArray: InternalModel;

    onInit() {
      this.someProp = 5;
      this.fooArray = new InternalModel();
    }
  }

  const model = FooWithHook.create({ someProp: 2, fooArray: [{ foo: 1 }, { foo: 2 }] });

  expect(model.someProp).toBe(5);
  expect(model.fooArray).toBeInstanceOf(InternalModel);
});

