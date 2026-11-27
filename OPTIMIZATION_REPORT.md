# Lee Events — audit tehnic și pregătire pentru producție

Auditul din 26 noiembrie 2026 acoperă pagina unică din proiectul local și răspunsurile HTTP publice ale domeniului. Referința locală a fost starea curată a ramurii `main`, la `9e38aed`. Site-ul este HTML, CSS și JavaScript vanilla, cu scripturi încărcate prin `defer`, fonturi WOFF2 locale și resurse statice. Nu există un manifest de pachete, un build de producție, o configurație Wrangler sau o suită de teste în proiect. Utilitarul Python existent generează copia statică a recenziilor din `content.js`.

Versiunea de pe domeniul public diferă de proiectul local. Rezultatele „înainte” și „după” de mai jos provin din aceeași copie locală, cu și fără optimizări. Nu s-au făcut commit, push, publicare sau modificări în conturile externe.

## Constatări și priorități

| Prioritate | Încredere | Constatare și dovadă | Rezolvare |
| --- | --- | --- | --- |
| P1 | Confirmat | Pagina publică declară canonical către `https://www.lee-events.ro/`, dar acel URL redirecționează la `https://lee-events.ro/`. | Pagina locală păstrează canonicalul corect. După publicare, verifică dacă Google vede versiunea nouă. |
| P1 | Confirmat | Logoul încărcat la prima vizită avea 307.935 octeți și dimensiuni HTML declarate de 1021 × 285, deși fișierul are 1774 × 887. | WebP lossless cu fallback PNG și dimensiuni corecte. Logoul a fost verificat pixel cu pixel în fișier și prin capturi în Chrome. |
| P2 | Confirmat | Descrierea SEO afirma deplasarea în toată România, în timp ce secțiunea Servicii precizează că deplasarea depinde de locație. Dimensiunile din Open Graph erau, și ele, incorecte. | Aliniat titlul, metadatele și JSON-LD cu informațiile vizibile și dimensiunile reale. |
| P2 | Confirmat | Scriptul rescria stările de navigare la fiecare eveniment de scroll și recalcula lungimea textului recenziilor la fiecare comparație de sortare. | Actualizări DOM doar când valorile se schimbă și o singură evaluare a lungimii fiecărui text. |
| P2 | Confirmat | Linkurile dinamice ale recenziilor acceptau orice schemă URL din configurație. Antetele publice observate nu includeau explicit `X-Content-Type-Options` și `Referrer-Policy`. | Validare HTTPS pentru linkurile configurabile. Adăugat fișier local `_headers` pentru Cloudflare Pages, cu două directive compatibile cu integrările existente. |
| P2 | Confirmat | Robots public permite Googlebot, dar răspunsul primit nu includea linia `Sitemap`. Fișierul din proiect o include deja. | Păstrat fișierul local. Verifică răspunsul efectiv după publicare și setarea Managed Robots din Cloudflare. |
| P3 | Confirmat | `http://www.lee-events.ro/` parcurge două redirecturi. Canonicalul HTTPS fără `www` și celelalte variante au destinația corectă. | Opțional, consolidează ruta cu două redirecturi într-o singură regulă la nivel de edge. |
| De verificat | Necunoscut | LCP, INP și CLS în trafic real, rezultatele Lighthouse și comportamentul pe alte motoare de randare. | Testează după publicare și compară datele de laborator cu raportul de teren. |

## Modificări implementate

| Fișier | Schimbare |
| --- | --- |
| `index.html` | Logo WebP în antet, hero și footer prin `picture`, cu PNG original ca rezervă. Dimensiuni intrinseci corecte, prioritate ridicată pentru logo în hero și încărcare întârziată pentru portretul aflat sub hero. Textul din corpul paginii a fost comparat cu versiunea inițială și a rămas identic. |
| `index.html` | Titlu și descriere adaptate pentru căutările locale, sincronizate cu Open Graph și Twitter. Dimensiuni Open Graph corectate. JSON-LD cu o entitate `Organization`, catalogul existent de cinci servicii și noduri legate `WebSite` și `WebPage`. Au fost adăugate doar e-mailul și profilurile oficiale existente în pagină. |
| `styles.css` | O regulă aplicată pe wrapperul `picture`, ca să păstreze poziționarea imaginilor în layoutul existent. |
| `script.js` | Reduse scrierile DOM repetitive la scroll în navigare și în comenzile recenziilor. Lungimea fiecărei recenzii este calculată o singură dată, cu aceeași ordonare. Validare HTTPS pentru URL-urile configurabile ale recenziilor și anularea timerului de fallback când scriptul Instagram eșuează. |
| `assets/lee-events-wordmark.webp` | Derivat lossless 1774 × 887. Canalul alfa și valorile RGB ale tuturor pixelilor cu alfa nenulă coincid cu PNG-ul original. |
| `_headers` | `X-Content-Type-Options: nosniff` și `Referrer-Policy: strict-origin-when-cross-origin`. Se aplică atunci când proiectul este servit ca fișiere statice în Cloudflare Pages și fișierul ajunge în directorul de publicare. |
| `OPTIMIZATION_REPORT.md` | Audit, măsurători, limitări și pași operaționali. |

**Fișiere și dependențe eliminate:** zero. Nu s-au instalat biblioteci pentru site. PNG-ul original, imaginile sursă și fișierele fonturilor vechi rămân în repo. Browserul încarcă numai fonturile WOFF2 declarate în stylesheet.

## Dimensiuni și performanță

Dimensiuni în octeți. Coloanele gzip sunt măsurători locale ale fișierelor, nu dimensiuni de transfer de la CDN.

| Resursă | Brut înainte | Brut după | Gzip înainte | Gzip după |
| --- | ---: | ---: | ---: | ---: |
| HTML | 43.313 | 45.485 | 9.460 | 9.742 |
| CSS | 39.402 | 39.438 | 9.271 | 9.286 |
| JavaScript interactiv | 22.719 | 23.400 | 6.888 | 7.058 |
| Date JavaScript | 15.979 | 15.979 | 4.672 | 4.672 |
| Logo utilizat de Chrome | 307.935 | 172.820 | — | — |
| Directorul assets, inclusiv fișierele sursă | 35.339.954 | 35.512.774 | — | — |

Nu există bundle-uri generate. Cele două fișiere JavaScript livrate direct însumează 38.698 octeți înainte și 39.379 după. Validarea, actualizările condiționate și metadatele adaugă cod sursă. Reducerea principală vine din logo. În eșantionul reproductibil de la **1440 px**, Chrome a încărcat inițial **608.115 → 475.889 octeți** din resurse locale, aproximativ **−21,7%**, cu **19 cereri observate** în ambele rulări. Suma reprezintă dimensiunile fișierelor locale cerute, fără compresia HTTP sau costul real al rețelei. În toate rulările au fost observate între 19 și 20 de cereri inițiale, în funcție de momentul încărcării resurselor lazy și al faviconului.

### Măsurători locale înainte / după

Chrome headless, pagină deschisă prin `file:`, înălțime 900 px, DPR 1, câte o rulare de referință și una finală pentru fiecare lățime. Fără limitare artificială de procesor sau rețea. Valorile LCP sunt orientative și sensibile la variația rulărilor.

| Lățime | LCP înainte → după (ms) | CLS înainte → după | Pixeli diferiți în captura completă |
| ---: | ---: | ---: | ---: |
| 320 | 200 → 120 | 0 → 0 | 0,02917% |
| 375 | 48 → 76 | 0 → 0 | 0,02733% |
| 390 | 76 → 80 | 0 → 0 | 0,02665% |
| 430 | 56 → 68 | 0 → 0 | 0,02501% |
| 768 | 100 → 84 | 0 → 0,00347 | 0,02106% |
| 1024 | 84 → 52 | 0 → 0,00536 | 0,02637% |
| 1280 | 72 → 88 | 0 → 0 | 0,03005% |
| 1440 | 84 → 80 | 0 → 0 | 0,02654% |
| 1920 | 76 → 84 | 0 → 0 | 0,01934% |

Capturile au aceleași dimensiuni la toate lățimile. Diferențele se limitează la cel mult 1 din 255 pe canal, pe rânduri care intersectează zonele logo-ului. Testele s-au efectuat cu mișcarea redusă pentru a compara stări stabile. Cele două valori CLS nenule sub 0,006 sunt observații de laborator. Cauza lor nu a fost izolată într-o măsurătoare repetată, iar capturile finale și testele de încadrare nu arată o deplasare persistentă.

În răspunsul public măsurat separat, TTFB pentru pagina canonică a fost aproximativ **241 ms**, cu `CF-Cache-Status: HIT`. FCP a fost disponibil doar în unele rulări locale, cu intervale 48–100 ms înainte și 52–120 ms după. INP, TBT și valori pe teren nu au fost măsurate. Lighthouse și Lighthouse CI nu sunt disponibile în mediul de lucru, iar API-ul public PageSpeed Insights a răspuns cu HTTP 429. Niciun scor Lighthouse nu este raportat. [Definiții și praguri Core Web Vitals](https://web.dev/articles/vitals)

## Verificări funcționale și accesibilitate

- Cele nouă lățimi au trecut înainte și după pentru navigare, filtrele galeriei, lightbox, schimbarea fotografiei și revenirea focusului, controlul recenziilor, FAQ, preselectarea categoriei Corporate și compunerea mesajului WhatsApp. Fără depășire pe orizontală sau excepții JavaScript în fluxurile testate. WhatsApp a fost interceptat local, fără trimitere de mesaje.
- Testul de integrare Instagram a simulat eșecul scriptului extern. Prima cerere a fost inițiată la interacțiune, iar linkul direct și demontarea conținutului din modal au funcționat. Disponibilitatea reală a fiecărui embed, comportamentul cu cookie-uri terțe blocate și redarea clipurilor rămân de verificat în browserele vizate.
- Test de tastatură în Chrome la 390 și 1440 px. Am verificat accesul prin Tab la linkul de salt, Esc și revenirea focusului din lightbox, săgețile pentru tipul de eveniment și navigarea prin recenzii.
- Verificare statică a etichetelor, ID-urilor, ancorelor și imaginilor. Un H1, `lang="ro"`, viewport fără blocarea zoomului, ancore locale valide, atribute `alt` prezente și `noopener` pentru linkurile care deschid file noi. Cele 11 recenzii statice conțin același text, autor și tip de eveniment ca ieșirea utilitarului de sincronizare, după normalizarea spațiilor.
- Cross-browser. Chrome macOS testat. Safari macOS este instalat, dar WebDriver a refuzat sesiunea cu Remote Automation dezactivat. Safari iOS, Chrome Android real, Firefox, Edge, Samsung Internet și Opera nu au fost executate. Emularea lățimii în Chrome nu confirmă comportamentul pe dispozitive reale. Testarea cu cititor de ecran, safe areas iOS și o certificare WCAG 2.2 AA completă rămân deschise.
- Nu există dependențe declarate pentru auditare prin npm și nu sunt configurate build, lint, type checking, teste unitare sau Playwright în proiect. Validarea HTML locală a fost structurală, nu o rulare a validatorului Nu HTML. Parserul din skill-ul SEO necesită Beautiful Soup, absent din mediu, așa că verificările au fost efectuate cu parserul HTML și XML din biblioteca standard și cu Chrome.

## SEO, indexare și livrare

- Local, canonical, Open Graph și sitemap indică `https://lee-events.ro/`. Sitemapul are o singură adresă canonică. Nu sunt prezente directive locale `noindex` și verificarea robots permite Googlebot. Sunt prezente în HTML conținutul principal, FAQ și recenziile statice.
- JSON-LD parsează ca JSON, are ID-uri referențiate coerent și păstrează cinci servicii confirmate. Au fost evitate adresa fizică fictivă, datele de preț, stelele din recenzii proprii și schema neeligibilă ori nejustificată pentru FAQ sau clipurile terțe. [Documentația Google pentru Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)
- Pe domeniul public, pagina, robots și sitemap au răspuns 200. O cale inexistentă a răspuns 404 real. HTTPS fără `www` este destinația finală. Versiunile HTTP fără `www` și HTTPS cu `www` au câte un 301, iar HTTP cu `www` are două 301. Răspunsul public servește gzip și HTTP/2 și anunță HTTP/3 prin `Alt-Svc`. Funcționarea efectivă prin QUIC, Brotli, cache-ul originului și setările din dashboard nu au fost verificate din cont.
- Resursele și ancorele locale au fost verificate. Pentru linkurile externe, testul a acoperit forma URL-urilor și comportamentul local al integrărilor. Disponibilitatea tuturor paginilor de pe platformele terțe nu este confirmată.
- Fișierele HTML și resursele fără versiune păstrează revalidarea existentă. O politică `immutable` ar avea sens doar pentru nume amprentate. Critical CSS, minificarea automată, generarea statică a galeriei și schimbarea strategiei de fonturi au fost lăsate în afara acestei intervenții. Într-un site mic, fără build, beneficiile lor trebuie măsurate înainte de a schimba ordinea de încărcare sau aspectul primei randări.
- CSP rămâne o verificare ulterioară cu raportare. Pagina folosește un script inline pentru restaurarea scrollului și încarcă embedul Instagram la cerere. O politică restrictivă fără teste pe preview ar putea întrerupe aceste funcții. Nu au fost aplicate directive noi care să limiteze iframe-urile, cookie-urile terțe sau permisiunile platformei.

## Pași manuali în Cloudflare

1. Confirmă metoda de găzduire din dashboard. Pentru Pages static, publică directorul care conține `index.html`, `assets/`, `styles.css`, `content.js`, `script.js`, `robots.txt`, `sitemap.xml` și `_headers`. Verifică într-un preview dacă antetele sunt prezente la răspuns. Dacă site-ul este servit prin Worker sau de la un origin separat, configurează aceleași două antete în acel strat după validarea integrărilor. [Antete Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/)
2. Verifică în preview HTTPS, autentificarea acolo unde se aplică, MIME-urile CSS/JS, încărcarea embedului, codurile 200/404 și cache-ul HTML. Păstrează revalidarea resurselor fără amprentă. Dacă un preview este public la o adresă de test, verifică ce reguli îl protejează de indexare, fără să aplici accidental acele reguli pe domeniul final. [Servirea fișierelor în Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
3. După publicare, verifică versiunea servită efectiv și canonicalul. Controlează dacă robots gestionat de Cloudflare păstrează linia `Sitemap` și verifică încă o dată accesul Googlebot. Dacă este util, consolidează redirectul `http://www` într-un singur 301 spre HTTPS fără `www`. Nu sunt necesare modificări ale DNS-ului sau ale configurației de e-mail pentru aceste verificări.
4. Dacă vei introduce un build cu nume amprentate, aplică cache de lungă durată doar acelor fișiere. Compară gzip și Brotli și verifică HTTP/3 pe un client cu suport QUIC, folosind domeniul public.

## Pași manuali în Google Search Console

1. Selectează proprietatea verificată pentru `lee-events.ro`. În **Sitemaps**, trimite `https://lee-events.ro/sitemap.xml`. [Ghidul Google pentru sitemapuri](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
2. În **Inspectarea adresei URL**, introdu `https://lee-events.ro/` și selectează testarea URL-ului publicat. Confirmă răspunsul 200, accesul la CSS și JS și canonicalul fără `www`. Când versiunea nouă este vizibilă, solicită indexarea și urmărește canonicalul ales de Google. [Solicitarea recrawlării](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
3. Urmărește rapoartele de indexare și Core Web Vitals. Rulează PageSpeed Insights pentru mobil și desktop după publicare. Compară măsurătorile de laborator în aceleași condiții și urmărește separat datele reale când devin disponibile.

## Mentenanță

- După editarea recenziilor, rulează `python3 tools/sync-reviews.py` și verifică textul static înainte de publicare.
- Când înlocuiești o imagine, păstrează fișierul sursă, verifică dimensiunile și textele alternative și compară capturile la mobil și desktop. Menține thumbnail-urile locale pentru Instagram.
- Prioritizează testarea manuală în Safari/iOS și Firefox, inclusiv cu cookie-uri terțe blocate. Rulează Lighthouse pe un preview apropiat de producție înainte de a decide dacă merită minificarea printr-un build separat, Critical CSS sau o politică CSP.

---

# Lighthouse Final Optimization — 27 noiembrie 2026

## Referință și scop

Rezultatele de producție furnizate în cerere pentru Chrome Guest Mode sunt Performance 96, Accessibility 100, Best Practices 81, SEO 100, FCP 1,1 s, LCP 2,8 s, Speed Index 1,1 s, TBT 0 ms, CLS 0,002 și răspuns de server 49 ms. Exportul Lighthouse complet nu a fost disponibil ca fișier în workspace. Comparația controlată de mai jos a fost măsurată independent, pe două copii locale ale aceleiași pagini, fără scripturile injectate de Cloudflare.

## Schimbări și dimensiuni

- `index.html` folosește `srcset` și `sizes` pentru logo în antet, hero și footer, cu fallback-ul PNG existent. Portretul are variante WebP responsive și își păstrează `loading="lazy"`, dimensiunile intrinseci și fișierul original ca rezervă. Logoul din hero rămâne eager, cu prioritate ridicată.
- `assets/responsive/` conține 7 variante WebP lossless ale logoului (160–1260 px) și 4 variante WebP ale portretului (360–720 px). Originalele celor două imagini sunt păstrate. Varianta completă de 900 px a portretului poate fi aleasă pe ecrane dense, inclusiv când imaginea este decupată prin `object-fit: cover`.
- `index.html` preîncarcă numai subseturile Latin (21.032 octeți) și Latin Extended (17.648 octeți) de Space Grotesk, folosite în sloganul LCP, inclusiv pentru diacritice. Cererile folosesc `crossorigin` și `fetchpriority="low"`. Prima probă CDP cu prioritatea implicită a întârziat CSS-ul în condiții de rețea limitată. Configurația cu prioritate redusă a fost cea verificată prin Lighthouse. Manrope, `unicode-range` și `font-display: swap` au rămas intacte. Sloganul este în HTML și stabilirea textului său nu depinde de JavaScript sau de o animație de intrare.
- `styles.css` rămâne sincron și neschimbat. CSS-ul public este comprimat gzip. Nu s-a introdus încărcare asincronă sau Critical CSS. Fonturile publice sunt servite cu `max-age=0, must-revalidate`. S-a păstrat revalidarea URL-urilor fără amprentă, pentru actualizări sigure.
- `OPTIMIZATION_REPORT.md` păstrează auditul anterior și înregistrează această rundă de verificări.

Dimensiuni ale resurselor efectiv selectate în Lighthouse, în octeți:

| Resursă | Înainte | Mobil după | Desktop după |
| --- | ---: | ---: | ---: |
| Logo hero | 172.820 | 19.016 | 19.016 |
| Logo antet | Refolosea fișierul de mai sus | 7.408 | 3.684 |
| Portret | 87.646 | 79.600 | 46.670 |
| Totalul fișierelor de imagine din tabel | 260.466 | 106.024 | 69.370 |

Totalul scade cu circa 59% pe mobil și 73% pe desktop în aceste configurații. Alegerile browserului pot varia cu DPR și dimensiunea ecranului. În testul separat CDP la 768 px/DPR 2, logoul din hero a ales 30.974 de octeți, iar portretul a păstrat originalul de 87.646 de octeți.

## Lighthouse local, mediană din trei rulări înainte și trei după

Lighthouse CLI 12.8.2, Chrome headless fără extensii, preset implicit mobil și preset desktop. Copiile au fost servite de pe loopback cu gzip pentru resursele text, în aceleași condiții pentru fiecare pereche. Node și Lighthouse au fost instalate într-un director temporar de test, în afara proiectului. Rulările locale nu includ CDN-ul, latența vizitatorilor sau scriptul de securitate Cloudflare. [Ghidul Chrome despre variația măsurătorilor Lighthouse](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-variability)

| Indicator | Mobil înainte → după | Desktop înainte → după |
| --- | ---: | ---: |
| Performance | 94 → 99 | 100 → 100 |
| Accessibility | 100 → 100 | 100 → 100 |
| Best Practices | 100 → 100 | 100 → 100 |
| SEO | 100 → 100 | 100 → 100 |
| FCP | 1,50 → 1,35 s | 0,36 → 0,36 s |
| LCP | 3,08 → 2,06 s | 0,70 → 0,47 s |
| Speed Index | 1,50 → 1,35 s | 0,36 → 0,36 s |
| TBT | 0 → 22 ms | 0 → 0 ms |
| CLS | 0,00266 → 0,00144 | 0,00405 → 0,00133 |

LCP a fost sub 2,5 s în măsurătorile finale locale. Rezultatele publice după publicare și datele reale Core Web Vitals rămân de verificat.

## Regresii, SEO și limite

- **Vizual.** Am comparat capturile înainte și după la 390, 768 și 1440 px. Coordonatele și dimensiunile celor trei imagini verificate au coincis în măsurătorile CDP. Variantele redimensionate pot avea diferențe fine de eșantionare a pixelilor. Nu am observat diferențe de încadrare sau poziție. Verificarea structurală a confirmat că HTML-ul este identic în afara atributelor de încărcare. CSS, JavaScript, texte, fonturi și dimensiuni au rămas intacte.
- **Funcțional.** Au trecut înainte și după, la cele trei lățimi, navigarea, filtrele galeriei, lightbox-ul, revenirea focusului, comenzile recenziilor, FAQ-ul, preselectarea tipului de eveniment și compunerea mesajului WhatsApp. Instagram a fost simulat pentru testarea încărcării la cerere și a închiderii dialogului. Mesajul WhatsApp a fost interceptat local. Nu au apărut excepții JavaScript în fluxurile testate.
- **SEO public și local.** Pagina, robots.txt și sitemapul public răspund 200. O cale inexistentă răspunde 404. Variantele HTTP, WWW și /index.html verificate redirecționează într-un singur pas spre HTTPS fără WWW. Sitemapul are o pagină canonică și nouă imagini, fără lastmod. Googlebot este permis. Nu s-au găsit directive noindex pe pagina principală. Titlul, meta description, Open Graph, canonicalul și graful JSON-LD au rămas intacte, iar cele 23 de întrebări FAQ sunt sincronizate.
- **Cloudflare.** Avertismentul public `StorageType.persistent is deprecated` este atribuit în raportul furnizat scriptului injectat `/cdn-cgi/challenge-platform/scripts/jsd/main.js`. API-ul semnalat nu apare în codul propriu. Scorul Best Practices 100 local nu confirmă dispariția avertismentului în producție. Setările Cloudflare, DNS și email routing nu au fost modificate.
- **Cross-browser.** Chrome macOS a fost testat, cu emulare mobil și tabletă. Safari WebDriver a refuzat sesiunea deoarece Remote Automation este dezactivat. Firefox, Edge, iOS Safari și Android Chrome nu au fost executate în acest mediu. Compatibilitatea pe dispozitive reale rămâne de verificat.
- **Starea proiectului.** Nu s-a făcut commit, push sau deployment. Ștergerile preexistente ale celor nouă fișiere JPG din galerie au fost lăsate intacte. Site-ul folosește variantele WebP separate.
