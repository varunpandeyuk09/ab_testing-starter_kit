#!/usr/bin/env python3
"""
qa_validate.py — Automated pre-handover QA for starter kit
Checks: syntax, duplicate selectors, unscoped CSS, interval cleanup,
        missing files, share.js DOM mutation, anti-patterns
Usage: python scripts/qa_validate.py [TEST_PATH]
       python scripts/qa_validate.py ClientData/NMN/AB37_CARDS_FILTERS
"""
import os, re, json, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_exists(test_path):
    errs=[]
    for f in ["v1.json","metadata.json"]:
        if not os.path.exists(os.path.join(test_path,f)):
            errs.append(f"MISSING {f}")
    for f in ["variation1/variation.js","variation1/variation.css"]:
        if not os.path.exists(os.path.join(test_path,f)):
            errs.append(f"MISSING {f}")
    return errs

def check_syntax(js_path):
    errs=[]
    try:
        with open(js_path,encoding="utf-8",errors="ignore") as f: c=f.read()
        # basic brace balance
        if c.count("{") != c.count("}"): errs.append("SYNTAX braces mismatch")
        if c.count("(") != c.count(")"): errs.append("SYNTAX parens mismatch")
        # node --check if available
    except Exception as e: errs.append(f"READ {e}")
    return errs

def check_duplicate_selectors(js_path):
    errs=[]
    try:
        with open(js_path,encoding="utf-8",errors="ignore") as f: c=f.read()
        sels=re.findall(r'querySelector(All)?\(\s*["\']([^"\']+)["\']',c)
        seen={}
        for _,s in sels:
            seen[s]=seen.get(s,0)+1
        dups=[k for k,v in seen.items() if v>3 and k not in ["html body","html body .region-footer"]]
        if dups: errs.append(f"DUPLICATE selector {dups[:3]}")
    except: pass
    return errs

def check_unscoped_css(css_path):
    errs=[]
    try:
        with open(css_path,encoding="utf-8",errors="ignore") as f: c=f.read()
        # find rule selectors before {
        rules=re.findall(r'([^\{\}]+)\{',c)
        unscoped=[]
        for r in rules:
            r=r.strip()
            if not r or r.startswith("@") or r.startswith("/*"): continue
            # split by comma
            for sel in r.split(","):
                sel=sel.strip()
                if not sel: continue
                if ".EG-" not in sel and ".eg-" not in sel and sel not in ["html","body"]:
                    # allow keyframes
                    if "keyframes" in sel: continue
                    unscoped.append(sel[:40])
                    break
        if unscoped: errs.append(f"UNSCOPED CSS {unscoped[:2]} — must be under .EG-xxx/.eg-xxx (P16)")
        if c.count("!important")>2: errs.append(f"!important x{c.count('!important')} >2 (P16 guard)")
    except: pass
    return errs

def check_interval_cleanup(js_path):
    errs=[]
    try:
        with open(js_path,encoding="utf-8",errors="ignore") as f: c=f.read()
        if "setInterval" in c and "clearInterval" not in c: errs.append("INTERVAL no clearInterval")
        if "setTimeout" in c and c.count("setInterval")>c.count("clearInterval")+1: errs.append("INTERVAL leak")
    except: pass
    return errs

def check_share_mutation(test_path):
    errs=[]
    p=os.path.join(test_path,"share.js")
    if not os.path.exists(p): return []
    try:
        with open(p,encoding="utf-8",errors="ignore") as f: c=f.read()
        if any(k in c for k in ["insertAdjacent","innerHTML","appendChild","insertBefore"]):
            errs.append("SHARE.JS DOM mutation — only live() allowed (P7)")
        if re.search(r'^\s*document\.querySelector\(["\']\[data-',c,re.M):
            errs.append("SHARE.JS top-level querySelector[data-*] — must be inside waitForElement (P7)")
    except: pass
    return errs

def check_antipattern(js_path):
    errs=[]
    try:
        with open(js_path,encoding="utf-8",errors="ignore") as f: c=f.read()
        if re.search(r'document\.querySelector\(["\']\[data-pid',c) and "waitForElement" not in c:
            errs.append("ANTI-PATTERN [data-pid] without waitForElement")
        if "innerHTML =" in c and "insertAdjacent" not in c:
            errs.append("ANTI-PATTERN innerHTML= — use insertAdjacent (P2)")
    except: pass
    return errs

def validate(test_path):
    print(f"\n=== QA {test_path} ===")
    all_errs=[]
    all_errs+=check_exists(test_path)
    for js in glob.glob(os.path.join(test_path,"variation1/*.js")):
        all_errs+=check_syntax(js)
        all_errs+=check_duplicate_selectors(js)
        all_errs+=check_interval_cleanup(js)
        all_errs+=check_antipattern(js)
    for css in glob.glob(os.path.join(test_path,"variation1/*.css")):
        all_errs+=check_unscoped_css(css)
    all_errs+=check_share_mutation(test_path)
    if not all_errs:
        print("PASS -- all automated checks green")
    else:
        for e in all_errs: print("  X",e)
    return len(all_errs)==0

if __name__=="__main__":
    target=sys.argv[1] if len(sys.argv)>1 else None
    if target:
        validate(target)
    else:
        # find all ClientData tests
        for root,dirs,files in os.walk(os.path.join(ROOT,"ClientData")):
            if "v1.json" in files:
                validate(root)
