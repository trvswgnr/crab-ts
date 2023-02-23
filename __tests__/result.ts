import { None, Optional, Some } from '../src/optional';
import { Err, Ok, Result, Try } from '../src/result';
import { ErrorKind } from '../src/util';

const fromJson = (s: string): Result<any, string> => {
    try {
        return Ok(JSON.parse(s));
    } catch (e) {
        return Err((e as Error).message);
    }
};

declare global {
    interface Number {
        checkedMul(other: number): Result<number, string>;
    }
}

Number.prototype.checkedMul = function (other) {
    const result = (this as number) * other;
    if (Number.isSafeInteger(result)) {
        return Ok(result);
    }
    return Err('overflowed');
};

function sqThenToString<T extends number>(x: T): Result<string, string> {
    return x.checkedMul(x).map((x) => x.toString());
}

describe('Result', () => {
    describe('isOk', () => {
        it('returns true if the result is Ok', () => {
            const x: Result<number, string> = Ok(-3);
            expect(x.isOk()).toBe(true);
        });

        it('returns false if the result is Err', () => {
            const x: Result<number, string> = Err('Some error message');
            expect(x.isOk()).toBe(false);
        });
    });

    describe('isOkAnd', () => {
        it('returns true if the result is Ok and the value inside of it matches a predicate', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.isOkAnd((x) => x > 1)).toBe(true);
        });

        it('returns false if the result is Ok and the value inside of it does not match a predicate', () => {
            const x: Result<number, string> = Ok(0);
            expect(x.isOkAnd((x) => x > 1)).toBe(false);
        });

        it('returns false if the result is Err', () => {
            const x: Result<number, string> = Err('hey');
            expect(x.isOkAnd((x) => x > 1)).toBe(false);
        });
    });

    describe('isErr', () => {
        it('returns false if the result is Ok', () => {
            const x: Result<number, string> = Ok(-3);
            expect(x.isErr()).toBe(false);
        });

        it('returns true if the result is Err', () => {
            const x: Result<number, string> = Err('Some error message');
            expect(x.isErr()).toBe(true);
        });
    });

    describe('isErrAnd', () => {
        it('returns true if the result is Err and the value inside of it matches a predicate', () => {
            const x: Result<number, Error> = Err(new RangeError('!'));
            expect(x.isErrAnd((x) => x.name === ErrorKind.RangeError)).toBe(true);
        });

        it('returns false if the result is Err and the value inside of it does not match a predicate', () => {
            const x: Result<number, Error> = Err(new ReferenceError('!'));
            expect(x.isErrAnd((x) => x.name === ErrorKind.RangeError)).toBe(false);
        });

        it('returns false if the result is Ok', () => {
            const x: Result<number, Error> = Ok(123);
            expect(x.isErrAnd((x) => x.name === ErrorKind.RangeError)).toBe(false);
        });
    });

    describe('ok', () => {
        it('converts from Result<T, E> to Option<T>', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.ok()).toEqual(Some(2));

            const x2: Result<number, string> = Err('Nothing here');
            expect(x2.ok()).toEqual(None);
        });
    });

    describe('err', () => {
        it('converts from Result<T, E> to Option<E>', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.err()).toEqual(None);

            const x2: Result<number, string> = Err('Nothing here');
            expect(x2.err()).toEqual(Some('Nothing here'));
        });
    });

    describe('map', () => {
        it('maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value', () => {
            const parsed = fromJson('{"number": 1}');
            const json = parsed.map((x) => x.number);
            expect(json).toEqual(Ok(1));

            const parsed2 = fromJson('{"number": 1');
            const json2 = parsed2.map((x) => x.number);
            expect(json2).toEqual(Err('Unexpected end of JSON input'));
        });
    });

    describe('mapOr', () => {
        it('Applies a function to the contained value if `Ok`', () => {
            const x: Result<string, string> = Ok('foo');
            expect(x.mapOr(42, (v) => v.length)).toEqual(3);
        });

        it('Returns the provided default if `Err`', () => {
            const x: Result<string, string> = Err('bar');
            expect(x.mapOr(42, (v) => v.length)).toEqual(42);
        });
    });

    describe('mapOrElse', () => {
        const k = 21;
        it('Applies a function to the contained value if `Ok`', () => {
            const x: Result<string, string> = Ok('foo');
            expect(
                x.mapOrElse(
                    (_) => k * 2,
                    (v) => v.length,
                ),
            ).toEqual(3);
        });

        it('Applies a fallback function to the contained value if `Err`', () => {
            const x: Result<string, string> = Err('bar');
            expect(
                x.mapOrElse(
                    (_) => k * 2,
                    (v) => v.length,
                ),
            ).toEqual(42);
        });
    });

    describe('mapErr', () => {
        it('Maps a `Result<T, E>` to `Result<T, F` by applying a function to a contained `Err` value.', () => {
            const stringify = (x: number) => `error code: ${x}`;

            const x: Result<number, number> = Ok(2);
            expect(x.mapErr(stringify)).toEqual(Ok(2));

            const x2: Result<number, number> = Err(13);
            expect(x2.mapErr(stringify)).toEqual(Err('error code: 13'));
        });
    });

    describe('inspect', () => {
        it('Calls the provided closure with a reference to the contained value (if `Ok`)', () => {
            const log = jest.fn();
            const x: Result<number, string> = Ok(2);
            expect(x.inspect((x) => log(`original: ${x}`))).toEqual(Ok(2));
            expect(log).toHaveBeenCalledWith('original: 2');

            const x2: Result<number, string> = Err('foo');
            expect(x2.inspect((x) => log(`original: ${x}`))).toEqual(Err('foo'));
            expect(log).not.toHaveBeenCalledWith('original: foo');
        });
    });

    describe('inspectErr', () => {
        it('Calls the provided closure with a reference to the contained error (if `Err`)', () => {
            const log = jest.fn();
            const x: Result<number, string> = Err('foo');
            expect(x.inspectErr((x) => log(`original: ${x}`))).toEqual(Err('foo'));
            expect(log).toHaveBeenCalledWith('original: foo');

            const x2: Result<number, string> = Ok(2);
            expect(x2.inspectErr((x) => log(`original: ${x}`))).toEqual(Ok(2));
            expect(log).not.toHaveBeenCalledWith('original: 2');
        });
    });

    describe('iter', () => {
        it('Returns an iterator over the possibly contained value.', () => {
            const x: Result<number, string> = Ok(7);
            expect(x.iter().next().value).toEqual(Some(7));

            const x2: Result<number, string> = Err('nothing!');
            expect(x2.iter().next().value).toEqual(None);
        });
    });

    describe('expect', () => {
        it('Returns the contained `Ok` value, consuming the `self` value.', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.expect('Testing expect')).toEqual(2);

            const x2: Result<number, string> = Err('emergency failure');
            expect(() => x2.expect('Testing expect')).toThrowError(
                'Testing expect: emergency failure',
            );
        });
    });

    describe('unwrap', () => {
        it('Returns the contained `Ok` value, consuming the `self` value.', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.unwrap()).toEqual(2);

            const x2: Result<number, string> = Err('emergency failure');
            expect(() => x2.unwrap()).toThrowError(
                'called `Result.unwrap()` on an `Err` value: emergency failure',
            );
        });
    });

    describe('unwrapOrDefault', () => {
        it("Throws an UnimplementedError because it's not supported.", () => {
            const x: Result<number, string> = Ok(2);
            expect(() => x.unwrapOrDefault()).toThrowError(
                'Result.unwrapOrDefault() is not implemented',
            );
        });
    });

    describe('expectErr', () => {
        it('Returns the contained `Err` value, consuming the `self` value.', () => {
            const x: Result<number, string> = Err('emergency failure');
            expect(x.expectErr('Testing expect_err')).toBe('emergency failure');

            const x2: Result<number, string> = Ok(10);
            expect(() => x2.expectErr('Testing expect_err')).toThrowError('Testing expect_err: 10');
        });
    });

    describe('unwrapErr', () => {
        it('Returns the contained `Err` value, consuming the `self` value.', () => {
            const x: Result<number, string> = Err('emergency failure');
            expect(x.unwrapErr()).toBe('emergency failure');

            const x2: Result<number, string> = Ok(2);
            expect(() => x2.unwrapErr()).toThrowError(
                'called `Result.unwrapErr()` on an `Ok` value: 2',
            );
        });
    });

    describe('intoOk', () => {
        it('Throws an UnimplementedError because it is not yet supported.', () => {
            const x: Result<number, string> = Ok(2);
            expect(() => x.intoOk()).toThrowError('Result.intoOk() is not implemented');
        });
    });

    describe('intoErr', () => {
        it('Throws an UnimplementedError because it is not yet supported.', () => {
            const x: Result<number, string> = Err('emergency failure');
            expect(() => x.intoErr()).toThrowError('Result.intoErr() is not implemented');
        });
    });

    describe('and', () => {
        it('Returns `res` if the result is `Ok`, otherwise returns the `Err` value of `self`.', () => {
            const x: Result<number, string> = Ok(2);
            const y: Result<string, string> = Err('late error');
            expect(x.and(y)).toEqual(Err('late error'));

            const x2: Result<number, string> = Err('early error');
            const y2: Result<string, string> = Ok('foo');
            expect(x2.and(y2)).toEqual(Err('early error'));

            const x3: Result<number, string> = Err('not a 2');
            const y3: Result<string, string> = Err('late error');
            expect(x3.and(y3)).toEqual(Err('not a 2'));

            const x4: Result<number, string> = Ok(2);
            const y4: Result<string, string> = Ok('different result type');
            expect(x4.and(y4)).toEqual(Ok('different result type'));
        });
    });

    describe('andThen', () => {
        it('Calls `op` if the result is `Ok`, otherwise returns the `Err` value of `self`.', () => {
            expect(Ok(2).andThen(sqThenToString)).toEqual(Ok('4'));
            expect(Ok(1_000_000_000).andThen(sqThenToString)).toEqual(Err('overflowed'));
            expect(Err('not a number').andThen(sqThenToString)).toEqual(Err('not a number'));
        });
    });

    describe('or', () => {
        it('Returns `res` if the result is `Err`, otherwise returns the `Ok` value of `self`.', () => {
            const x: Result<number, string> = Ok(2);
            const y: Result<number, string> = Err('late error');
            expect(x.or(y)).toEqual(Ok(2));

            const x2: Result<number, string> = Err('early error');
            const y2: Result<number, string> = Ok(2);
            expect(x2.or(y2)).toEqual(Ok(2));

            const x3: Result<number, string> = Err('not a 2');
            const y3: Result<number, string> = Err('late error');
            expect(x3.or(y3)).toEqual(Err('late error'));

            const x4: Result<number, string> = Ok(2);
            const y4: Result<number, string> = Ok(100);
            expect(x4.or(y4)).toEqual(Ok(2));
        });
    });

    describe('orElse', () => {
        function sq(x: number): Result<number, number> {
            return Ok(x * x);
        }

        function err(x: number): Result<number, number> {
            return Err(x);
        }

        it('Calls `op` if the result is `Err`, otherwise returns the `Ok` value of `self`.', () => {
            expect(Ok(2).orElse(sq).orElse(sq)).toEqual(Ok(2));
            expect(Ok(2).orElse(err).orElse(sq)).toEqual(Ok(2));
            expect(Err(3).orElse(sq).orElse(err)).toEqual(Ok(9));
            expect(Err(3).orElse(err).orElse(err)).toEqual(Err(3));
        });
    });

    describe('unwrapOr', () => {
        it('Returns the contained `Ok` value or a provided default.', () => {
            const defaultValue = 2;
            const x: Result<number, string> = Ok(9);
            expect(x.unwrapOr(defaultValue)).toEqual(9);

            const x2: Result<number, string> = Err('error');
            expect(x2.unwrapOr(defaultValue)).toEqual(defaultValue);
        });
    });

    describe('unwrapOrElse', () => {
        function count(x: string): number {
            return x.length;
        }

        it('Returns the contained `Ok` value or computes it from a closure.', () => {
            expect(Ok(2).unwrapOrElse(count)).toEqual(2);
            expect(Err('foo').unwrapOrElse(count)).toEqual(3);
        });
    });

    describe('contains', () => {
        it('Returns `true` if the result is an `Ok` value containing the given value.', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.contains(2)).toEqual(true);

            const x2: Result<number, string> = Ok(3);
            expect(x2.contains(2)).toEqual(false);

            const x3: Result<number, string> = Err('Some error message');
            expect(x3.contains(2)).toEqual(false);
        });
    });

    describe('containsErr', () => {
        it('Returns `true` if the result is an `Err` value containing the given value.', () => {
            const x: Result<number, string> = Ok(2);
            expect(x.containsErr('Some error message')).toEqual(false);

            const x2: Result<number, string> = Err('Some error message');
            expect(x2.containsErr('Some error message')).toEqual(true);

            const x3: Result<number, string> = Err('Some other error message');
            expect(x3.containsErr('Some error message')).toEqual(false);
        });
    });

    describe('transpose', () => {
        it('Transposes a `Result` of an `Option` into an `Option` of a `Result`.', () => {
            const x: Result<Optional<number>, Error> = Ok(Some(5));
            const y: Optional<Result<number, Error>> = Some(Ok(5));
            expect(x.transpose()).toEqual(y);
        });

        it('`Ok(None)` will be mapped to `None`.', () => {
            const x: Result<Optional<number>, Error> = Ok(None);
            const y: Optional<Result<number, Error>> = None;
            expect(x.transpose()).toEqual(y);
        });

        it('`Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.', () => {
            const x: Result<Optional<number>, Error> = Err(new Error('Some error message'));
            const y: Optional<Result<number, Error>> = Some(Err(new Error('Some error message')));
            expect(x.transpose()).toEqual(y);

            const x2: Result<Optional<number>, Optional<number>> = Err(Some(5));
            const y2: Optional<Result<number, number>> = Some(Err(5));
            expect(x2.transpose()).toEqual(y2);

            const x3: Result<Optional<number>, Optional<number>> = Err(None);
            const y3: Optional<Result<number, number>> = None;
            expect(x3.transpose()).toEqual(y3);

            const x4: Result<Optional<number>, number> = Err(5);
            const y4: Optional<Result<number, number>> = Some(Err(5));
            expect(x4.transpose()).toEqual(y4);
        });
    });
});
