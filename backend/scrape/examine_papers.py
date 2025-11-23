import json
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

SUPPLEMENT_URL = "https://examine.com/supplements/vitamin-b12/?show_conditions=true"

def collect_study_links(page):
    """
    On the supplement page, collect all links that look like
    Examine research-feed study pages from the Examine Database section.
    """
    study_links = page.eval_on_selector(
        "#examine-database",
        """
        (root) => {
            if (!root) return [];
            const anchors = Array.from(
                root.querySelectorAll('a[href*="/research-feed/study/"]')
            );
            const seen = new Set();
            const out = [];
            for (const a of anchors) {
                const href = a.href;
                if (!href || seen.has(href)) continue;
                seen.add(href);
                out.append({
                    href,
                    text: a.textContent.trim()
                });
            }
            return out;
        }
        """
    ) or []
    return study_links


def extract_external_links_from_study(page, study_url):
    """
    On an Examine research-feed study page, grab:
      - title
      - any external links to PubMed / DOI / PMC etc.
    """
    page.goto(study_url, wait_until="networkidle")

    data = page.evaluate(
        """
        () => {
            const titleEl = document.querySelector("h1, h2");
            const title = titleEl ? titleEl.textContent.trim() : null;

            const anchors = Array.from(document.querySelectorAll("a"));
            const external = [];

            for (const a of anchors) {
                const href = a.href || "";
                if (!href) continue;

                // Focus on typical scholarly links
                if (
                    href.includes("pubmed.ncbi.nlm.nih.gov") ||
                    href.includes("pmc.ncbi.nlm.nih.gov") ||
                    href.includes("ncbi.nlm.nih.gov") ||
                    href.includes("doi.org")
                ) {
                    external.push({
                        "href": href,
                        "text": a.textContent.trim()
                    });
                }
            }

            return { title, external };
        }
        """
    )

    return data


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to supplement page
        page.goto(SUPPLEMENT_URL, wait_until="networkidle")

        # Scroll to help trigger lazy-loaded content
        for _ in range(8):
            page.mouse.wheel(0, 2000)
            page.wait_for_timeout(250)

        # 1) Collect study links from Examine Database
        study_links = collect_study_links(page)

        results = []
        for idx, study in enumerate(study_links, start=1):
            href = study["href"]
            label = study.get("text") or None

            print(f"[{idx}/{len(study_links)}] Fetching {href} ...", flush=True)

            study_info = extract_external_links_from_study(page, href)

            results.append({
                "examine_study_url": href,
                "label_on_supplement_page": label,
                "study_title": study_info.get("title"),
                "external_links": study_info.get("external", []),
            })

        browser.close()

    # Dump as JSON
    output = {
        "supplement_url": SUPPLEMENT_URL,
        "studies": results,
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
