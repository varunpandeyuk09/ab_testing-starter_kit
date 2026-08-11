# tools/ss_search_check.ps1 - SmartSign.com search result checker
# ------------------------------------------------------------------
# PURPOSE
#   Checks how many search results SmartSign.com returns for one or more
#   search terms by rendering the (AJAX-loaded) SERP in headless Edge and
#   reading the live result-count text (#total_result).
#
#   This is the SMARTSIGN-specific instance of playbook pattern P27
#   (Headless Browser Verification). To audit ANY other site's search:
#     - copy this file,
#     - change $BaseUrl + $UrlBuilder to that site's search URL pattern,
#     - change $CountPattern to its result-count text.
#   The headless-run + cleanup skeleton stays the same.
#
# USAGE
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/ss_search_check.ps1 -Terms "lead paint;oil tank;radon"
#   (terms are ';'-separated; spaces are turned into '_' in the URL)
#
# NOTES / GOTCHAS
#   - Requires MS Edge installed at the default path (override with -Edge).
#   - Headless runs are flaky when many run in parallel (0-byte dumps) -
#     rerun failed terms sequentially.
#   - Each run enforces a hard wait of 30s, then kills Edge if needed.
# ------------------------------------------------------------------
param(
  [string]$Edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  [string[]]$Terms
)
$ErrorActionPreference = "Continue"
$scratch = "C:\Users\varun\AppData\Local\Temp\opencode"

# --- site-specific: search URL + result-count extractor -------------------
$BaseUrl = "https://www.smartsign.com/search/"
$CountPattern = 'id="total_result"[^>]*>\s*([^<]+)<'   # e.g. "1 result" / "48 results" / "1,000+ results"

function Get-SearchUrl([string]$term) {
  return $BaseUrl + ($term -replace ' ', '_')
}
function Get-ResultCountText([string]$dumpPath) {
  $m = Select-String -Path $dumpPath -Pattern $CountPattern | Select-Object -First 1
  if ($m -and $m.Matches[0].Groups[1]) { return $m.Matches[0].Groups[1].Value.Trim() }
  $title = Select-String -Path $dumpPath -Pattern '<title>([^<]+)</title>' | Select-Object -First 1
  return "NO-RESULT-COUNT (title=$($title.Matches[0].Groups[1].Value))"
}
# --------------------------------------------------------------------------

foreach ($term in ($Terms -split ';' | ForEach-Object { $_.Trim() })) {
  $url  = Get-SearchUrl $term
  $out  = Join-Path $scratch "ss_run_$([guid]::NewGuid().ToString('N')).html"
  $prof = Join-Path $scratch "profile_$([guid]::NewGuid().ToString('N'))"

  $proc = Start-Process -FilePath $Edge -ArgumentList "--headless","--disable-gpu","--no-sandbox","--user-data-dir=$prof","--dump-dom","--virtual-time-budget=10000","--timeout=25000",$url -RedirectStandardOutput $out -RedirectStandardError (Join-Path $scratch "edge_err.txt") -PassThru -NoNewWindow
  if (-not $proc.WaitForExit(30000)) { $proc.Kill() }

  if (Test-Path $out) {
    $countText = Get-ResultCountText $out
    $boxRefs = (Select-String -Path $out -Pattern 'ss-product-box' -AllMatches | Measure-Object).Count
    "$term`t=>`t$countText`t(ss-product-box refs: $boxRefs)"
  } else {
    "$term`t=>`tNO-OUTPUT"
  }

  Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item $out -Force -ErrorAction SilentlyContinue
}
