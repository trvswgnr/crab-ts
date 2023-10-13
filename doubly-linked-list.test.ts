import { LinkedList, Node } from "./doubly-linked-list";
import { type Option } from "./traits/traits";
import { expect, test } from "bun:test";

function generateTest(): LinkedList<number> {
    return listFrom([0, 1, 2, 3, 4, 5, 6]);
}

function listFrom<T>(arr: T[]): LinkedList<T> {
    let m = new LinkedList<T>();
    for (let i = 0; i < arr.length; i++) {
        m.pushBack(arr[i]);
    }
    return m;
}

test("basic", () => {
    let m = new LinkedList<number>();
    expect(m.popFront()).toBe(null);
    expect(m.popBack()).toBe(null);
    expect(m.popFront()).toBe(null);
    m.pushFront(1);
    expect(m.popFront()).toBe(1);
    m.pushBack(2);
    m.pushBack(3);
    expect(m.len()).toBe(2);
    expect(m.popFront()).toBe(2);
    expect(m.popFront()).toBe(3);
    expect(m.len()).toBe(0);
    expect(m.popFront()).toBe(null);
    m.pushBack(1);
    m.pushBack(3);
    m.pushBack(5);
    m.pushBack(7);
    expect(m.popFront()).toBe(1);

    let n = new LinkedList<number>();
    n.pushFront(2);
    n.pushFront(3);
    expect(n.front()!).toBe(3);
    let x = n.front()!;
    expect(x).toBe(3);
    expect(n.back()!).toBe(2);
    let y = n.back()!;
    expect(y).toBe(2);
});

test("pushBack", () => {
    let m = new LinkedList<number>();
    m.pushBack(1);
    m.pushBack(2);
    m.pushBack(3);
    expect(m.len()).toBe(3);
    expect(m.popFront()).toBe(1);
    expect(m.popFront()).toBe(2);
    expect(m.popFront()).toBe(3);
    expect(m.len()).toBe(0);

    let n = new LinkedList<number>();
    n.pushBack(1);
    n.pushBack(2);
    n.pushBack(3);
    n.pushBack(4);
    n.pushBack(5);
    expect(n.len()).toBe(5);
    expect(n.popBack()).toBe(5);
    expect(n.popBack()).toBe(4);
    expect(n.popBack()).toBe(3);
    expect(n.popBack()).toBe(2);
    expect(n.popBack()).toBe(1);
});

test("append", () => {
    // empty to empy
    {
        let m = new LinkedList<number>();
        let n = new LinkedList<number>();
        m.append(n);
        checkLinks(m);
        expect(m.len()).toBe(0);
        expect(n.len()).toBe(0);
    }

    // non-empty to empty
    {
        let m = new LinkedList<number>();
        let n = new LinkedList<number>();
        n.pushBack(2);
        expect(n.len()).toBe(1);
        m.append(n);
        checkLinks(m);
        expect(m.len()).toBe(1);
        expect(m.popBack()).toBe(2);
        expect(n.len()).toBe(0);
        checkLinks(m);
    }

    // non-empty to non-empty
    let v = [0, 1, 2, 3, 4, 5, 6];
    let u = [7, 8, 9, 10, 11, 12, 13];
    let m = listFrom(v);
    let n = listFrom(u);
    m.append(n);
    checkLinks(m);
    let sum = v.concat(u);
    expect(sum.length).toBe(m.len());
    for (const elt of sum) {
        expect(m.popFront()).toBe(elt);
    }
    expect(n.len()).toBe(0);
    // Let's make sure it's working properly, since we
    // did some direct changes to private members.
    n.pushBack(3);
    expect(n.len()).toBe(1);
    expect(n.popFront()).toBe(3);
    checkLinks(n);
});

function checkLinks<T>(list: & LinkedList<T>) {
    let len = 0;
    let last: Option<Node<T>> = null;
    let node: Node<T>;

    if (list.head === null) {
        expect(list.tail).toBe(null);
        expect(list.length).toBe(0);
        return;
    } else {
        node = list.head;
    }

    while (true) {
        if (last === null && node.prev === null) { }
        if (last && node.prev) {
            expect(last).toBe(node.prev);
        }
        if (node.next) {
            last = node;
            node = node.next;
            len += 1;
        } else {
            len += 1;
            break;
        }
    }

    // verify that the tail node points to the last node
    expect(list.tail).toBe(node);
    // verify that the length is correct
    expect(list.len()).toBe(len);
}

test("iterator", () => {
    let m = generateTest();
    for (const [i, elt] of m.iter().enumerate()) {
        expect(i).toBe(elt);
    }
    let n = new LinkedList<number>();
    expect(n.iter().next()).toBe(null);
    n.pushFront(4);
    let it = n.iter();
    expect(it.sizeHint()).toEqual([1, 1]);
    expect(it.next()).toBe(4);
    expect(it.sizeHint()).toEqual([0, 0]);
    expect(it.next()).toBe(null);
});

test("iterator clone", () => {
    let n = new LinkedList<number>();
    n.pushBack(2);
    n.pushBack(3);
    n.pushBack(4);
    let it = n.iter();
    it.next();
    let jt = it.clone();
    expect(it).not.toBe(jt);
    expect(it.head).not.toBe(jt.head);
    expect(it.next()).toBe(jt.next());
    expect(it.nextBack()).toBe(jt.nextBack());
    expect(it.next()).toBe(jt.next());

    let m = new LinkedList<{ value: number }>();
    m.pushBack({ value: 2 });
    m.pushBack({ value: 3 });
    m.pushBack({ value: 4 });
    let it2 = m.iter();
    it2.next();
    let jt2 = it2.clone();
    expect(it2).not.toBe(jt2);
    expect(it2.head).not.toBe(jt2.head);
    expect(it2.head).toEqual(jt2.head);
    expect(it2.next()).not.toBe(jt2.next());
    expect(it2.next()).toEqual(jt2.next());

    class Foo {
        constructor(public value: number) { }
        double() {
            this.value *= 2;
        }
        getValue() {
            return this.value;
        }
    }
    let o = new LinkedList<Foo>();
    o.pushBack(new Foo(2));
    o.pushBack(new Foo(3));
    o.pushBack(new Foo(4));
    let it3 = o.iter();
    it3.next();
    let jt3 = it3.clone();
    expect(it3).not.toBe(jt3);
    expect(it3.head).not.toBe(jt3.head);
    expect(it3.head).toEqual(jt3.head);
    expect(it3.next()).not.toBe(jt3.next());
    let itNext = it3.next();
    let jtNext = jt3.next();
    expect(itNext).toEqual(jtNext);
    expect(itNext).not.toBe(jtNext);
    expect(itNext?.getValue()).toBe(jtNext?.getValue());
    itNext?.double();
    expect(itNext?.getValue()).toBe(8);
    expect(jtNext?.getValue()).toBe(4);
});

test("iterator double end", () => {
    let n = new LinkedList<number>();
    expect(n.iter().next()).toBe(null);
    n.pushFront(4);
    n.pushFront(5);
    n.pushFront(6);
    let it = n.iter();
    expect(it.sizeHint()).toEqual([3, 3]);
    expect(it.next()).toBe(6);
    expect(it.sizeHint()).toEqual([2, 2]);
    expect(it.nextBack()).toBe(4);
    expect(it.sizeHint()).toEqual([1, 1]);
    expect(it.nextBack()).toBe(5);
    expect(it.nextBack()).toBe(null);
    expect(it.next()).toBe(null);
});

// test("rev iter", () => {
//     let m = generateTest();
//     for (const [i, elt] of m.iter().rev().enumerate()) {
//         expect(
//     }
// });
