"""Regenerate the static reviews from content.js. Run with python3 tools/sync-reviews.py."""

from html import escape
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
content = (root / "content.js").read_text(encoding="utf-8")
reviews = json.loads(content.split("/* reviews-data:start */", 1)[1].split("/* reviews-data:end */", 1)[0])

page = root / "index.html"
html = page.read_text(encoding="utf-8")
start = "                    <!-- reviews-fallback:start -->"
end = "                    <!-- reviews-fallback:end -->"
before, tail = html.split(start, 1)
_, after = tail.split(end, 1)

cards = []
for review in sorted(reviews, key=lambda item: len(item["review"]), reverse=True):
    author = escape(review["author"])
    text = escape(review["review"])
    details = escape(", ".join(filter(None, (review.get("eventType"), review.get("location")))))
    cards.append(
        '                    <article class="review-card">\n'
        f'                        <blockquote><p>{text}</p></blockquote>\n'
        f'                        <cite>{author}</cite>\n'
        f'                        <p class="review-meta">{details}</p>\n'
        '                    </article>'
    )

page.write_text(before + start + "\n" + "\n".join(cards) + "\n" + end + after, encoding="utf-8")
