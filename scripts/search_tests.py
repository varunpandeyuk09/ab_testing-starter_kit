import os
import json
import sys
import re

REPO_NAME_CANDIDATES = ["AB-test", "AB TEST", "ABTest", "ab-test"]


def find_repo():
    """Locate the AB-test archive anywhere on this machine."""
    env = os.environ.get("AB_TEST_REPO")
    if env and os.path.isdir(env):
        return env

    here = os.path.abspath(os.getcwd())
    while True:
        for name in REPO_NAME_CANDIDATES:
            cand = os.path.join(here, name)
            if os.path.isdir(cand):
                return cand
        parent = os.path.dirname(here)
        if parent == here:
            break
        here = parent

    for root in ["C:\\", "D:\\", "E:\\", "F:\\", "G:\\", "H:\\"]:
        if not os.path.isdir(root):
            continue
        try:
            for name in os.listdir(root):
                for cand in REPO_NAME_CANDIDATES:
                    if name.lower() == cand.lower():
                        p = os.path.join(root, name)
                        if os.path.isdir(p):
                            return p
        except (PermissionError, OSError):
            continue
    return None


def normalize(text):
    """Lowercase, strip punctuation, return token set."""
    tokens = re.findall(r"[a-z0-9]+", (text or "").lower())
    return set(tokens)


def build_index(repo):
    docs = []   # list of (path, doc_tokens, raw_text)
    for root, _, files in os.walk(repo):
        if "metadata.json" not in files:
            continue
        meta_path = os.path.join(root, "metadata.json")
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            continue
        raw = " ".join([
            str(meta.get("type", "")),
            str(meta.get("platform", "")),
            str(meta.get("website_type", "")),
            str(meta.get("framework", "")),
            " ".join(meta.get("techniques", []) or []),
            " ".join(meta.get("changes_made", []) or []),
            str(meta.get("notes", "")),
        ])
        docs.append((root, normalize(raw), raw))
    return docs


def score(query_tokens, doc_tokens):
    if not doc_tokens:
        return 0.0
    inter = query_tokens & doc_tokens
    if not inter:
        return 0.0
    return len(inter) / max(len(query_tokens), 1)


def print_test(test_path, show_code=True):
    print(f"### FOUND TEST: {os.path.basename(test_path)}")
    meta_path = os.path.join(test_path, "metadata.json")
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            print(f"    URL: {meta.get('website_url', '')}")
            print(f"    Type: {meta.get('type', '')} | Platform: {meta.get('platform', '')} | Complexity: {meta.get('complexity', '')}")
        except Exception:
            pass
    if show_code:
        for dirpath, _, filenames in os.walk(test_path):
            for file in sorted(filenames):
                if file.endswith((".js", ".css")) and "variation" in file:
                    full = os.path.join(dirpath, file)
                    try:
                        with open(full, "r", encoding="utf-8") as f:
                            content = f.read()
                    except Exception:
                        continue
                    rel = os.path.relpath(full, test_path)
                    print(f"\n--- File: {rel} ---")
                    if len(content) > 3000:
                        print(content[:3000] + "\n...[truncated]...")
                    else:
                        print(content)
        print("\n" + "=" * 50 + "\n")


def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/search_tests.py "your search query" [--code]')
        print('  --code   also print JS/CSS of the top matches (default)')
        print('  --no-code  print only test names/scores')
        sys.exit(1)

    query = sys.argv[1]
    show_code = "--no-code" not in sys.argv
    top_n = 3

    repo = find_repo()
    if not repo:
        print("ERROR: Could not find the AB-test archive on this machine.")
        print("Set the environment variable AB_TEST_REPO to its path and retry.")
        sys.exit(2)

    print(f"Using archive: {repo}\n")

    docs = build_index(repo)
    if not docs:
        print("No metadata.json files found to search.")
        sys.exit(1)

    query_tokens = normalize(query)

    ranked = []
    for path, doc_tokens, _ in docs:
        s = score(query_tokens, doc_tokens)
        if s > 0.0:
            ranked.append((s, path))

    ranked.sort(key=lambda x: -x[0])
    ranked = ranked[:top_n]

    if not ranked:
        print(f"No relevant tests found for '{query}'. Consider a broader query.")
        sys.exit(1)

    print(f"--- Top {len(ranked)} Matching Tests for '{query}' ---\n")
    for s, path in ranked:
        print(f"[score: {s:.2f}]")
        print_test(path, show_code=show_code)


if __name__ == "__main__":
    main()
