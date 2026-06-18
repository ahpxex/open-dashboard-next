/**
 * Resource generator — the heart of the "middle platform".
 *
 *   bun run create-resource <name>
 *
 * Scaffolds a full CRUD resource modelled on `features/products`:
 *   - src/features/<name>/{schema,server,queries,columns,config}.ts(x)
 *   - src/routes/_app/<name>.tsx
 *   - a Drizzle table appended to src/db/schema.ts
 *   - a sidebar entry in src/lib/sidebar-items.ts
 *
 * After running: `bun run db:generate && bun run db:migrate`, then customise
 * the fields in schema.ts / the feature folder to fit your domain.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function cap(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const raw = process.argv[2];
if (!raw) {
  fail("Usage: bun run create-resource <name>   (plural, e.g. orders)");
}

const name = raw.toLowerCase();
if (!/^[a-z][a-z0-9]*$/.test(name)) {
  fail("Name must be lowercase letters/numbers and plural, e.g. 'orders'.");
}

const singular = name.endsWith("s") ? name.slice(0, -1) : name;
const Type = cap(singular); // e.g. Order
const TitlePlural = cap(name); // e.g. Orders

const featureDir = join(ROOT, "src", "features", name);
const routeFile = join(ROOT, "src", "routes", "_app", `${name}.tsx`);
const schemaFile = join(ROOT, "src", "db", "schema.ts");
const sidebarFile = join(ROOT, "src", "lib", "sidebar-items.ts");

if (existsSync(featureDir)) fail(`src/features/${name} already exists.`);
if (existsSync(routeFile)) fail(`src/routes/_app/${name}.tsx already exists.`);

function render(template: string): string {
  return template
    .replaceAll("__NAME__", name)
    .replaceAll("__TYPE__", Type)
    .replaceAll("__TITLE__", TitlePlural);
}

/* ----------------------------------- templates ---------------------------- */

const schemaTs = `import { z } from "zod";

export const __NAME__Statuses = ["active", "archived"] as const;
export type __TYPE__Status = (typeof __NAME__Statuses)[number];

export const __NAME__InputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(__NAME__Statuses),
  description: z.string().optional().default(""),
});
export type __TYPE__Input = z.infer<typeof __NAME__InputSchema>;

/** Client-side form validator (input types match the TanStack Form values). */
export const __NAME__FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(__NAME__Statuses),
  description: z.string(),
});

export const __NAME__UpdateSchema = __NAME__InputSchema.extend({
  id: z.string().min(1),
});
export type __TYPE__Update = z.infer<typeof __NAME__UpdateSchema>;

export const __NAME__ListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
});
export type __TYPE__ListParams = z.infer<typeof __NAME__ListParamsSchema>;
`;

const serverTs = `import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { __NAME__ } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import {
  type __TYPE__ListParams,
  __NAME__InputSchema,
  __NAME__ListParamsSchema,
  __NAME__UpdateSchema,
} from "./schema";

const sortableColumns = {
  name: __NAME__.name,
  status: __NAME__.status,
  createdAt: __NAME__.createdAt,
} as const;

export const list__TITLE__ = createServerFn({ method: "GET" })
  .validator((data: __TYPE__ListParams) => __NAME__ListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();

    const conditions: SQL[] = [];
    if (data.search) {
      const term = \`%\${data.search}%\`;
      conditions.push(ilike(__NAME__.name, term));
    }
    if (data.status) conditions.push(eq(__NAME__.status, data.status));
    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn =
      sortableColumns[data.sortBy as keyof typeof sortableColumns] ??
      __NAME__.createdAt;
    const orderBy = data.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (data.page - 1) * data.pageSize;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(__NAME__)
        .where(where)
        .orderBy(orderBy)
        .limit(data.pageSize)
        .offset(offset),
      db.select({ value: count() }).from(__NAME__).where(where),
    ]);

    return { rows, total: totalResult[0]?.value ?? 0 };
  });

export const create__TITLE__ = createServerFn({ method: "POST" })
  .validator((data: unknown) => __NAME__InputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const [row] = await db.insert(__NAME__).values(data).returning();
    return row;
  });

export const update__TITLE__ = createServerFn({ method: "POST" })
  .validator((data: unknown) => __NAME__UpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    const [row] = await db
      .update(__NAME__)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(__NAME__.id, id))
      .returning();
    return row;
  });

export const delete__TITLE__ = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await db.delete(__NAME__).where(eq(__NAME__.id, id));
    return { id };
  });
`;

const queriesTs = `import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import type { __TYPE__Input, __TYPE__ListParams, __TYPE__Update } from "./schema";
import {
  create__TITLE__,
  delete__TITLE__,
  list__TITLE__,
  update__TITLE__,
} from "./server";

export const __NAME__Keys = {
  all: ["__NAME__"] as const,
  lists: () => [...__NAME__Keys.all, "list"] as const,
  list: (params: __TYPE__ListParams) =>
    [...__NAME__Keys.lists(), params] as const,
};

export function __NAME__ListQuery(params: __TYPE__ListParams) {
  return queryOptions({
    queryKey: __NAME__Keys.list(params),
    queryFn: () => list__TITLE__({ data: params }),
  });
}

export function useCreate__TYPE__() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: __TYPE__Input) => create__TITLE__({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: __NAME__Keys.all });
      toastSuccess("__TYPE__ created");
    },
    onError: (err) => toastError(err, "Failed to create __NAME__"),
  });
}

export function useUpdate__TYPE__() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: __TYPE__Update) => update__TITLE__({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: __NAME__Keys.all });
      toastSuccess("__TYPE__ updated");
    },
    onError: (err) => toastError(err, "Failed to update __NAME__"),
  });
}

export function useDelete__TYPE__() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delete__TITLE__({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: __NAME__Keys.all });
      toastSuccess("__TYPE__ deleted");
    },
    onError: (err) => toastError(err, "Failed to delete __NAME__"),
  });
}
`;

const columnsTsx = `import type { ColumnDef } from "@tanstack/react-table";
import type { __TYPE__ } from "@/db/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { __TYPE__Status } from "./schema";

const statusColorMap: Record<__TYPE__Status, ChipColor> = {
  active: "success",
  archived: "default",
};

export interface __TYPE__TableContext {
  onEdit: (row: __TYPE__) => void;
  onDelete: (row: __TYPE__) => void;
}

export function create__TITLE__Columns(
  context: __TYPE__TableContext,
): ColumnDef<__TYPE__>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as __TYPE__Status}
          colorMap={statusColorMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(row)}
              onDelete={() => context.onDelete(row)}
            />
          </div>
        );
      },
    },
  ];
}
`;

const configTs = `import type { FilterConfig } from "@/infra/table";

export const __NAME__Filters: FilterConfig[] = [
  {
    key: "status",
    label: "Filter by status",
    placeholder: "All statuses",
    options: [
      { key: "", label: "All statuses" },
      { key: "active", label: "Active" },
      { key: "archived", label: "Archived" },
    ],
  },
];

export const __NAME__TableConfig = {
  searchPlaceholder: "Search __NAME__…",
  pageSizeOptions: [10, 20, 50],
  defaultPageSize: 10,
  emptyMessage: "No __NAME__ found.",
};
`;

const routeTsx = `import { PlusIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { __TYPE__ } from "@/db/schema";
import { create__TITLE__Columns } from "@/features/__NAME__/columns";
import { __NAME__Filters, __NAME__TableConfig } from "@/features/__NAME__/config";
import {
  __NAME__ListQuery,
  useCreate__TYPE__,
  useDelete__TYPE__,
  useUpdate__TYPE__,
} from "@/features/__NAME__/queries";
import {
  type __TYPE__Input,
  __NAME__FormSchema,
  __NAME__InputSchema,
  __NAME__ListParamsSchema,
  __NAME__Statuses,
} from "@/features/__NAME__/schema";
import { DataTable, useTableSearch } from "@/infra/table";
import { errorMessage } from "@/lib/toast";

export const Route = createFileRoute("/_app/__NAME__")({
  validateSearch: __NAME__ListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(__NAME__ListQuery(deps)),
  component: __TITLE__Page,
});

type DialogState = { mode: "create" | "edit"; row?: __TYPE__ } | null;

function __TITLE__Page() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...__NAME__ListQuery(search),
    placeholderData: keepPreviousData,
  });
  const remove = useDelete__TYPE__();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      create__TITLE__Columns({
        onEdit: (row) => setDialog({ mode: "edit", row }),
        onDelete: async (row) => {
          const ok = await confirm({
            title: \`Delete "\${row.name}"?\`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) remove.mutate(row.id);
        },
      }),
    [remove, confirm],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">__TITLE__</h1>
        <p className="text-sm text-muted-foreground">
          Generated resource — customise the schema and columns to fit.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={__NAME__TableConfig.searchPlaceholder}
        filters={__NAME__Filters}
        filterValues={{ status: search.status }}
        onFilterChange={table.setFilter}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={__NAME__TableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={__NAME__TableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add __NAME__
          </Button>
        }
      />

      <__TYPE__FormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        row={dialog?.row}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}

const EMPTY_FORM: __TYPE__Input = {
  name: "",
  status: "active",
  description: "",
};

const statusOptions = __NAME__Statuses.map((value) => ({ value, label: value }));

function toForm(row?: __TYPE__): __TYPE__Input {
  if (!row) return { ...EMPTY_FORM };
  return {
    name: row.name,
    status: row.status as __TYPE__Input["status"],
    description: row.description ?? "",
  };
}

function __TYPE__FormDialog({
  open,
  mode,
  row,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  row?: __TYPE__;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit __NAME__" : "New __NAME__"}
          </DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>

        {open ? (
          <__TYPE__Form
            key={row?.id ?? "new"}
            mode={mode}
            row={row}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function __TYPE__Form({
  mode,
  row,
  onDone,
}: {
  mode: "create" | "edit";
  row?: __TYPE__;
  onDone: () => void;
}) {
  const create = useCreate__TYPE__();
  const update = useUpdate__TYPE__();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(row),
    validators: { onChange: __NAME__FormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = __NAME__InputSchema.parse(value);
      try {
        if (mode === "edit" && row) {
          await update.mutateAsync({ id: row.id, ...payload });
        } else {
          await create.mutateAsync(payload);
        }
        onDone();
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={serverError} />

      <TextField form={form} name="name" label="Name" required />

      <SelectField
        form={form}
        name="status"
        label="Status"
        options={statusOptions}
      />

      <TextareaField
        form={form}
        name="description"
        label="Description"
        rows={3}
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
`;

/* ----------------------------------- write -------------------------------- */

mkdirSync(featureDir, { recursive: true });
writeFileSync(join(featureDir, "schema.ts"), render(schemaTs));
writeFileSync(join(featureDir, "server.ts"), render(serverTs));
writeFileSync(join(featureDir, "queries.ts"), render(queriesTs));
writeFileSync(join(featureDir, "columns.tsx"), render(columnsTsx));
writeFileSync(join(featureDir, "config.ts"), render(configTs));
writeFileSync(routeFile, render(routeTsx));

// Append the Drizzle table.
const tableBlock = render(`
export const __NAME__ = pgTable("__NAME__", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type __TYPE__ = typeof __NAME__.$inferSelect;
export type New__TYPE__ = typeof __NAME__.$inferInsert;
`);
const schemaSrc = readFileSync(schemaFile, "utf8");
if (!schemaSrc.includes(`export const ${name} = pgTable`)) {
  writeFileSync(schemaFile, `${schemaSrc.trimEnd()}\n${tableBlock}`);
}

// Insert the sidebar entry above the anchor (reuses PackageIcon — change later).
const ANCHOR = "// create-resource:anchor";
const sidebarSrc = readFileSync(sidebarFile, "utf8");
if (sidebarSrc.includes(ANCHOR) && !sidebarSrc.includes(`href: "/${name}"`)) {
  const item = `      { label: "${TitlePlural}", href: "/${name}", icon: PackageIcon },\n      ${ANCHOR}`;
  writeFileSync(sidebarFile, sidebarSrc.replace(ANCHOR, item.trimStart()));
}

// Format the generated + touched files so the output is lint-clean immediately.
try {
  execSync(
    `bunx biome check --write ${featureDir} ${routeFile} ${schemaFile} ${sidebarFile}`,
    { stdio: "ignore" },
  );
} catch {
  // Best-effort: never fail generation just because formatting did.
}

console.log(`✔ Created resource "${name}"`);
console.log(
  "  - src/features/" + name + "/{schema,server,queries,columns,config}",
);
console.log("  - src/routes/_app/" + name + ".tsx");
console.log("  - table appended to src/db/schema.ts");
console.log("  - sidebar entry added");
console.log("");
console.log("Next steps:");
console.log(
  "  1. Customise the fields in src/db/schema.ts + src/features/" + name,
);
console.log("  2. bun run db:generate && bun run db:migrate");
console.log("  3. Visit /" + name);
