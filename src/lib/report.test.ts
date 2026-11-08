import { describe, expect, it, vi } from 'vitest';
import { NEIGHBORHOODS } from '../data/neighborhoods';
import { rankNeighborhoods } from './commute';
import { downloadReport } from './report';

const captured = vi.hoisted(() => ({ texts: [] as string[], saved: [] as string[] }));

vi.mock('jspdf', async (importOriginal) => {
  const real = await importOriginal<typeof import('jspdf')>();
  class RecordingPdf extends real.jsPDF {
    constructor(...args: ConstructorParameters<typeof real.jsPDF>) {
      super(...args);
      const text = this.text.bind(this);
      this.text = ((value: string | string[], ...rest: unknown[]) => {
        captured.texts.push(String(value));
        return (text as (...a: unknown[]) => unknown)(value, ...rest);
      }) as typeof this.text;
      this.save = ((name: string) => {
        captured.saved.push(name);
        return this;
      }) as typeof this.save;
    }
  }
  return { ...real, jsPDF: RecordingPdf };
});

describe('downloadReport', () => {
  it('builds a PDF with every neighborhood and saves it under a safe name', async () => {
    const destination = { name: 'Downtown', lat: 34.05, lon: -118.25 };
    await downloadReport({
      destination: destination.name,
      hour: 17,
      day: 'weekday',
      ranked: rankNeighborhoods(NEIGHBORHOODS, destination, 17, 'weekday'),
      name: 'Test User',
      date: new Date('2026-11-07T12:00:00Z'),
    });

    expect(captured.saved).toEqual(['la-commute-Test-User-2026-11-07.pdf']);
    expect(captured.texts).toContain('Destination: Downtown');
    expect(captured.texts).toContain('Leaving at 5:00 PM on a weekday');
    for (const area of NEIGHBORHOODS) expect(captured.texts).toContain(area.name);
  });
});
