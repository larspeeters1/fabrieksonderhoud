# Fabrieksonderhoud

Managementapplicatie ter ondersteuning van het onderhoud van een industrieel fabrieksterrein.
Het terrein bestaat uit meerdere fabriekshallen met apparaten (machines, lopende banden, verlichting)
waarop onderhoudsacties (controle, vervanging, herstelling) worden opgevolgd.

Examenproject 2e zittijd — Toegepaste Informatica, User Interfaces 3, KdG.

---

## Opstarten

```bash
npm install
npm run backend   # JSON server op http://localhost:3000
npm run dev       # frontend op http://localhost:5173
```

De backend draait op basis van `data.json` in de root van het project. Beide commando's
moeten gelijktijdig draaien (twee terminalvensters).

## Rollen / testgebruikers

Er is geen echte authenticatie. Op het loginscherm staan twee testknoppen die een
testgebruiker in de `AuthContext` plaatsen:

| Knop | Gebruiker | Rol |
|---|---|---|
| Log in als onderhoudsmedewerker | Jan Peters | `onderhoudsmedewerker` |
| Log in als beheerder | An Willems | `beheerder` |

De onderhoudsmedewerker bekijkt het terrein, filtert, gebruikt de inspectiemodus en kan
acties als uitgevoerd markeren. De beheerder kan daarnaast apparaten en onderhoudsacties
beheren (CRUD). Uitloggen verwijdert de gebruiker terug uit de context.

## Technologie

- React 19 + TypeScript (functional components, strict mode)
- Vite
- React Router — routing met bookmarkbare detail-URL's
- TanStack React Query — server state, mutaties en cache-invalidatie
- Material-UI (MUI) met een eigen theme (light/dark) + Archivo/Inter
- React Hook Form met `<Controller>` voor de MUI-formuliervelden
- Axios
- JSON server als gesimuleerde backend

## Projectstructuur

```
src/
├── components/   controls, dialogs, forms, layout, scenes
├── contexts/     AuthContext, SettingsContext
├── hooks/        query- en mutation-hooks, useAuth, useSettings, useLocalStorage
├── model/        types, filters, settings
├── pages/        één component per route
├── services/     axios-instance en API-calls per resource
├── theme/        MUI theme met design tokens
└── utils/        pure functies (datums, filters, statistieken, looproute)
```

---

## Uitdagingen & Prestaties

### Uitdagingen

**Filterlogica over twee weergaven.** De plattegrond- en lijstweergave van een hal werken op
dezelfde onderliggende data en moeten identiek reageren op de filters. De filterlogica zit
daarom volledig in pure functies (`filterUtils.ts`) die beide views voeden, in plaats van in
de componenten zelf. Een subtiel punt was het tijdsvenster: open acties waarvan de deadline
al voorbij is, moeten altijd zichtbaar blijven — die moesten immers al gebeuren.

**Klikpositie omzetten naar coördinaten.** Bij het toevoegen van een apparaat klikt de
beheerder op een positie in de hal. Die klik moest omgerekend worden naar x/y ten opzichte
van de linkerbovenhoek van de plattegrond, rekening houdend met scrollpositie en de
schaalfactor waarmee de plattegrond getekend wordt.

**De inspectieronde stabiel houden.** Zodra een actie als uitgevoerd wordt gemarkeerd,
invalideert React Query de cache en verandert de gefilterde dataset. Zonder ingreep zouden
de stappen van een lopende inspectieronde daardoor onder de gebruiker verspringen. De ronde
wordt daarom bij het starten vastgelegd; uitgevoerde stappen blijven zichtbaar met een
groene status.

### Waar ik trots op ben

- De plattegronden: hallen en apparaten worden op hun werkelijke positie getoond met een
  duidelijke urgentie-indicatie, en "toon op plattegrond" licht een apparaat tijdelijk uit
  zodat het snel te lokaliseren is.
- De inspectiemodus berekent een logische looproute op basis van de x/y-coördinaten
  (banden van boven naar onder, afwisselend links-rechts en rechts-links) in plaats van een
  willekeurige volgorde.
- De instellingen werken door in de hele applicatie: thema, standaard tijdsvenster,
  urgentie-indicaties en standaardweergave van een hal.

---

## ✅ Afgewerkte Functionaliteiten

- [x] [US1] Fabrieksterrein bekijken via een plattegrond
- [x] [US2] Fabriekshal bekijken in lijst- en plattegrondweergave
- [x] [US3] Apparaten zoeken, filteren en bekijken
- [x] [US4] Detailpagina van een apparaat bekijken
- [x] [US5] Inspectiemodus gebruiken om acties in een hal systematisch af te werken
- [x] [US6] Instellingen aanpassen om de applicatie af te stemmen op de gebruiker
- [x] [US7] Apparaten beheren (CRUD) — beheerder
- [x] [US8] Onderhoudsacties beheren (CRUD) — beheerder

Daarnaast:

- [x] Rollen via testknoppen, gebruiker en uitlogknop zichtbaar op elk scherm
- [x] Formuliervalidatie (verplichte velden, maximumlengtes, numerieke velden)
- [x] Loading-, error- en empty states
- [x] Responsief voor desktop, tablet en mobiel (plattegronden mogen scrollen)
- [x] Dark/light/system mode
- [x] Wireframes in `/wireframes`
- [x] Usability-testverslag in `/usability-tests.md`

---

## ❌ Onvoltooide / Geplande Functionaliteiten

- [ ] Echte authenticatie en autorisatie (OAuth): de rolcheck gebeurt enkel in de UI en valt
      buiten de scope van deze opdracht
- [ ] Meerdere fabrieksterreinen (multi-tenancy)
- [ ] Herhalende onderhoudsacties die na uitvoering automatisch een volgende actie inplannen
