import { Option } from './option';
import { Result } from './result';

export function assertIs<T>(x: any, expression?: boolean, ...rest: any[]): asserts x is T {
    if (expression === undefined) {
        expression = x !== null && x !== undefined;
    }
    if (!expression) {
        if (rest.length > 0) {
            console.error(...rest);
        }
        throw new Error('Type assertion failed.');
    }
}

// simple typescript impl of rust's assert_eq! macro
export function assertEq<T>(left: T, right: T, msg?: string): void {
    if (JSON.stringify(left) !== JSON.stringify(right)) {
        throw new Error(dedent`
            assertion \`left === right\` failed${msg ? `: ${msg}` : ''}:
              left: ${String(left)}
             right: ${String(right)}
        `);
    }
}

/**
transforms a string so that it doesn't include
the leading whitespace.
Example:
```ts
    const s = stringDedent`
        hello
        world
    `;
    // s === 'hello\nworld\n'
```
*/
export function dedent(strings: TemplateStringsArray, ...values: any[]) {
    // merge the strings with the substitution values
    const fullString = strings.reduce(
        (result, string, i) => result + string + (values[i] || ''),
        '',
    );

    // split the string into lines
    const lines = fullString.split('\n');

    // find the smallest indentation level, ignoring lines that are empty or contain only whitespace
    const minIndent = lines.reduce((min, line) => {
        const match = line.match(/^( *)\S/);
        return match ? Math.min(min, match[1].length) : min;
    }, Infinity);

    // Remove the indentation
    return lines
        .map((line) => line.slice(minIndent))
        .join('\n')
        .trim();
}

/**
 * Enum of JavaScript error types.
 */
export enum ErrorKind {
    Error = 'Error',
    AggregateError = 'AggregateError',
    EvalError = 'EvalError',
    RangeError = 'RangeError',
    ReferenceError = 'ReferenceError',
    SyntaxError = 'SyntaxError',
    TypeError = 'TypeError',
    URIError = 'URIError',
    InternalError = 'InternalError',

    UnimplementedError = 'UnimplementedError',
}

export class UnimplementedError extends Error {
    constructor(...params: any[]) {
        if (params[0] === undefined) {
            params[0] = 'not implemented';
        }
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnimplementedError);
        }

        this.name = 'UnimplementedError';
    }
}

export type UnwrappedResult<T> = T extends Result<infer U, any> ? U : never;
export type UnwrappedOption<T> = T extends Option<infer U> ? U : never;
