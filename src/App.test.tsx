import App from './App';
import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Smoke test for the App component.
 */
test('renders the file workspace', () => {
  render(<App />);
  expect(screen.getByTestId('file-list')).toBeTruthy();
});
