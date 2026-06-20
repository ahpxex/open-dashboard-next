import { createFileRoute } from "@tanstack/react-router";
import { GlobalSearch, type SearchSource } from "@/components/GlobalSearch";

export const Route = createFileRoute("/_app/gallery/global-search")({
  component: GlobalSearchDemo,
});

type Article = { id: string; title: string; author: string };
type Customer = { id: string; name: string; email: string };
type Order = { id: string; ref: string; customer: string; total: number };

const ARTICLES: Article[] = [
  { id: "a1", title: "Shipping a design system", author: "Ada Lovelace" },
  { id: "a2", title: "Server functions, end to end", author: "Grace Hopper" },
  { id: "a3", title: "A field guide to data tables", author: "Alan Turing" },
  { id: "a4", title: "Theming with CSS variables", author: "Edsger Dijkstra" },
];

const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Acme Corp", email: "ops@acme.co" },
  { id: "c2", name: "Globex", email: "hello@globex.com" },
  { id: "c3", name: "Initech", email: "billing@initech.io" },
  { id: "c4", name: "Umbrella", email: "team@umbrella.dev" },
];

const ORDERS: Order[] = [
  { id: "o1", ref: "ORD-1042", customer: "Acme Corp", total: 1290 },
  { id: "o2", ref: "ORD-1043", customer: "Globex", total: 540 },
  { id: "o3", ref: "ORD-1044", customer: "Initech", total: 9900 },
];

/**
 * Gallery demo: an always-open `GlobalSearch` over three mock resources. Type
 * to filter — each source maps its items to `{ title, subtitle, href }` and the
 * component groups, filters, and (in a real app) navigates on select.
 */
function GlobalSearchDemo() {
  const sources: SearchSource[] = [
    {
      label: "Articles",
      items: ARTICLES,
      toResult: (a: Article) => ({
        id: a.id,
        title: a.title,
        subtitle: `by ${a.author}`,
        href: `/gallery/global-search?article=${a.id}`,
      }),
    },
    {
      label: "Customers",
      items: CUSTOMERS,
      toResult: (c: Customer) => ({
        id: c.id,
        title: c.name,
        subtitle: c.email,
        href: `/gallery/global-search?customer=${c.id}`,
      }),
    },
    {
      label: "Orders",
      items: ORDERS,
      toResult: (o: Order) => ({
        id: o.id,
        title: o.ref,
        subtitle: `${o.customer} · $${o.total.toLocaleString()}`,
        href: `/gallery/global-search?order=${o.id}`,
      }),
    },
  ] as SearchSource[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Global search
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A ⌘K-style search across resources. Each <code>SearchSource</code>{" "}
          supplies its items and a <code>toResult</code> mapper; results are
          grouped by source and filter live as you type. In a real app, wire the
          sources to your list queries and open it from the header / ⌘K.
        </p>
      </div>

      <div className="max-w-xl">
        <GlobalSearch
          inline
          sources={sources}
          placeholder="Search articles, customers, orders…"
        />
      </div>
    </div>
  );
}
