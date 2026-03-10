#!/usr/bin/env python3
"""Synchronizácia všetkých GitHub repozitárov pre user/org do lokálneho priečinka.

Použitie:
  GITHUB_TOKEN=... python3 scripts/sync_all_github_repos.py --owner my-user
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


GITHUB_API = "https://api.github.com"


def run_git(cmd: list[str], cwd: Path | None = None) -> None:
    result = subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"Git command failed: {' '.join(cmd)}")


def github_request(url: str, token: str) -> list[dict]:
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    with urllib.request.urlopen(req) as response:  # nosec B310
        payload = response.read().decode("utf-8")
        data = json.loads(payload)
        if not isinstance(data, list):
            raise RuntimeError(f"Unexpected GitHub API response type for URL: {url}")
        return data


def list_repos(owner: str, token: str, owner_type: str, include_archived: bool) -> list[dict]:
    repos: list[dict] = []
    page = 1

    if owner_type == "org":
        endpoint = f"/orgs/{owner}/repos"
    else:
        endpoint = "/user/repos"

    while True:
        params = {"per_page": 100, "page": page, "sort": "full_name", "direction": "asc"}
        if owner_type == "user":
            params["affiliation"] = "owner"
        url = f"{GITHUB_API}{endpoint}?{urllib.parse.urlencode(params)}"

        try:
            page_repos = github_request(url, token)
        except urllib.error.HTTPError as exc:
            msg = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"GitHub API error ({exc.code}) at {url}: {msg}") from exc

        if not page_repos:
            break

        for repo in page_repos:
            if owner_type == "user" and repo.get("owner", {}).get("login") != owner:
                continue
            if not include_archived and repo.get("archived"):
                continue
            repos.append(repo)

        page += 1

    return repos


def sync_repo(repo: dict, target_dir: Path, protocol: str) -> str:
    full_name = repo["full_name"]
    repo_name = repo["name"]
    clone_url = repo["ssh_url"] if protocol == "ssh" else repo["clone_url"]
    repo_path = target_dir / repo_name

    if not repo_path.exists():
        print(f"[CLONE] {full_name}")
        run_git(["git", "clone", clone_url, str(repo_path)])
        return "cloned"

    if not (repo_path / ".git").exists():
        print(f"[SKIP ] {full_name} -> {repo_path} exists and is not a git repo")
        return "skipped"

    print(f"[FETCH] {full_name}")
    run_git(["git", "remote", "set-url", "origin", clone_url], cwd=repo_path)
    run_git(["git", "fetch", "--all", "--prune"], cwd=repo_path)
    return "fetched"


def detect_owner_type(owner: str, token: str) -> str:
    user_url = f"{GITHUB_API}/users/{owner}"
    req = urllib.request.Request(user_url)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    with urllib.request.urlopen(req) as response:  # nosec B310
        data = json.loads(response.read().decode("utf-8"))
    user_type = data.get("type")
    if user_type == "Organization":
        return "org"
    return "user"


def main() -> int:
    parser = argparse.ArgumentParser(description="Načíta/synchronizuje všetky repozitáre z GitHub ownera")
    parser.add_argument("--owner", required=True, help="GitHub login alebo organizácia")
    parser.add_argument("--target-dir", default="../github-repos", help="Cieľový adresár pre repozitáre")
    parser.add_argument("--protocol", choices=["https", "ssh"], default="https", help="URL protokol pre remote")
    parser.add_argument("--include-archived", action="store_true", help="Zahrnúť aj archivované repozitáre")
    args = parser.parse_args()

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("ERROR: Chýba GITHUB_TOKEN v prostredí.", file=sys.stderr)
        return 2

    target_dir = Path(args.target_dir).resolve()
    target_dir.mkdir(parents=True, exist_ok=True)

    owner_type = detect_owner_type(args.owner, token)
    repos = list_repos(args.owner, token, owner_type, args.include_archived)
    if not repos:
        print(f"Nenašli sa žiadne repozitáre pre ownera '{args.owner}'.")
        return 0

    print(f"Našlo sa {len(repos)} repozitárov pre {args.owner} ({owner_type}).")

    stats = {"cloned": 0, "fetched": 0, "skipped": 0}
    for repo in repos:
        result = sync_repo(repo, target_dir, args.protocol)
        stats[result] += 1

    print("---")
    print(f"Hotovo. cloned={stats['cloned']}, fetched={stats['fetched']}, skipped={stats['skipped']}")
    print(f"Cieľ: {target_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
