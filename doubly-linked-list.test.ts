import { LinkedList, Node, type Option } from "./doubly-linked-list";
import { expect, test } from "bun:test";

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

test.skip("append", () => {
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
        // checkLinks(m);
        expect(m.len()).toBe(1);
        expect(m.popBack()).toBe(2);
        expect(n.len()).toBe(0);
        // checkLinks(m);
    }
});

function checkLinks<T>(list: &LinkedList<T>) {
    let len = 0;
    let last: Option<Node<T>> = null;
    let node: Node<T>;
    
    if (list.head === null) {
        expect(list.tail).toBe(null);
        expect(list._len).toBe(0);
        return;
    } else {
        node = list.head;
    }

    while (true) {
        if (last === null && node.prev === null) {}
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
    expect(list._len).toBe(len);
}

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