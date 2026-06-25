import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCursorignore } from './parse.ts';
import { diffCursorignore } from './diff.ts';

describe('parseCursorignore', () => {
  it('strips comments and blanks', () => {
    const patterns = parseCursorignore('# header\n\n.env\nnode_modules/\n');
    assert.deepEqual(patterns, ['.env', 'node_modules/']);
  });
});

describe('diffCursorignore', () => {
  it('finds unique patterns on each side', () => {
    const d = diffCursorignore('.env\nnode_modules/', '.env\ndist/');
    assert.equal(d.shared.length, 1);
    assert.equal(d.onlyLeft.length, 1);
    assert.equal(d.onlyRight.length, 1);
    assert.equal(d.onlyLeft[0]?.pattern, 'node_modules/');
    assert.equal(d.onlyRight[0]?.pattern, 'dist/');
  });
});
