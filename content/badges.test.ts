import { afterEach, describe, expect, it, vi } from "vitest";
import { lastCommit, pypiVersion } from "./badges";
import { getProject } from "./projects";

const lumencell = getProject("lumencell")!;
const trustory = getProject("trustory")!; // no PyPI page, no code link

const respond = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }));

afterEach(() => vi.unstubAllGlobals());

describe("badges", () => {
  it("read the PyPI version and the last commit date", async () => {
    vi.stubGlobal("fetch", respond({ info: { version: "0.5.0" } }));
    expect(await pypiVersion(lumencell)).toBe("0.5.0");
    expect(fetch).toHaveBeenCalledWith("https://pypi.org/pypi/lumencell/json", expect.anything());

    vi.stubGlobal("fetch", respond([{ commit: { committer: { date: "2026-11-20T10:00:00Z" } } }]));
    expect(await lastCommit(lumencell)).toBe("2026-11-20T10:00:00Z");
    expect(fetch).toHaveBeenCalledWith("https://api.github.com/repos/shreyandhawa/lumenCell_V2/commits?per_page=1", expect.anything());
  });

  it("skip projects without a PyPI page or a repo, without fetching", async () => {
    vi.stubGlobal("fetch", respond({}));
    expect(await pypiVersion(trustory)).toBeUndefined();
    expect(await lastCommit(trustory)).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["a network error", vi.fn(async () => Promise.reject(new TypeError("fetch failed")))],
    ["an error status", respond({ message: "rate limited" }, false)],
    ["an unexpected body", respond({ info: {}, commit: null })],
    ["a body that is not JSON", vi.fn(async () => ({ ok: true, json: async () => Promise.reject(new SyntaxError("bad")) }))],
  ])("hide on %s", async (_, fetchMock) => {
    vi.stubGlobal("fetch", fetchMock);
    expect(await pypiVersion(lumencell)).toBeUndefined();
    expect(await lastCommit(lumencell)).toBeUndefined();
  });
});
