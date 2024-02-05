import { CrabIterator } from "./traits/iterator";
import { Some } from "./traits/option";

/**
 * Creates a range of numbers.
 * @param start The start of the range (inclusive).
 * @param end The end of the range (exclusive), if not provided the range will be infinite.
 */
export const Range = ((start: number, end?: number) => {
    let exhausted = false;
    let value = start;
    if (end === undefined) {
        const RangeFrom = class extends CrabIterator<number> {
            [Symbol.toStringTag] = "RangeFrom";
            next() {
                return Some(value++);
            }
            contains(v: number) {
                return v >= start;
            }
            start() {
                return start;
            }
        };
        return new RangeFrom();
    }
    const RangeExclusive = class extends CrabIterator<number> {
        [Symbol.toStringTag] = "RangeExclusive";
        next() {
            if (value < end) {
                return Some(value++);
            } else {
                exhausted = true;
                return Some(value);
            }
        }
        contains(v: number) {
            return v >= start && v < end;
        }
        isEmpty() {
            return exhausted || !(start < end);
        }
        start() {
            return start;
        }
        end() {
            return end;
        }
        toInner() {
            return [start, end] as [number, number];
        }
    };
    return new RangeExclusive();
}) as any as RangeConstructor;

export type Range = RangeExclusive<number, number> | RangeFrom<number>;

export interface RangeConstructor {
    <const Start extends number>(start: Start): RangeFrom<Start>;
    <const Start extends number, const End extends number>(start: Start, end: End): RangeExclusive<
        Start,
        End
    >;
}

export interface RangeExclusive<Start extends number, End extends number>
    extends CrabIterator<number> {
    [Symbol.toStringTag]: "RangeExclusive";
    contains(value: number): boolean;
    isEmpty(): boolean;
    start(): Start;
    end(): End;
    toInner(): [Start, End];
}

export interface RangeFrom<Start extends number> extends CrabIterator<number> {
    [Symbol.toStringTag]: "RangeFrom";
    contains(value: number): boolean;
    start(): Start;
}
