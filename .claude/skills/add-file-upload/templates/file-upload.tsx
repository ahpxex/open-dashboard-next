import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileUpload } from "@/components/form/FileField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StoredFile } from "@/infra/storage/storage";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/file-upload")({
  component: FileUploadDemo,
});

/** Compact preview of the URL a `StorageAdapter` returned for a stored file. */
function StoredUrls({ files }: { files: StoredFile[] }) {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <span className="text-[11px] font-medium text-muted-foreground">
        Stored URLs
      </span>
      <ul className="flex flex-col gap-1">
        {files.map((file, index) => (
          <li
            key={`${file.url}-${index}`}
            className="truncate font-mono text-[11px] text-muted-foreground"
            title={file.url}
          >
            {file.name} → {file.url}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Gallery demo: the `FileUpload` control over the zero-config `dataUrlStorage`
 * adapter (reads files to `data:` URLs in the browser, no backend). An avatar
 * single-image uploader and a multi-file attachments uploader, each showing the
 * live preview plus the "stored" URLs the adapter returned, with a success toast.
 */
function FileUploadDemo() {
  const [avatar, setAvatar] = useState<StoredFile[]>([]);
  const [attachments, setAttachments] = useState<StoredFile[]>([]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          File upload
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A drag-and-drop / click-to-pick upload control with thumbnail
          previews, backed by a swappable storage seam. This demo uses the
          zero-config browser data-URL adapter; a real app swaps in an S3 / disk
          adapter behind the same interface.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avatar (single image)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              One image, shown as a square tile with a remove button on hover.
            </p>
            <FileUpload
              avatar
              accept="image/*"
              hint="PNG or JPG"
              value={avatar}
              onChange={(files) => {
                setAvatar(files);
                if (files.length) toast.success("Avatar uploaded");
              }}
            />
            <StoredUrls files={avatar} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments (multiple)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Many files; images preview as thumbnails, others as a file chip.
            </p>
            <FileUpload
              multiple
              hint="Any file, up to a few MB each"
              value={attachments}
              onChange={(files) => {
                const added = files.length - attachments.length;
                setAttachments(files);
                if (added > 0)
                  toast.success(
                    `${added} file${added === 1 ? "" : "s"} uploaded`,
                  );
              }}
            />
            <StoredUrls files={attachments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
