import { DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CsvColumn,
  downloadCsv,
  type ParsedCsv,
  parseCsv,
  toCsv,
} from "@/infra/data/csv";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/export-import")({
  component: ExportImportDemo,
});

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
}

const ROWS: Member[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "Owner",
    status: "active",
  },
  {
    id: 2,
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: 3,
    name: "Alan Turing",
    email: "alan@example.com",
    role: "Engineer",
    status: "invited",
  },
  {
    id: 4,
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Analyst",
    status: "active",
  },
  {
    id: 5,
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    role: "Engineer",
    status: "suspended",
  },
];

// The export column projection: header label + how to read each cell. The same
// shape would be derived from a resource's column defs in a real app.
const EXPORT_COLUMNS: CsvColumn<Member>[] = [
  { header: "ID", accessor: (row) => row.id },
  { header: "Name", accessor: (row) => row.name },
  { header: "Email", accessor: (row) => row.email },
  { header: "Role", accessor: (row) => row.role },
  { header: "Status", accessor: (row) => row.status },
];

/**
 * CSV export + import — "Export CSV" serializes the local rows via `toCsv` and
 * downloads them with `downloadCsv`; the import dialog reads a chosen file, runs
 * it through `parseCsv`, and previews the parsed rows. The demo doesn't persist
 * — a real resource would hand the parsed rows to a bulk-create server fn after
 * validating each one.
 */
function ExportImportDemo() {
  const [importOpen, setImportOpen] = useState(false);

  function handleExport() {
    const csv = toCsv(ROWS, EXPORT_COLUMNS);
    downloadCsv("members.csv", csv);
    toast.success(`Exported ${ROWS.length} rows to members.csv`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          CSV export &amp; import
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Export the table to an RFC 4180 CSV (download), or import a CSV file
          and preview the parsed rows. The helpers (<code>toCsv</code>,{" "}
          <code>downloadCsv</code>, <code>parseCsv</code>) live in{" "}
          <code>@/infra/data/csv</code>. This demo previews only — wire the
          parsed rows to a bulk-create server fn to persist.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <DownloadSimpleIcon data-icon="inline-start" />
          Export CSV
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setImportOpen(true)}
        >
          <UploadSimpleIcon data-icon="inline-start" />
          Import CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {row.id}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.email}
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === "active" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setParsed(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      const result = parseCsv(text);
      setParsed(result);
      setFileName(file.name);
      toast.success(
        `Parsed ${result.rows.length} ${
          result.rows.length === 1 ? "row" : "rows"
        } from ${file.name}`,
      );
    } catch {
      toast.error("Could not read that file.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Choose a CSV file to parse. The first row is treated as headers; the
            parsed rows are previewed below (nothing is saved).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="file"
            aria-label="CSV file to import"
            accept=".csv,text/csv"
            className="block w-full text-xs text-muted-foreground file:mr-3 file:inline-flex file:h-7 file:items-center file:border file:border-border file:bg-background file:px-2.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          {parsed ? (
            parsed.rows.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No data rows found in {fileName}.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">
                  {parsed.rows.length}{" "}
                  {parsed.rows.length === 1 ? "row" : "rows"} preview
                </span>
                <div className="max-h-72 overflow-auto border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsed.headers.map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsed.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {parsed.headers.map((header) => (
                            <TableCell key={header}>{row[header]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              No file selected yet.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" size="sm">
                Close
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
