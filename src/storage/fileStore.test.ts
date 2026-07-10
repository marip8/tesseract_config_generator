import { afterEach, expect, test } from 'vitest';
import {
  createFile,
  deleteFile,
  getFile,
  listFiles,
  saveFile,
} from './fileStore';
import { parseYaml, toYaml } from '../utils/yaml';

afterEach(() => localStorage.clear());

test('create/list/get/save/delete keep files isolated', () => {
  const a = createFile('a.yaml', { x: 1 });
  const b = createFile('b.yaml', { y: 2 });

  expect(listFiles().map((f) => f.name)).toEqual(['a.yaml', 'b.yaml']);

  // editing one file does not affect the other
  saveFile({ ...a, data: { x: 99 } });
  expect(getFile(a.id)?.data).toEqual({ x: 99 });
  expect(getFile(b.id)?.data).toEqual({ y: 2 });

  deleteFile(a.id);
  expect(listFiles().map((f) => f.name)).toEqual(['b.yaml']);
});

test('yaml round-trips through parse/stringify', () => {
  const data = parseYaml(toYaml({ dataset: { foo: { expect_stop: true } } }));
  expect(data).toEqual({ dataset: { foo: { expect_stop: true } } });
});
