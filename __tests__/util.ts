import { dedent } from '../src/util';

describe('dedent', () => {
    it('removes leading whitespace from each line of the string', () => {
        const s = dedent`
            hello
            world
        `;
        expect(s).toBe('hello\nworld');
    });

    it('removes the same amount of whitespace from each line', () => {
        const s = dedent`
            hello
              world
        `;
        expect(s).toBe('hello\n  world');
    });

    it('concatenates the strings with the substitution values', () => {
        const w = 'world';
        const s = dedent`
            hello
            ${w}
        `;
        expect(s).toBe('hello\nworld');

        const left = 69;
        const right = 420;
        const msg = 'nice';
        const actual = dedent`
            assertion \`left === right\` failed${msg ? `: ${msg}` : ''}:
              left: ${left}
             right: ${right}
        `;
        const expected = 'assertion `left === right` failed: nice:\n  left: 69\n right: 420';
        expect(actual).toBe(expected);
    });
});
