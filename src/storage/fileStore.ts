// localStorage-backed store for editor files.
//
// Each file is persisted under its own key (`jsonforms-file:<id>`) so that
// editing *different* files - even in different browser tabs - never clobbers
// another file's data. A `storage` event fires in other tabs on every write,
// which the UI listens to in order to keep its file list in sync.

export interface EditorFile {
  id: string;
  name: string;
  data: unknown;
  updatedAt: number;
}

const KEY_PREFIX = 'jsonforms-file:';

const keyFor = (id: string) => `${KEY_PREFIX}${id}`;

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const isEditorFile = (value: unknown): value is EditorFile =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as EditorFile).id === 'string' &&
  typeof (value as EditorFile).name === 'string';

export const listFiles = (): EditorFile[] => {
  const files: EditorFile[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX)) {
      continue;
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? 'null');
      if (isEditorFile(parsed)) {
        files.push(parsed);
      }
    } catch {
      // ignore malformed entries
    }
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
};

export const getFile = (id: string): EditorFile | undefined => {
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(id)) ?? 'null');
    return isEditorFile(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const saveFile = (file: EditorFile): EditorFile => {
  const next = { ...file, updatedAt: Date.now() };
  localStorage.setItem(keyFor(next.id), JSON.stringify(next));
  return next;
};

export const createFile = (name: string, data: unknown): EditorFile =>
  saveFile({ id: newId(), name, data, updatedAt: Date.now() });

export const deleteFile = (id: string): void => {
  localStorage.removeItem(keyFor(id));
};

export const isFileKey = (key: string | null): boolean =>
  !!key && key.startsWith(KEY_PREFIX);
