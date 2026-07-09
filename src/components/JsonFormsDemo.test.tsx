import { afterEach, test, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { JsonFormsDemo } from './JsonFormsDemo';

afterEach(cleanup);

test('exports current data as a YAML file', () => {
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:url');
  const revokeObjectURL = vi.fn();
  const anchorClick = vi.fn();
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = revokeObjectURL;
  const originalAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = anchorClick;

  render(<JsonFormsDemo />);
  fireEvent.click(screen.getByTestId('export-yaml'));

  expect(createObjectURL).toHaveBeenCalledTimes(1);
  const blob = createObjectURL.mock.calls[0][0];
  expect(blob.type).toBe('text/yaml');
  expect(anchorClick).toHaveBeenCalled();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:url');

  HTMLAnchorElement.prototype.click = originalAnchorClick;
});

test('clicking Import YAML opens the file input', () => {
  const { container } = render(<JsonFormsDemo />);
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const clickSpy = vi.spyOn(input, 'click');

  fireEvent.click(screen.getByTestId('import-yaml'));

  expect(clickSpy).toHaveBeenCalledTimes(1);
});
