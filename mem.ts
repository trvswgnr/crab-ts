/**
 * Swaps the values at two mutable locations, without deinitializing either one.
 */
export function swap<T>(a: T, b: T): void {
    let tmp = a;
    a = b;
    b = tmp;
}

/**
 * Moves src into the referenced dest, returning the previous dest value.
 */
export function replace<T>(src: T, dest: T): T {
    let tmp = dest;
    dest = src;
    return tmp;
}

/**
 * Disposes of a value.
 * 
 * This does so by calling the argument's implementation of [Symbol.dispose] if it exists, or by
 * dropping the argument otherwise.
 */
export function drop<T extends { [key: symbol | string | number]: any }>(value: T | null): void {
    if (typeof value === 'object' && value !== null && value[Symbol.dispose] === "function") {
        value[Symbol.dispose]();
    } else {
        value = null;
    }
}
