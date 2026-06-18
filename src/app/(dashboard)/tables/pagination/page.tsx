"use client";

import { Suspense, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { usersConfig, usersMeta } from "@/examples/users";
import { PaginationTable, TablePage } from "@/infra/table";

export default function PaginationPage() {
  const [totalCount, setTotalCount] = useState(0);

  return (
    <TablePage
      title={usersMeta.title}
      description={`${usersMeta.description ?? ""}${
        usersMeta.description ? " " : ""
      }Total records: ${totalCount}`}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        }
      >
        <PaginationTable
          {...usersConfig}
          onTotalsChange={({ totalCount }) => setTotalCount(totalCount)}
        />
      </Suspense>
    </TablePage>
  );
}
