import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { restRepository } from "./rest-repository";

interface Post {
  id: string;
  title: string;
}
interface RawPost {
  id: number;
  title: string;
}

function mockResponse(
  data: unknown,
  { status = 200, total }: { status?: number; total?: number } = {},
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    headers: {
      get: (h: string) =>
        h.toLowerCase() === "x-total-count" && total != null
          ? String(total)
          : null,
    },
  };
}

const fetchMock = vi.fn();

const repo = restRepository<Post, { title: string }, RawPost>({
  baseUrl: "https://api.test",
  path: "/posts",
  map: (raw) => ({ id: String(raw.id), title: raw.title }),
});

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("restRepository.list", () => {
  it("builds json-server query params and maps rows + total", async () => {
    fetchMock.mockResolvedValue(
      mockResponse([{ id: 1, title: "A" }], { total: 100 }),
    );

    const result = await repo.list({
      page: 2,
      pageSize: 10,
      search: "hello",
      sortBy: "title",
      sortDir: "desc",
      filters: { userId: "3" },
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("_page=2");
    expect(url).toContain("_limit=10");
    expect(url).toContain("q=hello");
    expect(url).toContain("_sort=title");
    expect(url).toContain("_order=desc");
    expect(url).toContain("userId=3");
    expect(result).toEqual({ rows: [{ id: "1", title: "A" }], total: 100 });
  });

  it("falls back to row count when no total header is present", async () => {
    fetchMock.mockResolvedValue(mockResponse([{ id: 1, title: "A" }]));
    const result = await repo.list({ page: 1, pageSize: 10 });
    expect(result.total).toBe(1);
  });
});

describe("restRepository item ops", () => {
  it("getOne maps the record, returns null on 404", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ id: 7, title: "G" }));
    expect(await repo.getOne("7")).toEqual({ id: "7", title: "G" });

    fetchMock.mockResolvedValueOnce(mockResponse(null, { status: 404 }));
    expect(await repo.getOne("999")).toBeNull();
  });

  it("create POSTs a JSON body", async () => {
    fetchMock.mockResolvedValue(mockResponse({ id: 101, title: "New" }));
    const row = await repo.create({ title: "New" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ title: "New" });
    expect(row).toEqual({ id: "101", title: "New" });
  });

  it("remove issues a DELETE and throws on failure", async () => {
    fetchMock.mockResolvedValue(mockResponse({}, { status: 200 }));
    await repo.remove("1");
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");

    fetchMock.mockResolvedValue(mockResponse({}, { status: 500 }));
    await expect(repo.remove("1")).rejects.toThrow(/REST remove failed/);
  });
});
