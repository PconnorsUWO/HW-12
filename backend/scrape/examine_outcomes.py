import json
from playwright.sync_api import sync_playwright

URL = "https://examine.com/supplements/vitamin-b12/?show_conditions=true"

def scrape_examine_database():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(URL, wait_until="networkidle")

        for _ in range(8):
            page.mouse.wheel(0, 2000)
            page.wait_for_timeout(250)

        data = page.eval_on_selector(
            "#examine-database",
            """
            (root) => {
                if (!root) return null;

                const tables = Array.from(root.querySelectorAll("table"));
                const out = [];

                for (const table of tables) {
                    let title = null;
                    let el = table;
                    while (el && el !== root) {
                        el = el.previousElementSibling || el.parentElement;
                        if (!el) break;
                        if (/H[1-6]/.test(el.tagName)) {
                            title = el.textContent.trim();
                            break;
                        }
                    }

                    const headers = [];
                    const headerRow = table.querySelector("thead tr");
                    if (headerRow) {
                        for (const th of headerRow.querySelectorAll("th")) {
                            headers.push(th.textContent.trim());
                        }
                    }

                    const rows = [];
                    const bodyRows = table.querySelectorAll("tbody tr");
                    for (const tr of bodyRows) {
                        const cells = Array.from(tr.querySelectorAll("td"))
                            .map(td => td.textContent.trim());
                        const rowObj = {};
                        headers.forEach((h, i) => {
                            rowObj[h || `col_${i}`] = cells[i] || null;
                        });
                        rows.push(rowObj);
                    }

                    out.push({
                        title,
                        headers,
                        rows,
                    });
                }

                return out;
            }
            """
        )

        browser.close()
        return data


def main():
    tables = scrape_examine_database()

    result = {
        "url": URL,
        "tables": tables
    }

    # Pretty-print JSON to stdout
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
