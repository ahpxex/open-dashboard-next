import { PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CompanyFormDialog } from "@/features/companies/CompanyFormDialog";
import { CompanyCard } from "@/features/companies/cards";
import {
  companiesFilters,
  companiesListConfig,
} from "@/features/companies/config";
import {
  companiesListQuery,
  useDeleteCompany,
} from "@/features/companies/queries";
import {
  type Company,
  companyListParamsSchema,
} from "@/features/companies/schema";
import { CardList, useResourceList } from "@/infra/list";

export const Route = createFileRoute("/_app/crm/companies")({
  validateSearch: companyListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(companiesListQuery(deps)),
  component: CompaniesPage,
});

type DialogState = { mode: "create" | "edit"; company?: Company } | null;

function CompaniesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { table, rows, total, isLoading, refetch } = useResourceList<
    typeof search,
    Company
  >(search, navigate, companiesListQuery);
  const [dialog, setDialog] = useState<DialogState>(null);

  const remove = useDeleteCompany();
  const confirm = useConfirm();

  const cardContext = {
    onEdit: (company: Company) => setDialog({ mode: "edit", company }),
    onDelete: async (company: Company) => {
      const ok = await confirm({
        title: `Delete “${company.name}”?`,
        description: "This action cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
      });
      if (ok) remove.mutate(company.id);
    },
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Companies
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts you sell to, as a card gallery.
        </p>
      </div>

      <CardList
        data={rows}
        total={total}
        isLoading={isLoading}
        getKey={(company) => company.id}
        renderCard={(company) => (
          <CompanyCard company={company} context={cardContext} />
        )}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={companiesListConfig.searchPlaceholder}
        filters={companiesFilters}
        filterValues={{ industry: search.industry }}
        onFilterChange={table.setFilter}
        onRefresh={refetch}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={companiesListConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={companiesListConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add company
          </Button>
        }
      />

      <CompanyFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        company={dialog?.company}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
