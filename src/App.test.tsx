import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { reportFileName } from './lib/report';

describe('App', () => {
  it('renders the form and the empty state before a destination is chosen', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('LA Commute Analyzer');
    expect(html).toContain('Work destination');
    expect(html).toContain('Departure time');
    expect(html).toContain('Choose a work destination to rank the neighborhoods.');
    expect(html).toContain('<option value="8" selected="">8:00 AM</option>');
  });
});

describe('reportFileName', () => {
  const date = new Date('2026-11-07T12:00:00Z');

  it('uses the date when no name is given', () => {
    expect(reportFileName({ date })).toBe('la-commute-2026-11-07.pdf');
  });

  it('strips characters that are unsafe in file names', () => {
    expect(reportFileName({ name: ' Ana / María: "Test" ', date })).toBe(
      'la-commute-Ana-Maria-Test-2026-11-07.pdf',
    );
  });
});
