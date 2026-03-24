export function stringifyCsvRow(values: Array<string | number | null | undefined>): string {
  return values
    .map((value) => {
      const normalized = value === null || value === undefined ? '' : String(value);
      if (/[",\n]/.test(normalized)) {
        return `"${normalized.replaceAll('"', '""')}"`;
      }
      return normalized;
    })
    .join(',');
}

export function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  return [stringifyCsvRow(headers), ...rows.map((row) => stringifyCsvRow(row))].join('\n');
}

export function parseCsv(content: string): Array<Record<string, string>> {
  const trimmed = content.replace(/^\uFEFF/, '').trim();
  if (!trimmed) {
    return [];
  }

  const rows: string[][] = [];
  let currentValue = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    const next = trimmed[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      currentRow.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      currentRow.push(currentValue.trim());
      rows.push(currentRow);
      currentRow = [];
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue.trim());
  rows.push(currentRow);

  const [headers = [], ...dataRows] = rows;
  const normalizedHeaders = headers.map((header) => header.trim());
  return dataRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const record: Record<string, string> = {};
      normalizedHeaders.forEach((header, headerIndex) => {
        record[header] = row[headerIndex]?.trim() ?? '';
      });
      return record;
    });
}
