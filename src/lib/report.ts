import type { RankedArea } from './commute';
import { formatHour } from './time';
import type { DayType, Hour } from './types';

export type ReportInput = {
  destination: string;
  hour: Hour;
  day: DayType;
  ranked: RankedArea[];
  name?: string;
  date?: Date;
};

/** File name safe on every OS: letters, digits and dashes only. */
export function reportFileName({ name, date = new Date() }: Pick<ReportInput, 'name' | 'date'>) {
  const isoDate = date.toISOString().slice(0, 10);
  const slug = (name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `la-commute-${slug ? `${slug}-` : ''}${isoDate}.pdf`;
}

/** Builds and downloads the PDF. jsPDF is loaded on demand to keep it out of the first load. */
export async function downloadReport(input: ReportInput): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { destination, hour, day, ranked, name } = input;
  const date = input.date ?? new Date();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const left = 48;
  let y = 56;

  const line = (text: string, size = 11, bold = false, x = left) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(text, x, y);
  };

  doc.setTextColor(29, 78, 216);
  line('LA Commute Analysis', 20, true);
  doc.setTextColor(31, 41, 51);
  y += 28;
  for (const part of doc.splitTextToSize(`Destination: ${destination}`, 490) as string[]) {
    line(part);
    y += 16;
  }
  line(`Leaving at ${formatHour(hour)} on a ${day}`);
  y += 16;
  line(`Generated ${date.toISOString().slice(0, 10)}${name ? ` for ${name}` : ''}`);
  y += 32;

  const columns = [left, left + 170, left + 240, left + 300, left + 380, left + 440];
  const headers = ['Neighborhood', 'Minutes', 'Miles', 'Gas/month', 'Rent', 'Safety'];
  headers.forEach((header, i) => line(header, 10, true, columns[i]));
  y += 8;
  doc.setDrawColor(213, 218, 225);
  doc.line(left, y, left + 490, y);
  y += 16;

  for (const row of ranked) {
    const cells = [
      row.area.name,
      String(row.minutes),
      String(row.miles),
      `$${row.cost.monthly.toFixed(2)}`,
      row.area.rent,
      row.area.safety,
    ];
    cells.forEach((cell, i) => line(cell, 10, false, columns[i]));
    y += 18;
  }

  y += 16;
  doc.setTextColor(82, 96, 109);
  line(
    'Estimates use straight-line distance and typical traffic by hour, not live traffic.',
    9,
  );
  doc.save(reportFileName({ name, date }));
}
