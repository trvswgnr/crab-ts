import { Err, Ok, Result } from './result';

/**
 * Implementation of Rust's `Option` type in TypeScript.
 *
 * ### Optional values.
 *
 * Type {@link Optional `Optional`} represents an optional value: every {@link Optional `Optional`}
 * is either {@link Some `Some`} and contains a value, or {@link None `None`}, and
 * does not. {@link Optional `Optional`} types are very common in Rust code, as
 * they have a number of uses:
 *
 * * Initial values
 * * Return values for functions that are not defined
 *   over their entire input range (partial functions)
 * * Return value for otherwise reporting simple errors, where {@link None `None`} is
 *   returned on error
 * * Optional class fields
 * * Class fields that can be loaned or "taken"
 * * Optional function arguments
 * * Nullable values
 * * Swapping things out of difficult situations
 *
 * In Rust, {@link Optional `Optional`}s are commonly paired with pattern matching to query the presence
 * of a value and take action, always accounting for the {@link None `None`} case. Unfortunately,
 * TypeScript does not have pattern matching, so we have to use a series of `if` statements.
 * ```
 * function divide(numerator: number, denominator: number): Optional<number> {
 *     if (denominator === 0) {
 *         return None
 *     } else {
 *         return Some(numerator / denominator)
 *     }
 * }
 *
 * // The return value of the function is an Optional<number>
 * let result = divide(2, 3);
 *
 * if (result.isSome()) {
 *    console.log(`Result: {result.unwrap()}`);
 * } else {
 *   console.log("Cannot divide by zero");
 * }
 * ```
 */
class Optional<T> {
    constructor(private value: T) {}

    /**
     * Returns `true` if the option is a {@link Some `Some`} value.
     */
    isSome(): boolean {
        if (this.value === null || typeof this.value === 'undefined') {
            return false;
        }

        return true;
    }

    /**
     * Returns `true` if the option is a {@link Some `Some`} and the value inside of it matches a predicate.
     */
    isSomeAnd(f: (x: T) => boolean): boolean {
        return this.isSome() && f(this.value);
    }

    /**
     * Returns `true` if the option is a {@link None `None`} value.
     */
    isNone(): boolean {
        return !this.isSome();
    }

    /**
     * Returns the contained {@link Some `Some`} value, consuming the `this` value.
     *
     * @throws {@link Error} if the value is a {@link None `None`} with a custom panic message provided by `msg`.
     */
    expect(msg: string): T {
        if (this.isSome()) {
            return this.value;
        }

        throw new Error(msg);
    }

    /**
     * Returns the contained {@link Some `Some`} value, consuming the `this` value.
     */
    unwrap(): T {
        if (this.isSome()) {
            return this.value;
        }

        throw new Error('Called `Option.unwrap()` on a `None` value');
    }

    /**
     * Returns the contained {@link Some `Some`} value or a provided default.
     */
    unwrapOr(defaultValue: T): T {
        if (this.isSome()) {
            return this.value;
        }

        return defaultValue;
    }

    /**
     * Returns the contained {@link Some `Some`} value or computes it from a closure.
     */
    unwrapOrElse(f: () => T): T {
        if (this.isSome()) {
            return this.value;
        }

        return f();
    }

    /**
     * Maps an {@link Optional<T> `Optional<T>`} to {@link Optional<U> `Optional<U>`} by applying a function to a contained value.
     */
    map<U, F extends (x: T) => U>(f: F): Optional<U> {
        if (this.isSome()) {
            const value = f(this.value);

            if (value === null || typeof value === 'undefined') {
                return _None();
            }

            return Some(value as any);
        }

        return _None();
    }

    /**
     * Calls the provided closure with a reference to the contained value (if {@link Some `Some`}).
     */
    inspect<F extends (x: T) => void>(f: F): Optional<T> {
        if (this.isSome()) {
            f(this.value);
        }

        return this;
    }

    /**
     * Returns the provided default result (if {@link None `None`}),
     * or applies a function to the contained value (if {@link Some `Some`}).
     */
    mapOr<U, F extends (x: T) => U>(defaultValue: ReturnType<F>, f: F): U {
        if (this.isSome()) {
            return f(this.value);
        }

        return defaultValue;
    }

    /**
     * Computes a default function result (if {@link None `None`}),
     * applies a different function to the contained value (if {@link Some `Some`}).
     */
    mapOrElse<U, D extends () => U, F extends (x: T) => U>(defaultFn: D, f: F): U {
        if (this.isSome()) {
            return f(this.value);
        }

        return defaultFn();
    }

    /**
     * Transforms the {@link Optional<T> `Optional<T>`} into a {@link Result<T, E> `Result<T, E>`}, mapping {@link Some `Some(v)`} to
     * {@link Ok `Ok(v)`} and {@link None `None`} to {@link Err `Err(err)`}.
     */
    okOr<E>(err: E): Result<T, E> {
        if (this.isSome()) {
            return Ok(this.value);
        }

        return Err(err);
    }

    /**
     * Transforms the {@link Optional<T> `Optional<T>`} into a {@link Result<T, E> `Result<T, E>`}, mapping {@link Some `Some(v)`} to
     * {@link Ok `Ok(v)`} and {@link None `None`} to {@link Err `Err(err())`}.
     */
    okOrElse<E, F extends () => E>(err: F): Result<T, E> {
        if (this.isSome()) {
            return Ok(this.value);
        }

        return Err(err());
    }

    /**
     * Returns an iterator over the possibly contained value.
     */
    iter(): IterableIterator<Optional<T>> {
        return [this][Symbol.iterator]();
    }

    /**
     * Returns {@link None `None`} if the option is {@link None `None`}, otherwise returns `optb`.
     *
     * Arguments passed to {@link Optional.and `and`} are eagerly evaluated; if you are passing the
     * result of a function call, it is recommended to use {@link Optional.andThen `andThen`}, which is
     * lazily evaluated.
     */
    and<U>(optb: Optional<U>): Optional<U> {
        if (this.isSome()) {
            return optb;
        }

        return _None();
    }

    /**
     * Returns {@link None `None`} if the option is {@link None `None`}, otherwise calls `f` with the
     * wrapped value and returns the result.
     *
     * Some languages call this operation flatmap.
     */
    andThen<U, F extends (x: T) => Optional<U>>(f: F): Optional<U> {
        if (this.isSome()) {
            return f(this.value);
        }

        return _None();
    }

    /**
     * Returns {@link None `None`} if the option is {@link None `None`}, otherwise calls `predicate`
     * with the wrapped value and returns:
     *
     * - {@link Some `Some(t)`} if `predicate` returns `true` (where `t` is the wrapped
     *   value), and
     * - {@link None `None`} if `predicate` returns `false`.
     *
     * This function works similar to {@link Array.filter `Array.filter()`}. You can imagine
     * the {@link Optional `Optional<T>`} being an iterator over one or zero elements. {@link Optional.filter `filter()`}
     * lets you decide which elements to keep.
     */
    filter<F extends (x: T) => boolean>(predicate: F): Optional<T> {
        if (this.isSome()) {
            if (predicate(this.value)) {
                return this;
            }
        }

        return _None();
    }

    /**
     * Returns the option if it contains a value, otherwise returns `optb`.
     *
     * Arguments passed to {@link Optional.or `or`} are eagerly evaluated; if you are passing the
     * result of a function call, it is recommended to use {@link Optional.orElse `orElse`}, which is
     * lazily evaluated.
     */
    or(optb: Optional<T>): Optional<T> {
        if (this.isSome()) {
            return this;
        }

        return optb;
    }

    /**
     * Returns the option if it contains a value, otherwise calls `f` and
     * returns the result.
     */
    orElse<F extends () => Optional<T>>(f: F): Optional<T> {
        if (this.isSome()) {
            return this;
        }

        return f();
    }

    /**
     * Returns {@link Some `Some`} if exactly one of `self`, `optb` is {@link Some `Some`}, otherwise returns {@link None `None`}.
     */
    xor(optb: Optional<T>): Optional<T> {
        if (this.isSome() && optb.isSome()) {
            return _None();
        }

        if (this.isSome()) {
            return this;
        }

        if (optb.isSome()) {
            return optb;
        }

        return _None();
    }

    /**
     * Inserts `value` into the option, then returns a reference to it.
     *
     * If the option already contains a value, the old value is dropped.
     *
     * See also {@link Optional.getOrInsert `Optional.getOrInsert`}, which doesn't
     * update the value if the option already contains {@link Some `Some`}.
     */
    insert(value: T): T {
        this.value = value;
        return this.value;
    }

    /**
     * Inserts `value` into the option if it is {@link None `None`}, then
     * returns a reference to the contained value.
     *
     * See also {@link Optional.insert `insert`}, which updates the value even if
     * the option already contains {@link Some `Some`}.
     */
    getOrInsert(value: T): T {
        if (this.isNone()) {
            this.value = value;
        }

        return this.value;
    }

    /**
     * Takes the value out of the option, leaving a {@link None `None`} in its place.
     */
    take(): Optional<T> {
        if (this.isSome()) {
            const value = this.value;
            this.value = null as T;
            return Some(value as any);
        }

        return _None();
    }

    /**
     * Replaces the actual value in the option by the value given in parameter,
     * returning the old value if present,
     * leaving a {@link Some `Some`} in its place without deinitializing either one.
     */
    replace(newValue: T): Optional<T> {
        const oldValue = this.value;
        this.value = newValue;
        if (oldValue === null || typeof oldValue === 'undefined') {
            return _None();
        }
        return Some(oldValue as any);
    }

    /**
     * Returns `true` if the option is a {@link Some `Some`} value containing the given value.
     */
    contains<U extends T>(x: U): boolean {
        if (this.isSome()) {
            return this.value === x;
        }

        return false;
    }

    /**
     * Zips `this` with another `Option`.
     *
     * If `this` is {@link Some `Some(s)`} and `other` is {@link Some `Some(o)`}, this method returns {@link Some `Some([s, o])`}.
     * Otherwise, `None` is returned.
     */
    zip<U>(other: Optional<U>): Optional<[T, U]> {
        if (this.isSome() && other.isSome()) {
            return Some([this.value, other.value]);
        }

        return _None();
    }

    /**
     * Zips `self` and another `Option` with function `f`.
     *
     * If `self` is {@link Some `Some(s)`} and `other` is {@link Some `Some(o)`}, this method returns {@link Maybe `Maybe(f(s, o))}`.
     * Otherwise, `None` is returned.
     */
    zipWith<U, F extends (x: T, y: U) => R, R>(other: Optional<U>, f: F): Optional<R> {
        if (this.isSome() && other.isSome()) {
            return Maybe(f(this.value, other.value));
        }

        return _None();
    }

    /**
     * Unzips an option containing a tuple of two options.
     *
     * If `self` is `Some([a, b])` this method returns `[Some(a), Some(b)]`.
     * Otherwise, `[None, None]` is returned.
     */
    unzip<U>(): [Optional<T>, Optional<U>] {
        if (this.isSome()) {
            if (Array.isArray(this.value) && this.value.length === 2) {
                return [Some(this.value[0]), Some(this.value[1])];
            }
        }

        return [_None(), _None()];
    }

    /**
     * Transposes an {@link Optional `Optional`} of a {@link Result  `Result`} into a {@link Result  `Result`} of an {@link Optional `Optional`}.
     *
     * - {@link None `None`} will be mapped to {@link Ok `Ok`}
     * - {@link Some `Some(Ok(_))`} will be mapped to {@link Ok `Ok(Some(_))`}
     * - {@link Some `Some(Err(_))`} will be mapped to {@link Err `Err(_)`}
     */
    transpose(): Result<Optional<T extends Result<any, any> ? Unwrapped<T> : never>, any> {
        if (this.isSome()) {
            if (
                typeof this.value === 'object' &&
                this.value !== null &&
                'map' in this.value &&
                'isOk' in this.value &&
                'isErr' in this.value
            ) {
                if ((this.value as any).isOk()) {
                    return (this.value as { map: CallableFunction }).map(Some);
                }

                return this.value as any;
            }

            throw new Error('Value is not a Result');
        }

        return Ok(_None());
    }

    /* Equality */

    eq(other: Optional<T>): boolean {
        return this.value === other.value;
    }

    ne(other: Optional<T>): boolean {
        return !this.eq(other);
    }

    /* Ordering */

    lt(other: Optional<T>): boolean {
        return this.value < other.value;
    }

    le(other: Optional<T>): boolean {
        return this.value <= other.value;
    }

    gt(other: Optional<T>): boolean {
        return this.value > other.value;
    }

    ge(other: Optional<T>): boolean {
        return this.value >= other.value;
    }

    /**
     * {@link Object.prototype.valueOf `valueOf`} returns the primitive value of the specified object.
     * Used to compare objects with the >, >=, <, and <= operators, but not the ==, ===, !=, and !== operators.
     */
    valueOf(): T {
        return this.value;
    }

    /**
     * {@link Object.prototype.toString `toString`} returns a string representing the specified object.
     */
    toString(): string {
        return String(this.value);
    }
}

/**
 * Creates a new {@link Optional `Optional`} with no value.
 */
function _None(): Optional<any> {
    if (arguments.length > 0) {
        throw new Error('None() does not take any arguments.');
    }
    return new Optional(null);
}

/**
 * No value.
 */
declare const None: Optional<any>;
Object.defineProperty(exports, 'None', { get: _None });

type SomeValue<T> = T extends null | undefined | Optional<null> ? never : T;

/**
 * Some value of type `T`.
 */
function Some<T>(value: SomeValue<T>): Optional<T> {
    if (value === null || typeof value === 'undefined' || value instanceof Optional) {
        throw new Error('Tried to create Some() with a null or undefined value.');
    }
    const isNoneOption =
        typeof value === 'object' &&
        value !== null &&
        'isNone' in value &&
        typeof value.isNone === 'function' &&
        value.isNone();

    if (isNoneOption) {
        throw new Error('Tried to create Some() with a None value.');
    }

    return new Optional(value);
}

/**
 * Returns {@link Some `Some(value)`} if `value` is not null or undefined,
 * otherwise returns {@link None `None`}.
 */
function Maybe<T>(value: T): Optional<T> {
    if (value === null || typeof value === 'undefined') {
        return _None();
    }
    return Some(value as any);
}

type Unwrapped<T> = T extends Result<infer U, any> ? U : never;

export { Optional, Some, Maybe, None };
