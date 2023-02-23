const U = require('./dist/optional');

console.log(None.constructor.name);
const x = None;
console.log(x);
const y = None;
y.getOrInsert(1);
console.log(x);
