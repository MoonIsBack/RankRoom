# Komponenten — Übersicht

## Wofür ist das?

Eine Landkarte aller sichtbaren Bausteine. Details stehen jeweils auf eigenen Seiten.

## Hauptkomponenten (`src/components/`)

| Datei | Zeilen | Was macht sie? |
|---|---|---|
| `AppHeader.vue` | 672 | Kopfzeile, Logo, Burger-Menü |
| `HeroSection.vue` | 157 | Begrüßungstext + Karte „Aktuelle Liste" |
| `StatsGrid.vue` | 86 | Drei Zahlen-Kacheln |
| `TierRow.vue` | 378 | **Eine** Reihe (S, A, B …) |
| `TierRowSettingsPopover.vue` | 341 | Zahnrad-Menü einer Reihe |
| `ItemCard.vue` | 507 | **Eine** Karte |
| `ItemPool.vue` | 105 | Der Bereich unten mit unsortierten Items |
| `AddItemForm.vue` | 454 | „Bilder auswählen" + Namensfeld |
| `AppFooter.vue` | 161 | Fußbereich mit Rechtslinks |
| `PreviewBadge.vue` | 157 | Schwebender Hinweis im Vorschau-Modus |

## Popups (`src/components/modals/`)

| Datei | Wofür? |
|---|---|
| `BaseModal.vue` | ⭐ Grundgerüst für **alle** Popups |
| `ResetModal.vue` | „Wirklich zurücksetzen?" |
| `SavedListsModal.vue` | Gespeicherte Tierlisten |
| `NewTierListModal.vue` | Neue Liste anlegen |
| `FileNoticeModal.vue` | „Diese Dateien wurden übersprungen" |
| `InfoModal.vue` | Einfacher Hinweis mit „Verstanden" |
| `ExportImageModal.vue` | Bild-Export mit Vorschau |
| `LocalDataModal.vue` | Lokale Daten anzeigen/löschen |

## Rechtsseiten (`src/components/legal/`)

| Datei | Wofür? |
|---|---|
| `LegalModal.vue` | Gemeinsamer Textrahmen |
| `PrivacyPolicy.vue` | Datenschutzerklärung |
| `ImprintInfo.vue` | Impressum |
| `TermsOfUse.vue` | Nutzungsbedingungen |
| `ContactInfo.vue` | Kontakt |
| `CookieSettings.vue` | Cookie-Demo (ohne Wirkung) |

## Wie sie ineinander stecken

```
App.vue
├── AppHeader
├── main
│   ├── HeroSection
│   ├── StatsGrid
│   ├── TierRow  (mehrfach)
│   │   ├── ItemCard  (mehrfach)
│   │   └── TierRowSettingsPopover
│   ├── AddItemForm
│   ├── ItemPool
│   │   └── ItemCard  (mehrfach)
│   └── alle Popups
├── AppFooter
├── PreviewBadge
└── Teleport → schwebende ItemCard beim Ziehen
```

## ⭐ Die zwei wichtigsten

**`BaseModal.vue`** — jedes Popup baut darauf auf. Änderst du dort etwas, ändert
sich alles gleichzeitig. Das ist Segen und Fluch.

**`ItemCard.vue`** — wird an drei Stellen verwendet:
1. Im Pool
2. In den Reihen
3. Als schwebende Kopie beim Ziehen

Deshalb hat sie so viele Eigenschaften (`floating`, `dimmed`, `placeholder` …).

## 💡 Merken

**Faustregel:** Eine Komponente sollte nur **anzeigen** und **melden**.
Sobald sie anfängt zu rechnen oder zu speichern, gehört das eigentlich in ein
Composable.

Beispiel: `ItemPool.vue` hat genau ein `computed` — und das entscheidet nur, ob
ein Rahmen hervorgehoben wird. Genau richtig.
