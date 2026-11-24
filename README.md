# Lee Events – Website v3 (inspirat de pagina actuală)

Site static, fără instalări sau dependențe externe. Deschide `index.html` în browser sau folderul în VS Code și folosește Live Server.

## Galerie – cum adaugi fotografii
1. Copiază imaginile tale în `assets/gallery/` (ideal WebP/JPG, 1200px lățime).
2. Deschide `content.js`.
3. În lista `galerie`, adaugă o intrare cu calea fișierului, titlul și descrierea. Completează `alt` cu o descriere scurtă a ceea ce se vede în fotografie și, dacă le cunoști, adaugă dimensiunile reale în pixeli în `width` și `height`. Actualizează aceste trei câmpuri când înlocuiești o imagine demonstrativă.
4. Șterge fotografiile demonstrative dacă nu le dorești.

## Recenzii – cum adaugi testimoniale
În lista `recenzii` din `content.js`, completează numele, textul exact al recenziei, tipul evenimentului și numărul de stele.

```js
{ nume: 'Maria P.', text: 'Textul exact al recenziei', tipEveniment: 'Nuntă', stele: 5 },
```

## Alte modificări
- Culori și dimensiuni: `styles.css`.
- Textele secțiunilor și serviciilor: `index.html`.
- Comportament carusele, meniu și formular: `script.js`.
- Logo simplificat: `assets/lee-events-wordmark.png` (extras orientativ din captura furnizată; pentru cea mai bună calitate înlocuiește cu un SVG/PNG transparent original).
- Fundal hero: `assets/ambient-bg.webp` (derivat și estompat din captura furnizată; înlocuiește cu o fotografie reală fără text pentru un rezultat optim).

## Important
- Formularul deschide WhatsApp și necesită internet pentru trimitere; site-ul poate fi navigat offline.
- Linkurile sociale și mailto necesită internet / aplicație asociată.
- Fotografiile și recenziile sunt DEMO, nu materiale reale.
- Verifică toate informațiile și politica de confidențialitate înainte de publicare.


## Actualizare V4
Header fix la scroll, meniu cu secțiune activă, logo text fără cerc, iconuri SVG în butoane, tipografie serif în hero și galerie cu slide central mare. Fotografiile și recenziile se editează în `content.js`.


## Versiunea 6 – Despre Lee Events

Am revenit la V4 (fără video în fundal). În secțiunea Despre este inclus portretul `assets/dj-lee-portret.png`, alături de o descriere nouă. Pentru înlocuirea portretului, suprascrie fișierul cu o imagine cu același nume. Celelalte secțiuni au rămas nemodificate.

## Verificări SEO după publicare

1. În [Google Search Console](https://search.google.com/search-console), selectează proprietatea verificată pentru `lee-events.ro`. Dacă încă nu există, urmează pașii de verificare afișați de Google.
2. În raportul **Sitemapuri**, trimite `https://lee-events.ro/sitemap.xml`. Adresa din sitemap este aceeași cu adresa canonică a paginii.
3. În **Inspectarea adresei URL**, introdu `https://lee-events.ro/` și folosește **Testează adresa URL publicată**. Verifică dacă pagina poate fi indexată și apoi solicită indexarea. Urmărește starea în Search Console.
4. În [PageSpeed Insights](https://pagespeed.web.dev/), analizează `https://lee-events.ro/` în ambele rapoarte, **Mobil** și **Desktop**. Verifică LCP, CLS și INP, dacă există suficiente date de la utilizatori. Folosește diagnosticele Lighthouse pentru problemele reproductibile.
