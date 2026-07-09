import { parse, stringify } from 'yaml';

// Parse YAML text into plain JS data for the form.
export const parseYaml = (text: string): unknown => parse(text);

// Serialize form data back into YAML text.
export const toYaml = (data: unknown): string =>
  stringify(data ?? {}, { lineWidth: 0 });
