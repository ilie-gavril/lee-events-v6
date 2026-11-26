"""Synchronize FAQ JSON-LD from the visible HTML: python3 tools/sync-faq-schema.py."""

import json
from html.parser import HTMLParser
from pathlib import Path
import re
import sys


class FaqParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.questions = []
        self.entry = None
        self.field = None

    def handle_starttag(self, tag, attrs):
        if tag == "details" and dict(attrs).get("name", "").startswith("faq-"):
            self.entry = {"summary": [], "p": []}
        elif self.entry is not None and tag in self.entry:
            self.field = tag
            self.entry[tag].append(" ")

    def handle_data(self, data):
        if self.field is not None:
            self.entry[self.field].append(data)

    def handle_endtag(self, tag):
        if tag == self.field:
            self.field = None
        if tag == "details" and self.entry is not None:
            question, answer = (
                " ".join("".join(self.entry[field]).split()) for field in ("summary", "p")
            )
            if not question or not answer:
                raise ValueError("Întrebare sau răspuns lipsă în FAQ.")
            self.questions.append({
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {"@type": "Answer", "text": answer},
            })
            self.entry = self.field = None


def main():
    page_path = Path(__file__).resolve().parents[1] / "index.html"
    original = page_path.read_bytes()
    html = original.decode("utf-8")
    faq = FaqParser()
    faq.feed(html)
    match = re.search(r'<script type="application/ld\+json">\n(.*?)\n    </script>', html, re.S)
    if not match or not faq.questions:
        raise SystemExit("Graful JSON-LD sau întrebările FAQ lipsesc.")
    graph = json.loads(match[1])
    page = next(node for node in graph["@graph"] if node["@id"] == "https://lee-events.ro/#webpage")
    if sys.argv[1:] == ["--check"]:
        if page.get("mainEntity") != faq.questions:
            raise SystemExit("FAQ din JSON-LD diferă de întrebările afișate.")
        print(f"{len(faq.questions)} întrebări sincronizate.")
        return
    page["mainEntity"] = faq.questions
    block = "\n".join("        " + line for line in json.dumps(graph, ensure_ascii=False, indent=2).splitlines())
    updated = html[:match.start(1)] + block + html[match.end(1):]
    if updated != html:
        page_path.write_bytes(updated.encode("utf-8"))
    print(f"{len(faq.questions)} întrebări sincronizate.")


if __name__ == "__main__":
    main()
