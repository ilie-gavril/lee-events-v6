# Lee Events — reverificare SEO după publicare

Audit punctual pentru pagina unică `https://lee-events.ro/`. Concluziile despre producție provin din cereri HTTP publice și din HTML-ul primit de la server. Schimbarea de mai jos a fost aplicată în proiectul local.

| Zonă | Stare | Dovadă |
| --- | --- | --- |
| Răspunsuri HTTP | Confirmat | Pagina, robots.txt și sitemap.xml răspund 200. O adresă inexistentă răspunde 404. |
| Canonical | Confirmat | Pagina declară canonicalul `https://lee-events.ro/`. Variantele `http`, `www` și `/index.html` verificate ajung la el cu un singur redirect. |
| Indexabilitate tehnică | Confirmat | Googlebot este permis de robots.txt. Nu am găsit noindex în HTML sau X-Robots-Tag pe pagina principală. Sitemapul public este declarat în robots.txt și include pagina canonică. |
| Linkul din dialogul Instagram | Confirmat | Ancora `.gallery-video-link` are href în HTML-ul public. Verificarea statică nu a găsit ancore fără href sau linkuri către ID-uri interne lipsă. |
| Conținut și structură | Confirmat | Un H1, 18 întrebări FAQ și date JSON-LD interpretabile pentru Organization, WebSite și WebPage. Imaginile din HTML au atributul alt, inclusiv alt gol pentru elementele decorative. |
| Descoperirea imaginilor din Galerie | Confirmat | Sitemapul public conține pagina, fără imagini. Fotografiile de rezoluție mare sunt încărcate în lightbox la interacțiune. Am adăugat local cele nouă URL-uri WebP în sitemapul existent și am verificat că toate răspund în producție cu 200 și image/webp. |
| Indexare efectivă și Core Web Vitals | Neverificat | Indexarea și canonicalul ales de Google se verifică în proprietatea Search Console. API-ul PageSpeed a răspuns HTTP 429. TTFB observat într-o cerere publică a fost aproximativ 211 ms, fără a reprezenta o măsurătoare de teren. |

Extensia de imagini ajută la descoperirea fișierelor. Sitemapul rămâne asociat unei singure pagini canonice. [Documentația Google pentru sitemapuri de imagini](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)

Verificarea structurală a folosit biblioteca standard Python, deoarece parserul opțional al skill-ului necesită Beautiful Soup. Nu s-a făcut deploy și nu s-au modificat setările Cloudflare.
