import facecrop from '../index';
import fs from 'fs/promises';
import assert from 'node:assert';
import test from 'node:test';

test('Single face detection', async () => {
  await facecrop('./test/test-file-1.jpg', './test/out.jpg', "image/jpeg", 0.95, 1, './resources/haarcascade_frontalface_default.xml');
  assert.strictEqual(await isExists1("./test/out.jpg"), true);
});

test('Multiple face detection', async () => {
  await facecrop('./test/test-file-2.jpg', './test/output.jpg', "image/jpeg", 0.95, 1, './resources/haarcascade_frontalface_default.xml');
  assert.strictEqual(await isExists2("./test/output-1.jpg", "./test/output-2.jpg"), true);
});

test('Return value', async () => {
  let out = await facecrop('./test/test-file-1.jpg', './test/out.jpg', "image/jpeg", 0.95, 1.1, './resources/haarcascade_frontalface_default.xml');
  assert.match(out, /Success/);
});

test('Invalid input image parameter', async () => {
  let out = await facecrop('./invalid-file-name');
  assert.match(out, /Error: Loading input image failed/);
});

test('Invalid training set path', async () => {
  let out = await facecrop('./test/test-file-1.jpg', './test/out.jpg', "image/jpeg", 0.95);
  assert.match(out, /Pre-Trained Classifier file failed to load./);
});

test('Factor out of bounds', async () => {
  let out = await facecrop('./test/test-file-1.jpg', './test/output.jpg', "image/jpeg", 0.95, -10, './resources/haarcascade_frontalface_default.xml');
  assert.match(out, /Factor passed is too low, should be greater than 0./);
});

async function isExists1(filename) {
  try {
    await fs.stat(filename);
    return true;
  } catch {
    return false;
  }
}

async function isExists2(file1, file2) {
  try {
    await fs.stat(file1);
    await fs.stat(file2);
    return true;
  } catch {
    return false;
  }
}