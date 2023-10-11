import { expect, test } from "bun:test";
import { StdIterator } from "./iterator";
import { Option } from "./traits";

class TestIter<Item> extends StdIterator<Item> {
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

class Foo<T> {
    items: T[];
    constructor(...items: T[]) {
        this.items = items;
    }

    iter() {
        return new TestIter(this.items);
    }
}


test("iter", () => {
    const a = new Foo(1, 2, 3);
    let iter = a.iter();
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
    let a = new Foo(1, 2, 3);
    let iter = a.iter();

    expect(iter.sizeHint()).toEqual([3, 3]);
    let _ = iter.next();
    expect(iter.sizeHint()).toEqual([2, 2]);
});

test("count", () => {
    let a = new Foo(1, 2, 3);
    expect(a.iter().count()).toBe(3);

    a = new Foo(1, 2, 3, 4, 5);
    let iter = a.iter();
    expect(iter.count()).toBe(5);

    // should consume the iterator
    expect(iter.next()).toBe(null);
});

test("last", () => {
    let a = new Foo(1, 2, 3);
    expect(a.iter().last()).toBe(3);

    a = new Foo(5);
    let iter = a.iter();
    expect(iter.last()).toBe(5);

    // should consume the iterator
    expect(iter.next()).toBe(null);
});

test("advanceBy", () => {
    let a = new Foo(1, 2, 3);
    let iter = a.iter();
    expect(iter.advanceBy(0)).toEqual([void 0, null]);
});

test("nth", () => {
    let a = new Foo(1, 2, 3);
    let iter = a.iter();
    expect(iter.nth(1)).toBe(2);

    // calling `nth` multiple times doesn't rewind the iterator
    let b = new Foo(1, 2, 3);
    let iter2 = b.iter();
    expect(iter2.nth(1)).toBe(2);
    expect(iter2.nth(1)).toBe(null);

    // returns `null` if there are less than `n + 1` elements
    let c = new Foo(1, 2, 3);
    let iter3 = c.iter();
    expect(iter3.nth(10)).toBe(null);
});

// test("stepBy", () => {
// });