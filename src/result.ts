import { None, Option, Some } from './option';
import { UnimplementedError, assertIs } from './util';

class Result<T, E> {
    constructor(private value: T, private error: E) {}

    /**
     * Returns `true` if the result is {@link Ok `Ok`}.
     */
    isOk(): boolean {
        if (
            this.value instanceof Error ||
            typeof this.value === 'undefined' ||
            this.value === null
        ) {
            return false;
        }

        return true;
    }

    /**
     * Returns `true` if the result is {@link Ok `Ok`} and the value inside of it matches a predicate.
     */
    isOkAnd(predicate: (value: T) => boolean): boolean {
        return this.isOk() && predicate(this.value);
    }

    /**
     * Returns `true` if the result is {@link Err `Err`}.
     */
    isErr(): boolean {
        return !this.isOk();
    }

    /**
     * Returns `true` if the result is {@link Err `Err`} and the value inside of it matches a predicate.
     */
    isErrAnd(predicate: (value: E) => boolean): boolean {
        if (this.isErr()) {
            return predicate(this.error);
        }

        return false;
    }

    /**
     * Converts from `Result<T, E>` to [`Option<T>`].
     *
     * Converts `this` into an [`Option<T>`], consuming `this`,
     * and discarding the error, if any.
     */
    ok(): Option<T> {
        if (this.isOk()) {
            if (typeof this.value === 'undefined' || this.value === null) {
                return None;
            }

            return Some(this.value as any);
        }

        return None;
    }

    /**
     * Converts from `Result<T, E>` to [`Option<E>`].
     *
     * Converts `this` into an [`Option<E>`], consuming `this`,
     * and discarding the success value, if any.
     */
    err(): Option<E> {
        if (this.isErr()) {
            return new Option(this.error);
        }

        return None;
    }

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a
     * contained {@link Ok `Ok`} value, leaving an {@link Err `Err`} value untouched.
     *
     * This function can be used to compose the results of two functions.
     */
    map<U, F extends (x: T) => U>(op: F): Result<U, E> {
        if (this.isOk()) {
            return new Result(op(this.value), this.error);
        }

        return Err(this.error);
    }

    /**
     * Returns the provided default (if {@link Err `Err`}), or
     * applies a function to the contained value (if {@link Ok `Ok`}),
     *
     * Arguments passed to `mapOr` are eagerly evaluated; if you are passing
     * the result of a function call, it is recommended to use [`mapOrElse`],
     * which is lazily evaluated.
     */
    mapOr<U>(defaultValue: U, f: (value: T) => U): U {
        if (this.isOk()) {
            return f(this.value);
        }

        return defaultValue;
    }

    /**
     * Maps a `Result<T, E>` to `U` by applying fallback function `default` to
     * a contained {@link Err `Err`} value, or function `f` to a contained {@link Ok `Ok`} value.
     *
     * This function can be used to unpack a successful result while handling an error.
     */
    mapOrElse<U, D extends (value: E) => U, F extends (value: T) => U>(defaultValue: D, f: F): U {
        if (this.isOk()) {
            return f(this.value);
        }

        return defaultValue(this.error);
    }

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
     * contained {@link Err `Err`} value, leaving an {@link Ok `Ok`} value untouched.
     *
     * This function can be used to pass through a successful result while handling
     * an error.
     */
    mapErr<F, O extends (value: E) => F>(op: O): Result<T, F> {
        if (this.isErr()) {
            return new Result(this.value, op(this.error));
        }

        return Ok(this.value);
    }

    /**
     * Calls the provided closure with a reference to the contained value (if {@link Ok `Ok`}).
     */
    inspect(f: (value: T) => void): Result<T, E> {
        if (this.isOk()) {
            f(this.value);
        }
        return this;
    }

    /**
     * Calls the provided closure with a reference to the contained error (if {@link Err `Err`}).
     */
    inspectErr<F>(f: (value: E) => void): Result<T, E> {
        if (this.isErr()) {
            f(this.error);
        }
        return this;
    }

    /**
     * Returns an iterator over the possibly contained value.
     *
     * The iterator yields one value if the result is {@link Ok `Ok`}, otherwise none.
     */
    iter(): IterableIterator<Option<T>> {
        if (this.isOk()) {
            if (typeof this.value === 'undefined' || this.value === null) {
                return [None].values();
            }

            return [Some(this.value as {}) as Option<T>].values();
        }

        return [None].values();
    }

    /**
     * Returns the contained {@link Ok `Ok`} value, consuming the `this` value.
     */
    expect(msg: string): T {
        if (this.isOk()) {
            return this.value;
        }

        throw new Error(`${msg}: ${this.error}`);
    }

    /**
     * Returns the contained {@link Ok `Ok`} value, consuming the `this` value.
     */
    unwrap(): T {
        if (this.isOk()) {
            return this.value;
        }

        throw new Error('called `Result.unwrap()` on an `Err` value: ' + this.error);
    }

    /**
     * Returns the contained {@link Ok `Ok`} value or a default.
     *
     * Consumes the `this` argument then, if {@link Ok `Ok`}, returns the contained
     * value, otherwise if {@link Err `Err`}, returns the default value for that
     * type.
     *
     * @throws {UnimplementedError}
     * @ignore Not implemented, TypeScript does not support default values.
     * @deprecated Use {@link Result.unwrapOr `unwrapOr`} instead.
     */
    unwrapOrDefault(): never {
        throw new UnimplementedError('Result.unwrapOrDefault() is not implemented');
    }

    /**
     * Returns the contained {@link Err `Err`} value, consuming the `this` value.
     *
     * Panics if the value is an {@link Ok `Ok`}, with a panic message including the
     * passed message, and the content of the {@link Ok `Ok`}.
     */
    expectErr(msg: string): E {
        if (this.isErr()) {
            return this.error;
        }
        throw new Error(`${msg}: ${this.value}`);
    }

    /**
     * Returns the contained {@link Err `Err`} value, consuming the `this` value.
     *
     * Panics if the value is an {@link Ok `Ok`}, with a custom panic message provided
     * by the {@link Ok `Ok`}'s value.
     */
    unwrapErr(): E {
        if (this.isErr()) {
            return this.error;
        }

        throw new Error('called `Result.unwrapErr()` on an `Ok` value: ' + this.value);
    }

    /**
     * Returns the contained [`Ok`] value, but never panics.
     *
     * Unlike [`unwrap`], this method is known to never panic on the
     * result types it is implemented for. Therefore, it can be used
     * instead of `unwrap` as a maintainability safeguard that will fail
     * to compile if the error type of the `Result` is later changed
     * to an error that can actually occur.
     *
     * @throws {UnimplementedError}
     * @deprecated Not yet implemented
     * @todo Find a way to implement this
     */
    intoOk(): never {
        throw new UnimplementedError('Result.intoOk() is not implemented');
    }

    /**
     * Returns the contained [`Err`] value, but never panics.
     *
     * Unlike [`unwrap_err`], this method is known to never panic on the
     * result types it is implemented for. Therefore, it can be used
     * instead of `unwrap_err` as a maintainability safeguard that will fail
     * to compile if the ok type of the `Result` is later changed
     * to a type that can actually occur.
     *
     * @throws {UnimplementedError}
     * @deprecated Not yet implemented
     * @todo Find a way to implement this
     */
    intoErr(): never {
        throw new UnimplementedError('Result.intoErr() is not implemented');
    }

    /**
     * Returns `res` if the result is {@link Ok `Ok`}, otherwise returns the {@link Err `Err`} value of `this`.
     *
     * Arguments passed to `and` are eagerly evaluated; if you are passing the
     * result of a function call, it is recommended to use [`andThen`], which is
     * lazily evaluated.
     */
    and<U>(res: Result<U, E>): Result<U, E> {
        if (this.isOk()) {
            return res;
        }

        return Err(this.error);
    }

    /**
     * Calls `op` if the result is {@link Ok `Ok`}, otherwise returns the {@link Err `Err`} value of `this`.
     *
     * This function can be used for control flow based on `Result` values.
     */
    andThen<U, F extends CallableFunction>(op: F): Result<U, E> {
        if (this.isOk()) {
            return op(this.value);
        }
        return Err(this.error);
    }

    /**
     * Returns `res` if the result is {@link Err `Err`}, otherwise returns the {@link Ok `Ok`} value of `this`.
     *
     * Arguments passed to `or` are eagerly evaluated; if you are passing the
     * result of a function call, it is recommended to use {@link Result.orElse `orElse`}, which is
     * lazily evaluated.
     */
    or<F>(res: Result<T, F>): Result<T, F> {
        if (this.isErr()) {
            return res;
        }
        if (this.error === null) {
            return Ok(this.value);
        }

        throw new Error('called `Result.or()` on an invalid value');
    }

    /**
     * Calls `op` if the result is {@link Err `Err`}, otherwise returns the {@link Ok `Ok`} value of `this`.
     * This function can be used for control flow based on result values.
     */
    orElse<U, O extends (x: E) => Result<T, U>>(op: O): Result<T, U extends E ? U : E> {
        if (this.isErr()) {
            return op(this.error) as Result<T, U extends E ? U : E>;
        }

        return Ok(this.value);
    }

    /**
     * Returns the contained {@link Ok `Ok`} value or a provided default.
     *
     * Arguments passed to `unwrapOr` are eagerly evaluated; if you are passing
     * the result of a function call, it is recommended to use [`unwraporElse`],
     * which is lazily evaluated.
     */
    unwrapOr(defaultValue: T): T {
        if (this.isOk()) {
            return this.value;
        }
        return defaultValue;
    }

    /**
     * Returns the contained {@link Ok `Ok`} value or computes it from a closure.
     */
    unwrapOrElse<F extends (x: NonNullable<E>) => T>(op: F): T {
        if (this.isOk()) {
            return this.value;
        }

        if (this.error === null || typeof this.error === 'undefined') {
            throw new Error('called `Result.unwrapOrElse()` on a null value');
        }

        return op(this.error);
    }

    /**
     * Returns `true` if the result is an {@link Ok `Ok`} value containing the given value.
     */
    contains<U>(x: U): boolean {
        if (this.isOk()) {
            assertIs<U>(this.value);
            return this.value === x;
        }
        return false;
    }

    /**
     * Returns `true` if the result is an {@link Err `Err`} value containing the given value.
     */
    containsErr(x: E): boolean {
        if (this.isErr()) {
            return this.error === x;
        }
        return false;
    }

    /**
     * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
     * `Ok(None)` will be mapped to `None`.
     * `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.
     */
    transpose(): Option<Result<T, E>> {
        if (this.isOk()) {
            if (this.value === null) {
                return None;
            }

            if (
                typeof this.value === 'object' &&
                this.value !== null &&
                'isSome' in this.value &&
                'isNone' in this.value &&
                'map' in this.value
            ) {
                if ((this.value as any).isSome()) {
                    return (this.value as { map: CallableFunction }).map(Ok);
                }

                return None;
            }

            return Some(Ok(this.value));
        }

        if (this.error === null) {
            return None;
        }

        if (
            typeof this.error === 'object' &&
            this.error !== null &&
            'isSome' in this.error &&
            'isNone' in this.error &&
            'map' in this.error
        ) {
            if ((this.error as any).isSome()) {
                return (this.error as { map: CallableFunction }).map(Err);
            }

            return None;
        }

        return Some(Err(this.error));
    }
}

function Ok<T>(value: T): Result<T, never> {
    return new Result(value, null as never);
}

function Err<T, E>(value: E): Result<T, E> {
    return new Result(null as never, value);
}

/**
 * Try to execute a function and return a Result
 */
function Try<T extends CallableFunction, E>(op: T): Result<T, E> {
    try {
        const res = op();
        if (typeof res === 'object' && res !== null && 'isErr' in res && 'isOk' in res) {
            return res;
        }
        return Ok(res);
    } catch (e) {
        return Err(e) as Result<T, E>;
    }
}

export { Result, Ok, Err, Try };
