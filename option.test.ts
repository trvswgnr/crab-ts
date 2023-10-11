import { Maybe, None, Option, Some } from './option.ts';
import { Err, Ok } from './result.ts';
import { describe, expect, it, test } from './test-deps.ts';

describe('Option', () => {
    describe('isSome', () => {
        it('Returns `true` if the option is a `Some` value.', () => {
            const x: Option<number> = Some(2);
            expect(x.isSome()).toBe(true);
        });

        it('Returns `false` if the option is a `None` value.', () => {
            const x: Option<number> = None();
            expect(x.isSome()).toBe(false);
        });
    });

    describe('isSomeAnd', () => {
        it('Returns `true` if the option is a `Some` and the value inside of it matches a predicate.', () => {
            const x: Option<number> = Some(2);
            expect(x.isSomeAnd((x) => x > 1)).toBe(true);
        });

        it('Returns `false` if the option is a `Some` and the value inside of it does not match a predicate.', () => {
            const x: Option<number> = Some(0);
            expect(x.isSomeAnd((x) => x > 1)).toBe(false);
        });

        it('Returns `false` if the option is a `None`.', () => {
            const x: Option<number> = None();
            expect(x.isSomeAnd((x) => x > 1)).toBe(false);
        });
    });

    describe('isNone', () => {
        it('Returns `false` if the option is a `Some` value.', () => {
            const x: Option<number> = Some(2);
            expect(x.isNone()).toBe(false);
        });

        it('Returns `true` if the option is a `None` value.', () => {
            const x: Option<number> = None();
            expect(x.isNone()).toBe(true);
        });
    });

    describe('expect', () => {
        it('Returns the contained `Some` value, consuming the `self` value.', () => {
            const x: Option<string> = Some('value');
            expect(x.expect('fruits are healthy')).toBe('value');
        });

        it('Panics if the value is a `None` with a custom panic message provided by `msg`.', () => {
            const x: Option<string> = None();
            expect(() => x.expect('fruits are healthy')).toThrow('fruits are healthy');
        });
    });

    describe('unwrap', () => {
        it('Returns the contained `Some` value, consuming the `self` value.', () => {
            const x: Option<string> = Some('air');
            expect(x.unwrap()).toBe('air');
        });

        it('Panics if the self value equals `None`.', () => {
            const x: Option<string> = None();
            expect(() => x.unwrap()).toThrow();
        });
    });

    describe('unwrapOr', () => {
        it('Returns the contained `Some` value or a provided default.', () => {
            const x: Option<string> = Some('car');
            expect(x.unwrapOr('bike')).toBe('car');
        });

        it('Returns a provided default if the self value equals `None`.', () => {
            const x: Option<string> = None();
            expect(x.unwrapOr('bike')).toBe('bike');
        });
    });

    describe('unwrapOrElse', () => {
        it('Returns the contained `Some` value or computes it from a closure.', () => {
            const k = 10;
            const x: Option<number> = Some(4);
            expect(x.unwrapOrElse(() => 2 * k)).toBe(4);
        });

        it('Computes a default value if the self value equals `None`.', () => {
            const k = 10;
            const x: Option<number> = None();
            expect(x.unwrapOrElse(() => 2 * k)).toBe(20);
        });
    });
    describe('map', () => {
        it('Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.', () => {
            const maybeSomeString: Option<string> = Some('Hello, World!');
            const maybeSomeLen: Option<number> = maybeSomeString.map((s) => s.length);

            expect(maybeSomeLen).toEqual(Some(13));
        });
    });

    describe('inspect', () => {
        it('Calls the provided closure with a reference to the contained value (if `Some`).', () => {
            const v = [1, 2, 3, 4, 5];

            let y = 0;

            // assigns 4 to y
            const x: Option<number> = Maybe(v[3]).inspect((x) => {
                y = x;
            });

            expect(y).toBe(4);

            // does nothing
            const x2: Option<number> = Maybe(v[5]).inspect((x) => {
                y = x;
            });

            expect(y).toBe(4);
            expect(x).toEqual(Some(4));
            expect(x2).toEqual(None());
        });
    });

    describe('mapOr', () => {
        //
        it('Applies a function to the contained value if Some.', () => {
            const x: Option<string> = Some('foo');
            expect(x.mapOr(42, (v) => v.length)).toBe(3);
        });

        it('Returns the provided default result if None.', () => {
            const x: Option<string> = None();
            expect(x.mapOr(42, (v) => v.length)).toBe(42);
        });
    });

    describe('mapOrElse', () => {
        const k = 21;

        it('Applies a function to the contained value if Some.', () => {
            const x = Some('foo');
            expect(
                x.mapOrElse(
                    () => 2 * k,
                    (v) => v.length,
                ),
            ).toBe(3);
        });

        it('Computes a default function result if None.', () => {
            const x: Option<string> = None();
            expect(
                x.mapOrElse(
                    () => 2 * k,
                    (v) => v.length,
                ),
            ).toBe(42);
        });
    });

    describe('okOr', () => {
        it("Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.", () => {
            const x = Some('foo');
            expect(x.okOr(0)).toEqual(Ok('foo'));

            const x2: Option<string> = None();
            expect(x2.okOr(0)).toEqual(Err(0));
        });
    });

    describe('okOrElse', () => {
        it('Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err())`.', () => {
            const x = Some('foo');
            expect(x.okOrElse(() => 0)).toEqual(Ok('foo'));

            const x2: Option<string> = None();
            expect(x2.okOrElse(() => 0)).toEqual(Err(0));
        });
    });

    describe('iter', () => {
        it('Returns an iterator over the possibly contained value.', () => {
            const x = Some(4);
            expect(x.iter().next().value).toEqual(Some(4));

            const x2: Option<number> = None();
            expect(x2.iter().next().value).toEqual(None());
        });
    });

    describe('and', () => {
        it('Returns `None` if the option is `None`', () => {
            let x = Some(2);
            let y: Option<string> = None();
            expect(x.and(y)).toEqual(None());

            x = None();
            y = Some('foo');
            expect(x.and(y)).toEqual(None());

            x = None();
            y = None();
            expect(x.and(y)).toEqual(None());
        });

        it('Returns `optb` if the option is `Some`', () => {
            const x = Some(2);
            const y = Some('foo');
            expect(x.and(y)).toEqual(Some('foo'));
        });
    });

    describe('andThen', () => {
        function checkedMul(x: number, other: number): Option<number> {
            const result = x * other;
            if (Number.isSafeInteger(result)) {
                return Some(result);
            }
            return None();
        }

        function sqThenToString(x: number): Option<string> {
            return checkedMul(x, x).map((sq) => sq.toString());
        }

        it('Returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.', () => {
            expect(Some(2).andThen(sqThenToString)).toEqual(Some('4'));
            expect(Some(1_000_000_000).andThen(sqThenToString)).toEqual(None());
            expect(None<number>().andThen(sqThenToString)).toEqual(None());
        });

        it('Can be used to chain fallible operations that may return `None`.', () => {
            const arr2d = [
                ['A0', 'A1'],
                ['B0', 'B1'],
            ];

            const item0_1 = Maybe(arr2d[0]).andThen((row) => Maybe(row[1]));
            expect(item0_1).toEqual(Some('A1'));

            const item2_0 = Maybe(arr2d[2]).andThen((row) => Maybe(row[0]));
            expect(item2_0).toEqual(None());
        });
    });

    describe('filter', () => {
        function isEven(n: number): boolean {
            return n % 2 === 0;
        }

        it('Returns `None` if the option is `None`, otherwise calls `predicate` with the wrapped value and returns:', () => {
            expect(None<number>().filter(isEven)).toEqual(None());
            expect(Some(3).filter(isEven)).toEqual(None());
            expect(Some(4).filter(isEven)).toEqual(Some(4));
        });
    });

    describe('or', () => {
        it('Returns the option if it contains a value, otherwise returns `optb`.', () => {
            const x = Some(2);
            const y: Option<number> = None();
            expect(x.or(y)).toEqual(Some(2));

            const x2 = None();
            const y2 = Some(100);
            expect(x2.or(y2)).toEqual(Some(100));

            const x3 = Some(2);
            const y3 = Some(100);
            expect(x3.or(y3)).toEqual(Some(2));

            const x4 = None();
            const y4 = None();
            expect(x4.or(y4)).toEqual(None());
        });
    });

    describe('orElse', () => {
        function nobody(): Option<string> {
            return None();
        }

        function vikings(): Option<string> {
            return Some('vikings');
        }

        it('Returns the option if it contains a value, otherwise calls `f` and returns the result.', () => {
            expect(Some('barbarians').orElse(vikings)).toEqual(Some('barbarians'));
            expect(None().orElse(vikings)).toEqual(Some('vikings'));
            expect(None().orElse(nobody)).toEqual(None());
        });
    });

    describe('xor', () => {
        it('Returns `Some` if exactly one of `self`, `optb` is `Some`, otherwise returns `None`.', () => {
            const x = Some(2);
            const y: Option<number> = None();
            expect(x.xor(y)).toEqual(Some(2));

            const x2 = None();
            const y2 = Some(2);
            expect(x2.xor(y2)).toEqual(Some(2));

            const x3 = Some(2);
            const y3 = Some(2);
            expect(x3.xor(y3)).toEqual(None());

            const x4 = Some(2);
            const y4 = Some(9);
            expect(x4.xor(y4)).toEqual(None());

            const x5 = None();
            const y5 = None();
            expect(x5.xor(y5)).toEqual(None());
        });
    });

    describe('insert', () => {
        it('Inserts `value` into the option, then returns a immutable reference to it.', () => {
            const opt = None();
            const val = opt.insert(1);
            expect(val).toEqual(1);
            expect(opt.unwrap()).toEqual(1);
            const val2 = opt.insert(2);
            expect(val2).toEqual(2);
        });
    });

    describe('getOrInsert', () => {
        it('Inserts `value` into the option if it is `None`, then returns an immutable reference to the contained value.', () => {
            const x = None();
            const y = x.getOrInsert(5);
            expect(y).toEqual(5);
            expect(x.unwrap()).toEqual(5);
        });
    });

    describe('take', () => {
        it('Takes the value out of the option, leaving a `None` in its place.', () => {
            const x = Some(2);
            const y = x.take();
            expect(x).toEqual(None());
            expect(y).toEqual(Some(2));

            const x2 = None();
            const y2 = x2.take();
            expect(x2).toEqual(None());
            expect(y2).toEqual(None());
        });
    });

    describe('replace', () => {
        it('Replaces the actual value in the option by the value given in parameter, returning the old value if present, leaving a `Some` in its place without deinitializing either one.', () => {
            const x = Some(2);
            const old = x.replace(5);
            expect(x).toEqual(Some(5));
            expect(old).toEqual(Some(2));

            const x2 = None();
            const old2 = x2.replace(3);
            expect(x2).toEqual(Some(3));
            expect(old2).toEqual(None());
        });
    });

    describe('contains', () => {
        it('Returns `true` if the option is a `Some` value containing the given value.', () => {
            let x = Some(2);
            expect(x.contains(2)).toBe(true);

            x = Some(3);
            expect(x.contains(2)).toBe(false);

            x = None();
            expect(x.contains(2)).toBe(false);
        });
    });

    describe('zip', () => {
        it('Returns `Some([s, o])` if `self` is `Some(s)` and `other` is `Some(o)`.', () => {
            const x = Some(1);
            const y = Some('hi');

            expect(x.zip(y)).toEqual(Some([1, 'hi']));
        });

        it('Returns `None` if `self` is `None` or `other` is `None`.', () => {
            const x = Some(1);
            const y = None();

            expect(x.zip(y)).toEqual(None());

            const x2 = None();
            const y2 = Some('hi');

            expect(x2.zip(y2)).toEqual(None());
        });
    });

    describe('zipWith', () => {
        it('Returns `Some(f(s, o))` if `self` is `Some(s)` and `other` is `Some(o)`.', () => {
            const x = Some(17.5);
            const y = Some(42.7);

            expect(x.zipWith(y, (a, b) => ({ x: a, y: b }))).toEqual(Some({ x: 17.5, y: 42.7 }));
        });

        it('Returns `None` if `self` is `None` or `other` is `None`.', () => {
            const x = Some(17.5);
            const y = None();

            expect(x.zipWith(y, (a, b) => ({ x: a, y: b }))).toEqual(None());

            const x2 = None();
            const y2 = Some(42.7);

            expect(x2.zipWith(y2, (a, b) => ({ x: a, y: b }))).toEqual(None());
        });
    });

    describe('unzip', () => {
        it('Unzips an option containing a tuple of two options.', () => {
            const x = Some([1, 'hi']);
            const y = None();

            expect(x.unzip()).toEqual([Some(1), Some('hi')]);
            expect(y.unzip()).toEqual([None(), None()]);
        });
    });

    describe('transpose', () => {
        it('Transposes an option containing a result into a result of an option.', () => {
            const x = Ok(Some(5));
            const y = Some(Ok(5));
            expect(x).toEqual(y.transpose());

            const x2 = Ok(None());
            const y2 = None();
            expect(x2).toEqual(y2.transpose());

            const x3 = Err('Some error');
            const y3 = Some(Err('Some error'));
            expect(x3).toEqual(y3.transpose());
        });
    });

    describe('Comparison and Equality', () => {
        test('Comparison operators for options works.', () => {
            expect(Some(1) > Some(2)).toBe(false);
            expect(Some(1) > Some(1)).toBe(false);
            expect(Some(2) > Some(1)).toBe(true);

            expect(Some(1) >= Some(2)).toBe(false);
            expect(Some(1) >= Some(1)).toBe(true);
            expect(Some(2) >= Some(1)).toBe(true);

            expect(Some(1) < Some(2)).toBe(true);
            expect(Some(1) < Some(1)).toBe(false);
            expect(Some(2) < Some(1)).toBe(false);

            expect(Some(1) <= Some(2)).toBe(true);
            expect(Some(1) <= Some(1)).toBe(true);
            expect(Some(2) <= Some(1)).toBe(false);
        });

        test('Comparison methods for options works.', () => {
            expect(Some(1).gt(Some(2))).toBe(false);
            expect(Some(1).gt(Some(1))).toBe(false);
            expect(Some(2).gt(Some(1))).toBe(true);

            expect(Some(1).ge(Some(2))).toBe(false);
            expect(Some(1).ge(Some(1))).toBe(true);
            expect(Some(2).ge(Some(1))).toBe(true);

            expect(Some(1).lt(Some(2))).toBe(true);
            expect(Some(1).lt(Some(1))).toBe(false);
            expect(Some(2).lt(Some(1))).toBe(false);

            expect(Some(1).le(Some(2))).toBe(true);
            expect(Some(1).le(Some(1))).toBe(true);
            expect(Some(2).le(Some(1))).toBe(false);
        });

        test('Equality methods for options works.', () => {
            expect(Some(1).eq(Some(2))).toBe(false);
            expect(Some(1).eq(Some(1))).toBe(true);
            expect(Some(2).eq(Some(1))).toBe(false);

            expect(Some(1).ne(Some(2))).toBe(true);
            expect(Some(1).ne(Some(1))).toBe(false);
            expect(Some(2).ne(Some(1))).toBe(true);
        });
    });
});

describe('Some', () => {
    it('Creates a new Option containing the given value.', () => {
        const x = Some(2);
        expect(x).toEqual(new Option(2));
    });

    it('Throws an error if called with no arguments.', () => {
        // @ts-expect-error
        expect(() => Some()).toThrow();
    });

    it('Throws an error if called with null, undefined, or None.', () => {
        // @ts-expect-error
        expect(() => Some(null)).toThrow();
        // @ts-expect-error
        expect(() => Some(undefined)).toThrow();
        expect(() => Some(None())).not.toThrow();
    });
});

describe('None', () => {
    it('Creates a new Option containing no value.', () => {
        const x = None();
        expect(x).toEqual(new Option(null));
    });
});
