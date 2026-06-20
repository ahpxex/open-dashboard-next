"use client";

/**
 * The storage seam — the upload counterpart to the `Repository` data adapter.
 *
 * A `StorageAdapter` takes a browser `File` and returns a stored object's
 * `{ url, name, size }`. The rest of the app (the `FileField` control, resource
 * forms) depends only on this interface, so the *where* of storage is swappable
 * without touching any UI:
 *
 *   - `dataUrlStorage` (default, below): reads the file into a `data:` URL
 *     entirely in the browser. Zero-config — works with no backend, no bucket,
 *     no env vars — which is why it backs the gallery demo and lets a resource
 *     form run before any real storage is wired. The URL embeds the bytes, so
 *     it is only suitable for small files and demos.
 *
 *   - A real app swaps in an adapter that uploads to S3 / R2 / local disk and
 *     returns the public (or signed) URL — mirroring how a resource binds a
 *     `drizzleRepository`/`restRepository` in its `server.ts`. The browser half
 *     stays identical; only the adapter changes. Sketch:
 *
 *     ```ts
 *     // src/features/<name>/storage.ts  (client) — calls a server fn
 *     import { uploadToBucket } from "./server"; // createServerFn, requireUser()
 *     export const bucketStorage: StorageAdapter = {
 *       async upload(file) {
 *         const form = new FormData();
 *         form.append("file", file);
 *         const { url } = await uploadToBucket({ data: form });
 *         return { url, name: file.name, size: file.size };
 *       },
 *     };
 *     ```
 *
 * The server fn is where `requireUser()`, type/size validation, and the actual
 * bucket/disk write live — secrets never reach the browser. See
 * `docs/data-adapters.md` for the parallel Repository pattern.
 */

/** A file that has been stored, reduced to what the UI needs to render/link it. */
export interface StoredFile {
  /** Public or signed URL the app can render/link. A `data:` URL for the default adapter. */
  url: string;
  /** Original filename, for display and download. */
  name: string;
  /** Size in bytes, for display and validation. */
  size: number;
}

/** The swappable storage backend. Implement `upload` over your bucket/disk. */
export interface StorageAdapter {
  upload(file: File): Promise<StoredFile>;
}

/**
 * Zero-config, browser-only storage: read the file into a `data:` URL via
 * `FileReader`. No backend required. Suitable for demos and small files; for
 * production swap in a bucket/disk adapter behind the same interface (see above).
 */
export const dataUrlStorage: StorageAdapter = {
  upload(file: File): Promise<StoredFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          url: typeof reader.result === "string" ? reader.result : "",
          name: file.name,
          size: file.size,
        });
      reader.onerror = () =>
        reject(reader.error ?? new Error(`Failed to read ${file.name}`));
      reader.readAsDataURL(file);
    });
  },
};
