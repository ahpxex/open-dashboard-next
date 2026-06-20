import type { ReactNode } from "react";

/**
 * A compact key/value grid for record metadata. Labels sit in a fixed column,
 * values flow in the second column and may be any node (text, chips, links).
 */
export function MetadataList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-2 text-xs">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
