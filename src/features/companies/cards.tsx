import { MapPinIcon, UsersIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { Company, CompanyIndustry } from "./schema";

export const industryColorMap: Record<CompanyIndustry, ChipColor> = {
  saas: "primary",
  fintech: "secondary",
  healthcare: "success",
  ecommerce: "warning",
  media: "default",
  other: "default",
};

export const industryLabelMap: Record<CompanyIndustry, string> = {
  saas: "SaaS",
  fintech: "Fintech",
  healthcare: "Healthcare",
  ecommerce: "E-commerce",
  media: "Media",
  other: "Other",
};

export interface CompanyCardContext {
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyCard({
  company,
  context,
}: {
  company: Company;
  context: CompanyCardContext;
}) {
  return (
    <Card>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/crm/companies/$id"
            params={{ id: company.id }}
            className="font-medium hover:underline"
          >
            {company.name}
          </Link>
          <ActionMenu
            onEdit={() => context.onEdit(company)}
            onDelete={() => context.onDelete(company)}
          />
        </div>

        <StatusChip
          status={company.industry}
          colorMap={industryColorMap}
          labelMap={industryLabelMap}
        />
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <UsersIcon size={14} />
          {company.size.toLocaleString()} staff
        </span>
        <span className="flex items-center gap-1">
          <MapPinIcon size={14} />
          {company.location}
        </span>
      </CardFooter>
    </Card>
  );
}
