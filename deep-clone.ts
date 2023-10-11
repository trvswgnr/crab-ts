export function deepClone<T>(value: T, map = new WeakMap()): T {
    if (value === null) {
        return value;
    }

    if (typeof value !== 'object' && typeof value !== 'function') {
        return value;
    }

    if (map.has(value)) {
        return map.get(value);
    }

    const clone: T = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
    map.set(value, clone);

    for (const key of Object.keys(value)) {
        clone[key as keyof typeof clone] = deepClone(value[key as keyof typeof value], map);
    }

    return clone;
}