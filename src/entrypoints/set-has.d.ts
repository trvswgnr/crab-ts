/// <reference path="utils.d.ts" />

interface Set<T> {
  has(value: T | (TSReset.WidenLiteral<T> & {})): boolean;
}
