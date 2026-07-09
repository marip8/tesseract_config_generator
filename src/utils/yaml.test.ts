import { expect, test } from 'vitest';
import { parseYaml, toYaml } from './yaml';

test('yaml round-trips plain objects', () => {
  const data = { name: 'Imported YAML', done: true };
  expect(parseYaml(toYaml(data))).toEqual(data);
});
