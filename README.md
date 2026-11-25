# Lee Events – Website v3 (inspirat de pagina actuală)

Site static, fără instalări sau dependențe externe. Deschide `index.html` în browser sau folderul în VS Code și folosește Live Server.

## Galerie – fotografii și Reel-uri

Editează lista `galleryItems` din `content.js`. Ordinea intrărilor stabilește ordinea în grilă. Folosește un `id` unic și alege `layout` dintre `featured`, `wide`, `tall` și `standard`. Folosește `featured` pentru fotografia principală. Galeria afișează toate elementele configurate în fila corespunzătoare, „Fotografii” sau „Video”.

### Fotografie

Salvează miniatura și imaginea de rezoluție mare în `assets/gallery/`. Pentru miniaturi poți furniza variante WebP și câmpul opțional `srcset`. Completează dimensiunile reale ale imaginii mari în `width` și `height`.

```js
{
  id: 'nunta-01', type: 'image', layout: 'wide',
  title: 'Primul dans',
  description: 'Mirii deschid ringul de dans.',
  alt: 'Mirii dansează în mijlocul invitaților',
  thumbnail: 'assets/gallery/nunta-01-960.webp',
  src: 'assets/gallery/nunta-01-large.webp',
  srcset: 'assets/gallery/nunta-01-480.webp 480w, assets/gallery/nunta-01-960.webp 960w',
  width: 1920, height: 1080
},
```

### Reel sau postare Instagram

Salvează o miniatură locală în `assets/instagram/` și completează `instagramUrl` cu linkul public al postării sau al Reel-ului, din categoria `/p/` sau `/reel/`. Adaugă opțional `duration` și `alt`. Intrarea apare după completarea unui URL valid.

```js
{
  id: 'reel-nunta-01', type: 'video', layout: 'tall',
  title: 'Din spatele pupitrului',
  thumbnail: 'assets/instagram/reel-nunta-01.webp',
  instagramUrl: '', duration: '0:32'
},
```

## Recenzii – conținut, Spotlight și platforme

Editează lista `reviews` din `content.js`. Fiecare recenzie are un `id` unic, numele clientului în `author`, tipul în `eventType` și textul original în `review`. Spotlight afișează recenziile în ordine descrescătoare după numărul de caractere din text. Toate recenziile rămân accesibile prin derulare.
- Completează opțional `initials`, `location`, `source` (Google sau Facebook), `sourceUrl` și `rating` (1–5) când datele originale sunt disponibile. Câmpurile `date` și `photo` pot fi stocate pentru utilizare ulterioară.
- Păstrează formatul JSON al listei, cu ghilimele duble și fără virgulă după ultima intrare. După modificări, rulează `python3 tools/sync-reviews.py` pentru a actualiza varianta statică din pagină, folosită la indexare și când JavaScript este dezactivat.

Pentru ratingurile platformelor, editează `reviewPlatforms` în același fișier. `url` conține linkul public oficial, `rating` media din 5, `count` numărul de recenzii și `recommendation` procentul de recomandare, dacă platforma îl publică. Lasă valorile necunoscute la `null` și linkurile neconfirmate la șirul gol.

## Alte modificări
- Culori și dimensiuni: `styles.css`.
- Textele secțiunilor și serviciilor: `index.html`.
- Comportament galerie, recenzii, meniu și formular: `script.js`.
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
