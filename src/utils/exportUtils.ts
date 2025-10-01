import type { DutyStation } from '../types';

// Utility to convert an array of objects to CSV string
function convertToCSV(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number) => {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  };

  const headerLine = headers.join(',');
  const dataLines = rows.map(row => headers.map(h => escapeCell(row[h] ?? '')).join(','));
  return [headerLine, ...dataLines].join('\n');
}

export function exportDutyStationsToCSV(
  stations: DutyStation[],
  fileBaseName: string = 'duty-stations'
): void {
  const rows = stations.map(s => ({
    DS: s.DS,
    CTY: s.CTY,
    NAME: s.NAME,
    COUNTRY: s.COUNTRY ?? '',
    LATITUDE: s.LATITUDE,
    LONGITUDE: s.LONGITUDE,
    COMMONNAME: s.COMMONNAME,
    OBSOLETE: s.OBSOLETE,
  }));

  const csv = convertToCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${fileBaseName}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Simple Excel-compatible export by generating an HTML table and saving with .xls extension.
// This opens cleanly in Excel without additional dependencies.
export function exportDutyStationsToExcel(
  stations: DutyStation[],
  fileBaseName: string = 'duty-stations'
): void {
  const headers = ['DS','CTY','NAME','COUNTRY','LATITUDE','LONGITUDE','COMMONNAME','OBSOLETE'];
  const escapeHtml = (text: string) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const rowsHtml = stations.map(s => (
    `<tr>` +
      `<td>${escapeHtml(s.DS)}</td>` +
      `<td>${escapeHtml(s.CTY)}</td>` +
      `<td>${escapeHtml(s.NAME)}</td>` +
      `<td>${escapeHtml(s.COUNTRY ?? '')}</td>` +
      `<td>${s.LATITUDE}</td>` +
      `<td>${s.LONGITUDE}</td>` +
      `<td>${escapeHtml(s.COMMONNAME ?? '')}</td>` +
      `<td>${escapeHtml(s.OBSOLETE)}</td>` +
    `</tr>`
  )).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
    <table border="1">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileBaseName}-${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}



