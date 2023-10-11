import { Default, Option, staticImplements } from './traits';
import { StdIterator } from './iterator';

type Class = abstract new (...args: any[]) => any;

@staticImplements<Default>
export class Chain<Item, A extends Iterable<Item> = Iterable<Item>, B extends Iterable<Item> = Iterable<Item>> extends StdIterator<Item> {
    constructor(public a: A, public b: B) {
        super();
    }

    static default<Item>() {
        return new Chain<Item>([], []);
    }

    *[Symbol.iterator]() {
        for (const item of this.a) {
            yield item;
        }
        for (const item of this.b) {
            yield item;
        }
        return null;
    }

    next(): Option<Item> {
        return this[Symbol.iterator]().next().value;
    }
}

const a = Chain.default<number>();
console.log(a.next());


function andThenOrClear<T, U>(opt: Option<T>, f: (x: T) => Option<U>): Option<U> {
    let x = f(opt!);
    if (x === null) {
        opt = null;
    }
    return x;
}
