import {
  CaretRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/gallery/tree")({
  component: TreeDemo,
});

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

const TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    children: [
      {
        id: "src-components",
        name: "components",
        children: [
          {
            id: "src-components-ui",
            name: "ui",
            children: [
              { id: "ui-button", name: "button.tsx" },
              { id: "ui-card", name: "card.tsx" },
              { id: "ui-badge", name: "badge.tsx" },
            ],
          },
          { id: "src-components-form", name: "form.tsx" },
        ],
      },
      {
        id: "src-features",
        name: "features",
        children: [
          {
            id: "src-features-products",
            name: "products",
            children: [
              { id: "products-schema", name: "schema.ts" },
              { id: "products-server", name: "server.ts" },
              { id: "products-queries", name: "queries.ts" },
            ],
          },
        ],
      },
      { id: "src-config", name: "app.ts" },
    ],
  },
  {
    id: "drizzle",
    name: "drizzle",
    children: [
      { id: "drizzle-0000", name: "0000_init.sql" },
      { id: "drizzle-meta", name: "meta.json" },
    ],
  },
  { id: "readme", name: "README.md" },
];

const INITIAL_EXPANDED = new Set([
  "src",
  "src-components",
  "src-components-ui",
]);

function TreeDemo() {
  const [expanded, setExpanded] = useState<Set<string>>(INITIAL_EXPANDED);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Tree / nested list
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          An expandable tree of folders and files. Expansion state lives in a
          local Set; children indent by depth and the caret rotates open.
          Clicking a file reports its full path.
        </p>
      </div>

      <div className="max-w-md rounded-none border border-border bg-card p-2">
        <ul className="flex flex-col" role="tree" aria-label="Project files">
          {TREE.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              depth={0}
              path=""
              expanded={expanded}
              onToggle={toggle}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  path,
  expanded,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  path: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isFolder = Array.isArray(node.children);
  const isOpen = expanded.has(node.id);

  return (
    <li
      role="treeitem"
      aria-label={node.name}
      aria-level={depth + 1}
      aria-expanded={isFolder ? isOpen : undefined}
    >
      <button
        type="button"
        onClick={() => (isFolder ? onToggle(node.id) : toast.success(fullPath))}
        className="flex w-full items-center gap-1.5 rounded-none px-1.5 py-1 text-left text-sm transition-colors hover:bg-muted"
        style={{ paddingLeft: `${depth * 16 + 6}px` }}
      >
        {isFolder ? (
          <CaretRightIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90",
            )}
          />
        ) : (
          <span className="inline-block size-3.5 shrink-0" />
        )}
        {isFolder ? (
          isOpen ? (
            <FolderOpenIcon
              weight="fill"
              className="size-4 shrink-0 text-primary"
            />
          ) : (
            <FolderIcon
              weight="fill"
              className="size-4 shrink-0 text-primary"
            />
          )
        ) : (
          <FileIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-foreground">{node.name}</span>
      </button>

      {isFolder && isOpen ? (
        <ul className="flex flex-col">
          {node.children?.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              path={fullPath}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
