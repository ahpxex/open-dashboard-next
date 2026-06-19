import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/gallery/")({
  component: GalleryHome,
});

function GalleryHome() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Gallery
      </h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        A palette of admin UI shapes — forms, lists, pages, and rich views —
        each a self-contained, zero-config demo that follows the same
        conventions (Repository/AuthProvider seams, ListParams, URL state,
        loading/empty/error). Browse the categories in the sidebar. On port,
        keep what your product needs and run <code>trim-gallery</code> to delete
        the rest. Catalogue: <code>docs/gallery-catalogue.md</code>.
      </p>
    </div>
  );
}
