import { PlusIcon } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ContactFormDialog } from "@/features/contacts/ContactFormDialog";
import { createContactsColumns } from "@/features/contacts/columns";
import { contactsTableConfig } from "@/features/contacts/config";
import {
  contactsListQuery,
  useDeleteContact,
} from "@/features/contacts/queries";
import {
  type Contact,
  contactListParamsSchema,
} from "@/features/contacts/schema";
import { DataTable, useTableSearch } from "@/infra/table";

export const Route = createFileRoute("/_app/crm/contacts")({
  validateSearch: contactListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(contactsListQuery(deps)),
  component: ContactsPage,
});

type DialogState = { mode: "create" | "edit"; contact?: Contact } | null;

function ContactsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const table = useTableSearch(search, navigate);
  const [dialog, setDialog] = useState<DialogState>(null);

  const query = useQuery({
    ...contactsListQuery(search),
    placeholderData: keepPreviousData,
  });

  const deleteContact = useDeleteContact();
  const confirm = useConfirm();

  const columns = useMemo(
    () =>
      createContactsColumns({
        onEdit: (contact) => setDialog({ mode: "edit", contact }),
        onDelete: async (contact) => {
          const ok = await confirm({
            title: `Delete “${contact.name}”?`,
            description: "This action cannot be undone.",
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) deleteContact.mutate(contact.id);
        },
      }),
    [deleteContact, confirm],
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Contacts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People across your accounts and prospects.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.rows ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isLoading || query.isFetching}
        searchValue={search.search}
        onSearchChange={table.setSearch}
        searchPlaceholder={contactsTableConfig.searchPlaceholder}
        onRefresh={() => query.refetch()}
        sorting={table.sorting}
        onSortingChange={table.onSortingChange}
        page={search.page}
        pageSize={search.pageSize}
        pageSizeOptions={contactsTableConfig.pageSizeOptions}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        emptyMessage={contactsTableConfig.emptyMessage}
        toolbarActions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon size={16} />
            Add contact
          </Button>
        }
      />

      <ContactFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        contact={dialog?.contact}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
