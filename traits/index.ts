/**!
 * @module traits
 *
 * @description Provides a simple way to compose classes using traits.
 */

export const Traits = _Traits as unknown as (new <T>(...args: any[]) => T) & typeof _Traits;

export function dependency<T extends AbstractClass>(baseClass: T): Traitable<T>;
export function dependency<T extends AbstractClass>(baseClass: T) {
    return new Traitable(baseClass);
}

export function TraitImpl<T>(f: (...args: any[]) => new (...args: any[]) => T): T {
    return f as unknown as T;
}

type AbstractClass = abstract new (...args: any) => any;
type Mixed<Base, Mixin> = Base & Mixin & { new(...args: any[]): Base & Mixin };

class Traitable<T extends AbstractClass> {
    private Base: T;
    constructor(Base: T) {
        this.Base = Base;
    }

    withTraits(): Mixed<T, unknown>;
    withTraits<M1>(m1: M1): Mixed<T, M1>;
    withTraits<M1, M2>(m1: M1, m2: M2): Mixed<T, M1 & M2>;
    withTraits<M1, M2, M3>(m1: M1, m2: M2, m3: M3): Mixed<T, M1 & M2 & M3>;
    withTraits<M1, M2, M3, M4>(m1: M1, m2: M2, m3: M3, m4: M4): Mixed<T, M1 & M2 & M3 & M4>;
    withTraits<M1, M2, M3, M4, M5>(m1: M1, m2: M2, m3: M3, m4: M4, m5: M5): Mixed<T, M1 & M2 & M3 & M4 & M5>;
    withTraits(...args: any[]) {
        return args.reduce((c, m) => m(c), this.Base);
    }
}

function _Traits(): Mixed<unknown, unknown>;
function _Traits<M1>(m1: M1): Mixed<unknown, M1>;
function _Traits<M1, M2>(m1: M1, m2: M2): Mixed<unknown, M1 & M2>;
function _Traits<M1, M2, M3>(m1: M1, m2: M2, m3: M3): Mixed<unknown, M1 & M2 & M3>;
function _Traits<M1, M2, M3, M4>(m1: M1, m2: M2, m3: M3, m4: M4): Mixed<unknown, M1 & M2 & M3 & M4>;
function _Traits<M1, M2, M3, M4, M5>(m1: M1, m2: M2, m3: M3, m4: M4, m5: M5): Mixed<unknown, M1 & M2 & M3 & M4 & M5>;
function _Traits(...args: any[]) {
    return args.reduce((c, m) => m(c));
}
