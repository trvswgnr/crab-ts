/**
 * Rust's `match` expression implemented in TypeScript.
 */

import { None, Option, Some } from './option';
import { Err, Ok, Result } from './result';
import { UnwrappedOption, UnwrappedResult } from './util';

function notUndefined<T>(value?: T): asserts value is T {
    if (value === undefined) {
        throw new Error('Value is undefined.');
    }
}

function hasOwnProperty<O, P>(obj: O, prop: P): boolean {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(obj, String(prop)) && String(prop) in obj;
}

type SomeCase<T extends Option<any>, U> = {
    Some(value: UnwrappedOption<T>): U;
};

type NoneCase<U> = {
    None(): U;
};

type _OptionCase<T extends Option<any>, U> = {
    _(value: T): U;
};

// if it has both Some and None, then it shouldn't have _
type OptionCases<T extends Option<any>, U> =
    | (SomeCase<T, U> & NoneCase<U>)
    | (SomeCase<T, U> & _OptionCase<T, U>)
    | (NoneCase<U> & _OptionCase<T, U>)
    | _OptionCase<T, U>;

type OkCase<T extends Result<any, any>, U> = {
    Ok(value: UnwrappedResult<T>): U;
};

type ErrCase<T extends Result<any, any>, U> = {
    Err(value: UnwrappedResult<T>): U;
};

type _ResultCase<T extends Result<any, any>, U> = {
    _(value: T): U;
};

// if it has both Ok and Err, then it shouldn't have _
type ResultCases<T extends Result<any, any>, U> =
    | (OkCase<T, U> & ErrCase<T, U>)
    | (OkCase<T, U> & _ResultCase<T, U>)
    | (ErrCase<T, U> & _ResultCase<T, U>)
    | _ResultCase<T, U>;

type OtherCases<T, U> = T extends string
    ? {
          [key: string]: () => U;
      } & {
          _(): U;
      }
    : T extends boolean
    ? {
          true(): U;
          false(): U;
      }
    : T extends number
    ? {
          [key: number]: (val: T) => U;
      } & {
          _(): U;
      }
    : never;

// implementation
function match<T, U>(
    value: T,
    match: T extends Option<any>
        ? OptionCases<T, U>
        : T extends Result<any, any>
        ? ResultCases<T, U>
        : OtherCases<T, U>,
): U {
    if (value instanceof Option) {
        if (value.isSome() && 'Some' in match) {
            return match.Some(value.unwrap());
        }

        if (value.isNone() && 'None' in match) {
            return (match as any).None();
        }

        if ('_' in match) {
            return match._(value as any);
        }

        throw new Error('Non-exhaustive match.');
    }

    if (value instanceof Result) {
        if (value.isOk() && 'Ok' in match) {
            return match.Ok(value.unwrap());
        }

        if (value.isErr() && 'Err' in match) {
            return match.Err(value.unwrapErr());
        }

        if ('_' in match) {
            return match._(value as any);
        }

        throw new Error('Non-exhaustive match.');
    }

    const key = String(value);
    if (hasOwnProperty(match, key)) {
        notUndefined(match);
        return (match as any)[key](value);
    }

    if ('_' in match) {
        return match._(value as any);
    }

    throw new Error('Non-exhaustive match.');
}

// tests
const option = Some(42);
match(option, {
    Some(value: number) {
        console.log('Some', value);
        return 42;
    },
    None() {
        console.log('None');
        return 60;
    },
    _() {
        console.log('default');
        return 42;
    },
});

const result = Ok(42);
match(result, {
    Ok(value) {
        console.log('Ok', value);
        return 42;
    },
    Err(error) {
        console.log('Err', error);
        return 60;
    },
    _(res) {
        console.log('default', res);
        return 42;
    },
});

const other = 'hello';
match(other, {
    pie() {
        console.log('hello');
        return 42;
    },
    world() {
        console.log('world');
        return 60;
    },
    _() {
        console.log('default');
        return 42;
    },
});

const bool = true;
match(bool, {
    true() {
        console.log('true');
        return 42;
    },
    false() {
        console.log('default');
        return 42;
    },
});

const num = 42;
match(num, {
    42: (value) => {
        console.log('42', value);
    },
    _() {
        console.log('default');
    },
});

export { match };
