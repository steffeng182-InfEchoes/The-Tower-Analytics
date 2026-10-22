# Account Intelligence 2.0 — Umsetzung und Abnahme

Entwicklung auf `feature/account-intelligence-2`, ausgehend vom produktiven `main` (`769732b`), [Pull Request #7](https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/pull/7). Kein Merge und kein produktives Deployment. Guild-Branch und PR #6 wurden nicht verändert. Die neuen Funktionen stehen tatsächlich im Account-Tab des Beta-Builds zur Verfügung.

## Meilensteine

| Bereich | Ergebnis | Grenze |
| --- | --- | --- |
| A — Labs | Screenshot → bearbeitbare Sammelprüfung → atomare bestätigte Speicherung → Verlauf → Bonus-Engine → Reload getestet | Unlesbare Werte und nicht verifizierte Formeln bleiben unbekannt |
| B — Relics | Eigenständiger OCR-Import, Symbolvergleich, Besitzprüfung, Sammelspeicherung, Reload und Bonusaggregation getestet | Zwölf Bildreferenzen; unbekannte oder uneindeutige Symbole werden nicht geraten |
| C — weitere Systeme | Geprüft und bewusst zurückgestellt; alte manuelle Datensätze bleiben nutzbar | Keine neuen unfertigen Card-/UW-/Module-/Bot-/Guardian-Importer |
| D — Bonus-Engine | Gemeinsame Effekt-IDs, Rechenregeln, Herkunft, Version und automatische Neuberechnung integriert | Teilboni statt erfundener vollständiger Kampfwerte |
| E — Dashboard | Bestand, bekannte Boni, Herkunft, Verlauf, Datenqualität und Report-Zeitbezug aus gespeicherten Daten | Keine kausale Leistungs- oder unbelegte Account-Stärkebewertung |

## A — Tatsächliche Labs-Erkennung

Die App verwendet die bestehende echte Tesseract-Worker/WASM-Pipeline. Ungeprüfte Vorschläge schreiben keine Account-Werte. Level, sichtbarer Effekt und Bestätigung sind kompakt editierbar; Zuordnung, Status und OCR-Beleg bleiben aufklappbar. Mehrere geprüfte Zeilen werden gemeinsam gespeichert. Falsche Lab-Zuordnungen und Zahlen sind korrigierbar. Ein niedrigerer bestätigter Level benötigt eine ausdrückliche Korrekturmarkierung.

Reale Bildtests:

- `labs-real-list.jpg`: echter zweispaltiger **Select Research**-Screenshot. Erkannt wurden unter anderem Starting Cash, Workshop Defense Discount, Workshop Utility Discount, Damage, Attack Speed, Critical Factor, Range, Damage / Meter und Super Crit Chance. Die neun tatsächlich lesbaren Zeilen werden nicht mit einer vollständigen Erfassung aller sichtbaren/dunklen Felder gleichgesetzt.
- Attack Speed zeigt Ziel-Level52 und aktuellen Effekt x2.02; Critical Factor Ziel-Level35 und aktuellen Effekt x2.02. Daraus entstehen ausschließlich **prüfpflichtige** Vorschläge für aktuelle Levels51 beziehungsweise34. Ziel-Level, aktueller Effekt und hinterlegte Formel müssen übereinstimmen. Der Browser-Test bestätigt diese zwei Werte ausdrücklich, speichert sie, lädt neu und prüft die resultierenden Faktoren x2.02.
- Der vorhandene echte Game-Speed-/Rush-Screenshot bleibt Ziel-Level7 bei **unbekanntem abgeschlossenen Level**. Eine willkürliche Halbierung des Bildes darf diese Information nicht ersetzen.

Zusätzlich erzeugen die Tests realitätsgetreue dunkle Rasterbilder mit Orb Speed20/+2.00, Critical Factor28/x1.84 und Lab Speed40/x1.80. Korrektur auf41/x1.82, späterer Screenshot42/x1.84 und manuelle Änderung43 werden über echte UI-/Speicher-/Berechnungswege geprüft. Diese Zahlen sind ausschließlich Testdaten, niemals angenommene Werte des Hauptnutzers. Die OCR-Ausgaben sind nicht gemockt.

Bestätigte Zustände besitzen stabile Spiel-ID, Level/Wert, bestätigten sichtbaren Effekt, Erfassungs- und Gültigkeitsdatum, Quelle, Bestätigungsstatus, Wissensversion, Revision und gegebenenfalls Vorgänger-ID. Ein Wiederholungsimport desselben Zustands erzeugt keine zusätzlichen Bonusquellen. Abweichende OCR-Lesarten bleiben sichtbar. Nicht erkannte Labs werden nicht ergänzt.

## B — Tatsächliche Relics-Erkennung

`relics-real-shop.png` ist ein echter öffentlicher Spiel-Screenshot. Die echte Text-OCR erkennt **Falling Apple, Haunted Mirror, 3 Body Solution und Crop Circle**. Im Test werden Besitz beziehungsweise Nichtbesitz ausdrücklich ausgewählt, vier Zustände gespeichert und nach Reload gegen die Bonus-Engine geprüft. Das ist ein Testaccount; ein Shopbild selbst beweist niemals einen Kauf oder Besitz.

Für reine Symbolbilder kann der Nutzer ein Raster und dessen Bildausschnitt einstellen. Der lokale Vergleich sucht innerhalb jeder Zelle nach mittigen Symbolen verschiedener Größe und prüft Ähnlichkeit sowie Abstand zur nächstbesten Referenz. Im tatsächlichen Shop-Screenshot werden **Falling Apple und Haunted Mirror** visuell zugeordnet. Die beiden unteren Symbole bleiben beim geprüften Gesamtausschnitt ungeklärt; deren korrekte Text-OCR wird nicht als erfolgreicher Symbolvergleich ausgegeben.

Eine weitere Rasterprüfung mit echten Spielgrafiken erkennt Flux, Lumin und Pulse ohne Textnamen. Überlappende Imports zählen bereits vorhandene Relics nicht erneut. Unbekannte Symbole bleiben ungeklärt und können manuell zugeordnet werden. Jede Zuordnung braucht weiter Besitzwahl und Bestätigung.

Die zwölf unveränderten Bildreferenzen sind mit Ursprung, Lizenz und überprüften Original-Git-Checksummen unter `account/references/` gebündelt. Der Symbolvergleich braucht keinen fremden Bildserver. Siehe [Bildherkunft](../tests/fixtures/SOURCES.md) und [Lizenz-/Quellennachweise](THIRD_PARTY_LICENSES.md). Unbekannte Relics bekommen keine erfundenen Boni.

## C — Weitere Systeme und Workshop

Cards benötigen zuverlässige Level- und Ausrüstungsnachweise; UW, Modules, Bots und Guardians zusätzlich kontextspezifische Rechenregeln und repräsentative Bilder. Diese automatischen Erfassungen sind zurückgestellt. Vorhandene manuelle Einträge bleiben lesbar, im Verlauf und in Backups erhalten; die neue Engine kennzeichnet ihre Berechnung als nicht integriert. Der alte experimentelle Bereich bleibt nachgeordnet und eingeklappt.

Workshop-Screenshot-Levelerkennung und Levelrückrechnung sind nicht implementiert. Die Engine führt flache Zuschläge, Prozentgruppen, Faktoren und fehlende Grundwerte getrennt, sodass spätere eindeutige oder mehrdeutige Rückrechnungen darauf aufbauen können. Es gibt keine automatische Bestätigung rückgerechneter Workshop-Level.

## D — Rechenregeln und Quellen

Version `2026-10-22.1`. Quellen: [TheTowerSDK, unveränderliche Revision](https://github.com/TmRxJD/TheTowerSDK/tree/6a6d3bc9101d68ad65b355122c6fe66af0a4610f/src/data) und die [dokumentierte Relics-Gruppierung](https://the-tower-idle-tower-defense.fandom.com/wiki/Relics). Die verwendeten Lab-`base`-/`value`-Felder wurden in der Quelle geprüft. Es handelt sich um nachvollziehbare Community-Daten, keinen offiziellen automatischen Spielversionsfeed.

| Quelle | Unterstützte Regel |
| --- | --- |
| Lab Speed, Attack Speed, Coins/Kill | 1 + 0.02 × Level |
| Critical Factor, Health | 1 + 0.03 × Level |
| Damage | 1 + 0.02 × Level |
| Orbs Speed / Alias Orb Speed | flacher Zuschlag 0.1 × Level |
| Unterstützte gleichartige Relics | Prozentwerte zunächst addieren |
| Passender Lab-Faktor und Relics-Gruppe | Lab-Faktor × (1 + Summe der Relic-Prozente) |

Unterstützte Relic-Prozentarten: Coins, Health, Damage, Orb Speed, Lab Speed, Attack Speed und Critical Factor. Beispiel ausschließlich als Rechentest: Coins2% + Coins5% ergeben Faktor1.07; Lab Speed1.80 und Relic-Lab-Speed1.5% ergeben1.827. Der Coins/Kill-Lab-Faktor und der allgemeine Coins-Relic-Faktor werden getrennt ausgewiesen; daraus wird kein vollständiger Coin-Ertrag erfunden.

Orb Speed erhält keinen exakten Gesamtwert, solange Workshop-Grundwert und weitere Einflüsse fehlen. DW Health, Wall Rebuild in Sekunden, Super Critical Chance und andere nicht verifizierte Regeln bleiben ausdrücklich unbekannt. Eine pauschale Prozentverknüpfung wäre dafür nicht belegt. Bei Lab Speed weist die Ansicht auf die Sonderbehandlung der Lab-Speed-Forschung selbst hin; die App berechnet keine unbewiesenen Forschungszeiten.

Nur bestätigte aktuelle Zustände tragen bei. Explizite alte deutsche/englische Besitzangaben bleiben kompatibel. Historische Wiederholungen zählen einmal. Unbestätigte OCR, Schätzungen, zukünftige Gültigkeitsdaten und widersprüchliche Level-/Effektpaare liefern keinen scheinbar gesicherten Bonus. Jeder Beitrag zeigt Datensatz-ID, Datum, Quelle, Regel und Wissensstand.

## E — Dashboard und Report-Verbindung

Die Account-Übersicht zeigt gespeicherte Lab- und Relic-Zahlen, weitere manuell erfasste Systeme, letzten bestätigten Stand, berechenbare Teilboni, unbekannte Regeln, Widersprüche und frühere Werte. Ein klar beschrifteter 30-Tage-Prüfhinweis bedeutet nicht, dass ein alter Wert falsch ist. Neue Lab-/Relic-Bestätigungen und Änderungen im bestehenden manuellen Formular berechnen die Ansicht sofort neu, ohne weiteren Import.

Ein echter gespeicherter Battle Report kann ausgewählt werden. Seine tatsächliche Spielzeit begrenzt den angezeigten Account-Stand. Später dokumentierte Werte werden nicht in frühere Runs zurückprojiziert. Die Tests prüfen diesen Ablauf mit einem tatsächlichen gespeicherten Report. Keine Aussage über kausale Upgrade-Wirkungen.

## Datenbestand und unabhängige Schichten

- `account/core.js`: reine Erkennungsauswertung, Modellvalidierung, Verlaufsauswahl und Bonusberechnung; ohne DOM/IndexedDB testbar.
- `account/relic-vision.js`: lokale Bildreferenzen und Mustervergleich.
- `account/app.js`: nutzbare Oberfläche, explizite Prüfung und Adapter zur bestehenden App.
- Der schmale Adapter in `index.html` fügt bestätigte Zustände in einer einzigen IndexedDB-Transaktion ein. Parser und Farming-Regeln wurden nicht umgeschrieben.

`tower-analytics-alpha` bleibt **Version2** mit denselben Stores und Schlüsseln. Kein Start-Backfill, keine Datenbanklöschung und keine destruktive Schemamigration. Runs werden durch Account-Imports nicht geschrieben. Historische Account-Zustände werden angehängt. Die bestehende Account-JSON-Sicherung erhält alle zusätzlichen Felder; vorhandene Backups bleiben importierbar.

Die Account-Wiederherstellung liest vorhandene IDs und fügt fehlende Einträge innerhalb derselben Transaktion ein. Vorhandene IDs bleiben unverändert; doppelte IDs innerhalb einer Sicherung werden abgewiesen. Ein Browser-Test provoziert einen konkurrierenden Schreibzugriff aus einem zweiten Tab und prüft, dass dessen Wert erhalten bleibt. Zusätzlich wird die gesamte Labs-/Relics-Sicherung in einer frischen Browser-Datenbank wiederhergestellt und nach Reload geprüft.

Screenshots des Nutzers werden weder hochgeladen noch dauerhaft gespeichert. Die erste Text-OCR benötigt weiterhin die vorhandenen externen Tesseract-CDN-Assets; Fehler werden angezeigt. Zu große oder beschädigte Bilder werden abgefangen. Die gebündelten Testbilder sind öffentlich belegte Spielszenen, keine privaten Nutzerscreenshots.

## Tatsächliche Tests und reproduzierbarer Build

Bestätigt auf Anwendungskommit `54763045`: [vollständiger grüner Lauf39838285527](https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/actions/runs/39838285527): **60 bestehende Tests, 16 zusätzliche Kerntests**, bestehende mobile Browserregression, beide echte OCR-Suiten und kompletter neuer Account-Browserfluss. Dazu gehören echte Mehrzeilen-/Mehrspaltenbilder, korrigierte Angaben, Sammelbestätigung, Wiederholungsimport, Aktualisierung, Reload, Bonusregeln, unbestätigte/fehlende Werte, Duplikatschutz, Bestandsdatenerhalt, 320/384/412px, unscharfe/abgeschnittene/leere/beschädigte Rasterbilder, Backup/Rückimport, frische Datenbank und konkurrierender Tab. Die kompakte Prüfoberfläche ist in diesem Lauf mitgeprüft. Ein späterer Abschlusscommit ändert nur diesen Bericht; die App-Dateien entsprechen weiterhin dem genannten geprüften Anwendungskommit.

[Getestetes Beta-Paket](https://github.com/steffeng182-InfEchoes/The-Tower-Analytics/actions/runs/39838285527/artifacts/12452336432), SHA256 `15b8fd65755d951d56c5eac1e4731744842aee999b009c0dc49dae63340960b5`. Ein gleichnamiges neueres Paket steht nach einem erfolgreichen aktuellen PR-Check im jeweiligen Workflow-Lauf. Das Paket enthält die echte App, ihre neuen Module und Bildreferenzen.

Reproduktion ohne Frontend-Bundler:

```sh
node scripts/build-account-beta.cjs
python3 -m http.server 8080 --directory dist
```

Danach `http://localhost:8080/` öffnen und den Account-Tab wählen. Für einen Zugriff vom Telefon einen eigenen erreichbaren Test-Host mit HTTPS verwenden. Ein separates Origin besitzt eine separate IndexedDB: dort vertrauenswürdige Backups ausdrücklich importieren. Eine leere Vorschau bedeutet nicht, dass die Daten der Live-App gelöscht wurden.

## Android-Abnahme und verbleibende Grenzen

1. In der aktuellen Live-App Report-JSON und Account-JSON außerhalb des Browsers sichern. Keine Browserdaten löschen.
2. Den Beta-Build auf einem separaten Test-Origin öffnen; Den Account-Tab öffnen. Bei Bedarf Sicherungskopien importieren.
3. Auf dem Galaxy S24 Ultra im50/50-Split-Screen echten Lab-Screenshot wählen. Aktuelle Levels, Forschungsziele, sichtbare Effekte und Quelle am Original prüfen; falsche Zuordnungen über die aufklappbaren Korrekturen ändern.
4. Mehrere Werte bestätigen, speichern, neu laden. Boni und Verlauf vergleichen. Denselben Screenshot erneut importieren; anschließend ein echtes späteres Level-Update prüfen.
5. Relic-Screenshot importieren. Besitz ausdrücklich wählen. Bei reinen Symbolen Raster/Ausschnitt einstellen, Ungeklärtes offenlassen oder selbst zuordnen. Summen und Quellen kontrollieren; erneut importieren.
6. Einen Lab-Wert manuell ändern. Die Bonusanzeige muss ohne Screenshot aktualisiert werden. Einen älteren Battle Report auswählen; spätere Zustände dürfen darin nicht erscheinen.
7. Account-JSON erneut sichern und auf einem frischen Test-Origin wiederherstellen. Die bisherigen Original-Runs auf dem produktiven Origin unverändert vergleichen.

**Fertig und automatisiert getestet:** die beschriebenen Labs-/Relics-Datenflüsse, unterstützte Bonusregeln, Dashboard, Speicherung, Bestandsdatenschutz und Backupwege. **Nicht vollständig verifiziert:** sämtliche Spielsprachen, seltene Layouts, alle symbolischen Relic-Varianten und die physische Android-Bedienung. **Offen/zurückgestellt:** weitere automatische Systeme, vollständige Kampf-Endwerte und Upgrade-/ROI-Empfehlungen. Die Tests gelten nicht als Abnahme eines echten persönlichen Account-Stands.
