import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { FileWorkspace } from './FileWorkspace';
import { createFile } from '../storage/fileStore';

beforeEach(() => localStorage.clear());

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

test('starts with an empty file list', () => {
  render(<FileWorkspace />);
  const list = screen.getByTestId('file-list');
  expect(
    within(list).getByText('No files yet. Create or import one.')
  ).toBeTruthy();
  expect(
    screen.getByText('Select a file to start editing, or create a new one.')
  ).toBeTruthy();
});

test('renders the selected file in the form tab', () => {
  createFile('task.yaml', { name: 'Sample task' });
  render(<FileWorkspace />);
  act(() => fireEvent.click(screen.getByTestId('tab-rendered-form')));
  expect(screen.getByDisplayValue('Sample task')).toBeTruthy();
});

test('creating a new file adds it and selects it', () => {
  vi.spyOn(window, 'prompt').mockReturnValue('my_new_case.yaml');
  render(<FileWorkspace />);
  act(() => fireEvent.click(screen.getByTestId('new-file')));
  const list = screen.getByTestId('file-list');
  expect(within(list).getByText('my_new_case.yaml')).toBeTruthy();
});
