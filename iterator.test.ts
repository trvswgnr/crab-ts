import { expect, test } from "bun:test";
import { StdIterator } from "./iterator";
import { Option } from "./traits/traits";

class Iter<Item> extends StdIterator<Item> {
    index = 0;
    length = 0;
    constructor(public items: Item[]) {
        super();
        this.length = items.length;
    }

    next(): Option<Item> {
        if (this.index < this.items.length) {
            const item = this.items[this.index];
            this.index += 1;
            this.length -= 1;
            return item;
        }
        return null;
    }

    sizeHint(): [number, Option<number>] {
        return [this.length, this.length];
    }
}

type Vec<T> = {
    items: T[];
    iter(): Iter<T>;
};

function Vec<T>(...items: T[]): Vec<T> {
    return {
        items,
        iter() {
            return new Iter(this.items);
        }
    };
}


test("iter", () => {
    const a = Vec(1, 2, 3);
    const iter = a.iter();
    // a call to next() returns the next value...
    expect(iter.next()).toBe(1);
    expect(iter.next()).toBe(2);
    expect(iter.next()).toBe(3);

    // and then `null` once it's over.
    expect(iter.next()).toBe(null);

    // more calls may or may not return `null`. here, they always will.
    expect(iter.next()).toBe(null);
    expect(iter.next()).toBe(null);
});

test("sizeHint", () => {
    const a = Vec(1, 2, 3);
    const iter = a.iter();

    expect(iter.sizeHint()).toEqual([3, 3]);
    const _ = iter.next();
    expect(iter.sizeHint()).toEqual([2, 2]);
});

test("count", () => {
    let a = Vec(1, 2, 3);
    expect(a.iter().count()).toBe(3);

    a = Vec(1, 2, 3, 4, 5);
    const iter = a.iter();
    expect(iter.count()).toBe(5);

    // should consume the iterator
    expect(iter.next()).toBe(null);
});

test("last", () => {
    let a = Vec(1, 2, 3);
    expect(a.iter().last()).toBe(3);

    a = Vec(5);
    const iter = a.iter();
    expect(iter.last()).toBe(5);

    // should consume the iterator
    expect(iter.next()).toBe(null);
});

test("advanceBy", () => {
    const a = Vec(1, 2, 3);
    const iter = a.iter();
    expect(iter.advanceBy(0)).toEqual([void 0, null]);
});

test("nth", () => {
    const a = Vec(1, 2, 3);
    const iter = a.iter();
    expect(iter.nth(1)).toBe(2);

    // calling `nth` multiple times doesn't rewind the iterator
    const b = Vec(1, 2, 3);
    const iter2 = b.iter();
    expect(iter2.nth(1)).toBe(2);
    expect(iter2.nth(1)).toBe(null);

    // returns `null` if there are less than `n + 1` elements
    const c = Vec(1, 2, 3);
    const iter3 = c.iter();
    expect(iter3.nth(10)).toBe(null);
});

test("chain", () => {
    const a1 = Vec(1, 2, 3);
    const a2 = Vec(4, 5, 6);
    const iter = a1.iter().chain(a2.iter());
    expect(iter.next()).toBe(1);
    expect(iter.next()).toBe(2);
    expect(iter.next()).toBe(3);
    expect(iter.next()).toBe(4);
    expect(iter.next()).toBe(5);
    expect(iter.next()).toBe(6);
    expect(iter.next()).toBe(null);
});
