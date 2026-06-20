/**
 * CSV export / import helpers — framework-agnostic, dependency-free, and
 * RFC 4180 compliant. `toCsv`/`parseCsv` are pure (safe on the server); only
 * `downloadCsv` touches the DOM and is guarded for browser-only use.
 *
 * These power the export/import gallery shape (`add-export-import`) and can back
 * a real resource: feed `toCsv(rows, columns)` from a `Repository` list, or hand
 * `parseCsv(text).rows` to a bulk-create server fn after validating each row.
 */

/** A column projection for {@link toCsv}: a header label + how to read the cell. */
export interface CsvColumn<T> {
  /** Header text written to the first CSV line. */
  header: string;
  /** Pull the cell value for a row; coerced to a string (nullish -> ""). */
  accessor: (row: T) => unknown;
}

/** The result of {@link parseCsv}: the header row plus the data rows below it. */
export interface ParsedCsv {
  headers: string[];
  /** One record per data row, keyed by header. Short rows pad to "". */
  rows: Record<string, string>[];
}

/**
 * Quote a single field per RFC 4180: wrap in double quotes when the value
 * contains a comma, quote, CR, or LF, and escape embedded quotes by doubling.
 */
function escapeField(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

/**
 * Serialize `rows` to an RFC 4180 CSV string using the given column projection.
 * The header line comes from `columns[].header`; rows are CRLF-delimited.
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines: string[] = [];
  lines.push(columns.map((column) => escapeField(column.header)).join(","));
  for (const row of rows) {
    lines.push(
      columns.map((column) => escapeField(column.accessor(row))).join(","),
    );
  }
  return lines.join("\r\n");
}

/**
 * Trigger a browser download of `csv` as `filename`. No-op outside the browser
 * (guards `document`), so it is safe to import into isomorphic modules.
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Parse an RFC 4180 CSV string into `{ headers, rows }`. Handles quoted fields,
 * escaped quotes (`""`), and CR/LF/CRLF inside quotes. The first non-empty line
 * is the header; each data row is keyed by header (short rows pad to "").
 */
export function parseCsv(text: string): ParsedCsv {
  const records = parseRecords(text);
  if (records.length === 0) return { headers: [], rows: [] };

  const [headers, ...dataRecords] = records;
  const rows = dataRecords.map((record) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = record[index] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

/** Tokenize a CSV document into an array of records (each an array of fields). */
function parseRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;
  let started = false;

  const pushField = () => {
    record.push(field);
    field = "";
  };
  const pushRecord = () => {
    pushField();
    records.push(record);
    record = [];
    started = false;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    started = true;

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\r") {
      if (text[i + 1] === "\n") i++;
      pushRecord();
    } else if (char === "\n") {
      pushRecord();
    } else {
      field += char;
    }
  }

  // Flush a trailing record unless the input ended on a clean newline.
  if (started || field !== "" || record.length > 0) {
    pushRecord();
  }

  return records.filter((rec) => !(rec.length === 1 && rec[0] === ""));
}
