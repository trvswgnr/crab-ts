import { Err, Ok, Result } from "./result";
import { type UnwrappedResult } from "./util";

/**
 * Implementation of Rust's `Option` type in TypeScript.
 *
 * ### Option values.
 *
 * Type {@link Option `Option`} represents an option value: every {@link Option `Option`}
 * is either {@link Some `Some`} and contains a value, or {@link None `None`}, and
 * does not. {@link Option `Option`} types are very common in Rust code, as
 * they have a number of uses:
 *
 * * Initial values
 * * Return values for functions that are not defined
 *   over their entire input range (partial functions)
 * * Return value for otherwise reporting simple errors, where {@link None `None`} is
 *   returned on error
 * * Option class fields
 * * Class fields that can be loaned or "taken"
 * * Option function arguments
 * * Nullable values
 * * Swapping things out of difficult situations
 *
 * In Rust, {@link Option `Option`}s are commonly paired with pattern matching to query the presence
 * of a value and take action, always accounting for the {@link None `None`} case. Unfortunately,
 * TypeScript does not have pattern matching, so we have to use a series of `if` statements.
 * ```
 * function divide(numerator: number, denominator: number): Option<number> {
 *     if (denominator === 0) {
 *         return None();
 *     } else {
 *         return Some(numerator / denominator);
 *     }
 * }
 *
 * // The return value of the function is an Option<number>
 * let result = divide(2, 3);
 *
 * if (result.isSome()) {
 *    console.log(`Result: {result.unwrap()}`);
 * } else {
 *   console.log("Cannot divide by zero");
 * }
 * ```
 */
class Option<T> {
    constructor(private value: T) {}

    /**
     * Returns `true` if the option is a {@link Some `Some`} value.
     */
    isSome(): boolean {
        if (this.value === null || typeof this.value === "undefined") {
            return false;
        }

        return true;
    }

    /**
     * Returns `true` if the option is a {@link Some `Some`} and the value inside
     * of it matches a predicate.
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
     * @throws {@link Error} if the value is a {@link None `None`} with a custom
     * panic message provided by `msg`.
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

        throw new Error("called `Option.unwrap()` on a `None` value");
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
     * Maps an {@link Option<T> `Option<T>`} to {@link Option<U> `Option<U>`} by
     * applying a function to a contained value.
     */
    map<U, F extends (x: T) => U>(f: F): Option<U> {
        if (this.isSome()) {
            const value = f(this.value);

            if (value === null || typeof value === "undefined") {
                return None();
            }

            return Some(value as any) as any;
        }

        return None();
    }

    /**
     * Calls the provided closure with a reference to the contained
     * value (if {@link Some `Some`}).
     */
    inspect<F extends (x: T) => void>(f: F): Option<T> {
        if (this.isSome()) {
            f(this.value);
        }

        return this;
    }

    /**
     * Returns the provided default result (if {@link None `None`}),
     * or applies a function to the contained value (if {@link Some `Some`}).
     */
    mapOr<U, const F extends (x: T) => Widen<U>>(
        defaultValue: Widen<U>,
        f: F,
    ): Widen<U> {
        if (this.isSome()) {
            return f(this.value);
        }

        return defaultValue;
    }

    /**
     * Computes a default function result (if {@link None `None`}),
     * applies a different function to the contained value (if {@link Some `Some`}).
     */
    mapOrElse<U>(defaultFn: () => U, f: (x: T) => U): U {
        if (this.isSome()) {
            return f(this.value);
        }

        return defaultFn();
    }

    /**
     * Transforms the `Option<T>` into a {@link Result<T, E> `Result<T, E>`},
     * mapping {@link Some `Some(v)`} to {@link Ok `Ok(v)`} and {@link None `None`}
     * to {@link Err `Err(err)`}.
     */
    okOr<E>(err: E): Result<T, E> {
        if (this.isSome()) {
            return Ok(this.value);
        }

        return Err(err);
    }

    /**
     * Transforms the {@link Option<T> `Option<T>`} into a {@link Result<T, E> `Result<T, E>`},
     * mapping {@link Some `Some(v)`} to {@link Ok `Ok(v)`} and {@link None `None`}
     * to {@link Err `Err(err())`}.
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
    iter(): IterableIterator<Option<T>> {
        return [this].values();
    }

    /**
     * Returns {@link None `None`} if the option is {@link None `None`},
     * otherwise returns `optb`.
     *
     * Arguments passed to {@link Option.and `and`} are eagerly evaluated; if
     * you are passing the result of a function call, it is recommended to use
     * {@link Option.andThen `andThen`}, which is lazily evaluated.
     */
    and<U>(optb: Option<U>): Option<U> {
        if (this.isSome()) {
            return optb;
        }

        return None();
    }

    /**
     * Returns {@link None `None`} if the option is {@link None `None`},
     * otherwise calls `f` with the wrapped value and returns the result.
     *
     * Some languages call this operation flatmap.
     */
    andThen<U, F extends (x: T) => Option<U>>(f: F): Option<U> {
        if (this.isSome()) {
            return f(this.value);
        }

        return None();
    }

    /**
     * Returns {@link None `None`} if the option is {@link None `None`},
     * otherwise calls `predicate` with the wrapped value and returns:
     *
     * - {@link Some `Some(t)`} if `predicate` returns `true` (where `t` is the
     * wrapped value), and
     * - {@link None `None`} if `predicate` returns `false`.
     *
     * This function works similar to {@link Array.filter `Array.filter()`}.
     * You can imagine the {@link Option `Option<T>`} being an iterator over one
     * or zero elements. {@link Option.filter `filter()`} lets you decide which
     * elements to keep.
     */
    filter<F extends (x: T) => boolean>(predicate: F): Option<T> {
        if (this.isSome()) {
            if (predicate(this.value)) {
                return this;
            }
        }

        return None();
    }

    /**
     * Returns the option if it contains a value, otherwise returns `optb`.
     *
     * Arguments passed to {@link Option.or `or`} are eagerly evaluated; if you
     * are passing the result of a function call, it is recommended to use
     * {@link Option.orElse `orElse`}, which is lazily evaluated.
     */
    or(optb: Option<T>): Option<T> {
        if (this.isSome()) {
            return this;
        }

        return optb;
    }

    /**
     * Returns the option if it contains a value, otherwise calls `f` and
     * returns the result.
     */
    orElse<F extends () => Option<T>>(f: F): Option<T> {
        if (this.isSome()) {
            return this;
        }

        return f();
    }

    /**
     * Returns {@link Some `Some`} if exactly one of `self`, `optb` is
     * {@link Some `Some`}, otherwise returns {@link None `None`}.
     */
    xor(optb: Option<T>): Option<T> {
        if (this.isSome() && optb.isSome()) {
            return None();
        }

        if (this.isSome()) {
            return this;
        }

        if (optb.isSome()) {
            return optb;
        }

        return None();
    }

    /**
     * Inserts `value` into the option, then returns a reference to it.
     *
     * If the option already contains a value, the old value is dropped.
     *
     * See also {@link Option.getOrInsert `Option.getOrInsert`}, which doesn't
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
     * See also {@link Option.insert `insert`}, which updates the value even if
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
    take(): Option<T> {
        if (this.isSome()) {
            const value = this.value;
            this.value = null as T;
            return Some(value as any) as any;
        }

        return None();
    }

    /**
     * Replaces the actual value in the option by the value given in parameter,
     * returning the old value if present,
     * leaving a {@link Some `Some`} in its place without deinitializing either one.
     */
    replace(newValue: T): Option<T> {
        const oldValue = this.value;
        this.value = newValue;
        if (oldValue === null || typeof oldValue === "undefined") {
            return None();
        }
        return Some(oldValue as any) as any;
    }

    /**
     * Returns `true` if the option is a {@link Some `Some`} value containing
     * the given value.
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
     * If `this` is {@link Some `Some(s)`} and `other` is {@link Some `Some(o)`},
     * this method returns {@link Some `Some([s, o])`}.
     *
     * Otherwise, `None` is returned.
     */
    zip<U>(other: Option<U>): Option<readonly [T, U]> {
        if (this.isSome() && other.isSome()) {
            return Some([this.value, other.value]) as any;
        }

        return None();
    }

    /**
     * Zips `self` and another `Option` with function `f`.
     *
     * If `self` is {@link Some `Some(s)`} and `other` is {@link Some `Some(o)`},
     * this method returns {@link Maybe `Maybe(f(s, o))}`.
     *
     * Otherwise, `None` is returned.
     */
    zipWith<U, F extends (x: T, y: U) => R, R>(
        other: Option<U>,
        f: F,
    ): Option<R> {
        if (this.isSome() && other.isSome()) {
            return Maybe(f(this.value, other.value));
        }

        return None();
    }

    /**
     * Unzips an option containing a tuple of two options.
     *
     * If `self` is `Some([a, b])` this method returns `[Some(a), Some(b)]`.
     * Otherwise, `[None(), None()]` is returned.
     */
    unzip(): Unzip<T> {
        if (this.isSome()) {
            if (Array.isArray(this.value) && this.value.length === 2) {
                return [Some(this.value[0]), Some(this.value[1])] as any;
            }
        }

        return [None(), None()] as any;
    }

    /**
     * Transposes an {@link Option `Option`} of a {@link Result  `Result`} into
     * a {@link Result `Result`} of an {@link Option `Option`}.
     *
     * - {@link None `None`} will be mapped to {@link Ok `Ok`}
     * - {@link Some `Some(Ok(_))`} will be mapped to {@link Ok `Ok(Some(_))`}
     * - {@link Some `Some(Err(_))`} will be mapped to {@link Err `Err(_)`}
     */
    transpose(): Result<
        Option<T extends Result<any, any> ? UnwrappedResult<T> : never>,
        any
    > {
        if (this.isSome()) {
            if (
                typeof this.value === "object" &&
                this.value !== null &&
                "map" in this.value &&
                "isOk" in this.value &&
                "isErr" in this.value
            ) {
                if ((this.value as any).isOk()) {
                    return (this.value as { map: CallableFunction }).map(Some);
                }

                return this.value as any;
            }

            throw new Error("Value is not a Result");
        }

        return Ok(None());
    }

    /* Equality */

    eq(other: Option<T>): boolean {
        return this.value === other.value;
    }

    ne(other: Option<T>): boolean {
        return !this.eq(other);
    }

    /* Ordering */

    lt(other: Option<T>): boolean {
        return this.value < other.value;
    }

    le(other: Option<T>): boolean {
        return this.value <= other.value;
    }

    gt(other: Option<T>): boolean {
        return this.value > other.value;
    }

    ge(other: Option<T>): boolean {
        return this.value >= other.value;
    }

    /**
     * {@link Object.prototype.valueOf `valueOf`} returns the primitive value of
     * the specified object.
     *
     * Used to compare objects with the >, >=, <, and <= operators, but not
     * the ==, ===, !=, and !== operators.
     */
    valueOf(): T {
        return this.value;
    }

    /**
     * {@link Object.prototype.toString `toString`} returns a string representing
     * the specified object.
     */
    toString(): string {
        return String(this.value);
    }
}

/**
 * Creates a new {@link Option `Option`} with no value.
 */
function None<T>(): Option<T> {
    return new Option(null) as Option<T>;
}

/**
 * Some value of type `T`.
 */
function Some<T extends {}>(
    value: T extends readonly [infer A, infer B] ? [Widen<A>, Widen<B>] : T,
): Some<T extends readonly [infer A, infer B] ? [Widen<A>, Widen<B>] : T> {
    if (value === null || typeof value === "undefined") {
        throw new Error(
            "Tried to create Some() with a null or undefined value.",
        );
    }

    return new Option(value) as any;
}

export type SomeValue<T> = T extends null | undefined | Option<null>
    ? never
    : T;

type None = Option<any>;
declare type Some<T> = Option<SomeValue<T>>;

/**
 * Returns {@link Some `Some(value)`} if `value` is not null or undefined,
 * otherwise returns {@link None `None`}.
 */
function Maybe<T>(value: T): Option<T> {
    if (value === null || typeof value === "undefined") {
        return None();
    }
    return Some(value as any) as any;
}

export { Option, Some, Maybe, None };

type Widen<T> = T extends string
    ? string
    : T extends number
    ? number
    : T extends boolean
    ? boolean
    : T extends symbol
    ? symbol
    : T extends bigint
    ? bigint
    : T extends null
    ? null
    : T extends undefined
    ? undefined
    : T & {};

type WidenTuple<T> = {
    [P in keyof T]: Widen<T[P]>;
};

type Unzip<T> = T extends readonly [infer A, infer B]
    ? [Option<A>, Option<B>]
    : [None, None];

