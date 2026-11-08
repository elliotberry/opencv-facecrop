import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import facecrop from '../index.js';

const fixture = name => fileURLToPath(new URL(`./${name}`, import.meta.url));
const singleFace = fixture('test-file-1.jpg');
const multipleFaces = fixture('test-file-2.jpg');

let outDir;

before(() => {
  outDir = mkdtempSync(join(tmpdir(), 'opencv-facecrop-'));
});

after(() => {
  rmSync(outDir, {recursive: true, force: true});
});

test('Single face detection', async () => {
  const out = join(outDir, 'out.jpg');
  await facecrop(singleFace, out, 'image/jpeg', 0.95, 1);
  assert.ok(existsSync(out), `expected ${out} to exist`);
});

test('Multiple face detection', async () => {
  await facecrop(multipleFaces, join(outDir, 'output.jpg'), 'image/jpeg', 0.95, 1);
  for (const file of ['output-1.jpg', 'output-2.jpg']) {
    assert.ok(existsSync(join(outDir, file)), `expected ${file} to exist`);
  }
});

// The function currently resolves with undefined; this documents the intended 'Success' result.
test('Return value', {todo: 'facecrop does not return a value yet'}, async () => {
  const out = await facecrop(singleFace, join(outDir, 'out.jpg'), 'image/jpeg', 0.95, 1.1);
  assert.match(out, /Success/);
});

test('Invalid input image parameter', async () => {
  await assert.rejects(
    facecrop(fixture('invalid-file-name.jpg'), join(outDir, 'out.jpg')),
    /Loading input image failed/,
  );
});

test('Invalid training set path', async () => {
  await assert.rejects(
    facecrop(singleFace, join(outDir, 'out.jpg'), 'image/jpeg', 0.95, 1, fixture('no-such-classifier.xml')),
    /Pre-Trained Classifier file failed to load/,
  );
});

test('Factor out of bounds', async () => {
  await assert.rejects(
    facecrop(singleFace, join(outDir, 'output.jpg'), 'image/jpeg', 0.95, -10),
    /Factor passed is too low, should be greater than 0/,
  );
});
