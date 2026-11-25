// Facts fetched once at build: the PyPI version and the date of the last commit. Any failure hides the badge, never the build.
import type { Project } from "./projects";

async function getJson(url: string, headers?: HeadersInit): Promise<unknown> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    return res.ok ? await res.json() : undefined;
  } catch {
    return undefined;
  }
}

/** Latest version on PyPI, for a project deployed to a pypi.org/project/<name> page. */
export async function pypiVersion(p: Project): Promise<string | undefined> {
  const name = p.deployed?.href.match(/^https:\/\/pypi\.org\/project\/([^/]+)/)?.[1];
  if (!name) return undefined;
  const data = (await getJson(`https://pypi.org/pypi/${name}/json`)) as { info?: { version?: unknown } } | undefined;
  const version = data?.info?.version;
  return typeof version === "string" && version ? version : undefined;
}

/** ISO date of the newest commit on the default branch of the project's GitHub repo. */
export async function lastCommit(p: Project): Promise<string | undefined> {
  const repo = p.code?.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)/)?.[1];
  if (!repo) return undefined;
  // CI passes its token so builds share a higher rate limit than the 60 an hour per IP.
  const token = process.env.GITHUB_TOKEN;
  const data = (await getJson(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })) as { commit?: { committer?: { date?: unknown } } }[] | undefined;
  const date = Array.isArray(data) ? data[0]?.commit?.committer?.date : undefined;
  return typeof date === "string" && !Number.isNaN(Date.parse(date)) ? date : undefined;
}
