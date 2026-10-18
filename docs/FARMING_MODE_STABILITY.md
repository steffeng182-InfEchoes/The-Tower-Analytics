# Alpha 0.15.1 – Run-Modi und Farming stabilisiert

## Umfang und Status

Run-History, bestehende Klassifizierungen und normale Farming-Auswertungen werden gemeinsam abgesichert. Workshop-OCR ist ausdrücklich zurückgestellt und kein Abnahmekriterium dieses Meilensteins mehr. Der bestehende Erkennungscode bleibt unverändert als standardmäßig geschlossene experimentelle Funktion erhalten. Primäre Account-Aktion ist die manuelle Erfassung; vorhandene Workshop-Einträge und deren Verlauf bleiben unverändert.

## Eine gemeinsame Klassifizierung

`resolveRunMode` ermittelt den effektiven Modus schreibfrei. Gespeicherte Quellfelder werden beim Laden nicht überschrieben. Priorität:

1. Aktuelles kanonisches `detectedMode` mit `modeEvidence: manual-confirmed` bzw. `manual-unknown`. Eine ausdrückliche manuelle Korrektur der aktuellen App hat Vorrang vor Altangaben und OCR-Hinweisen. „Unbekannt“ bleibt dabei unbekannt.
2. Explizite manuelle Altangaben `manualMode` / `manualRunMode`.
3. Bestätigter History-Modus (`history-visual-confirmed` / `historyModeConfirmedAt`) oder ausdrücklich bestätigte verknüpfte `linkedHistory`-/`historyData`-Angaben.
4. Nachweisbare Report-Angaben: Tier-plus bzw. explizite Mode-Zeile. Eine normale Tierzahl ist kein Nachweis für Normalmodus.
5. Explizite ältere Modusfelder `detectedMode`, `runMode`, `mode` sowie Moduswerte im alten `runType`. Als OCR/inferred/hint/unconfirmed gekennzeichnete Vorschläge werden nicht als bestätigte Felder verwendet.

Gleichrangige widersprüchliche Angaben ergeben **Modus unbekannt / widersprüchlich**. Abweichungen zu niedrigeren Quellen oder unbestätigten History-Hinweisen bleiben in der History sichtbar. Hinweise allein werden weder zu Normal noch zu einem bestätigten Sondermodus. `day`, `day-afk`, `overnight-afk` und `active` sind ausschließlich Strategien und beweisen keinen Modus.

Alte explizite Normalangaben bleiben nutzbar und heißen in der Herkunft „gespeicherte Altangabe“; sie werden nicht nachträglich als manuell bestätigt ausgegeben. Fehlende Provenienz wird nicht erfunden. Unbekannte Zusatzfelder bleiben im Datensatz erhalten, begründen aber keine neue Klassifizierung.

## Zentrale Farming-Regel

`isFarmingRun` akzeptiert ausschließlich **klassifizierte Normalruns ohne ungelösten Moduskonflikt**. `selectFarmingRuns` prüft zusätzlich reale Laufzeit und gültige Erträge. `aggregateRuns`, Dashboard, Tier-Filter, Farming-Gruppen, Fortschrittsdiagramm, Progressionsvergleich und Tag-/Nachtvergleich verwenden dieselbe Auswahl.

Tournament, Dissonanz, unbekannte Modi, Konflikte und unvollständige Normalruns zählen nicht zu normalen Farming-Aggregaten. Das Dashboard und die Account-Farming-Analyse nennen die verwendete Zahl und ausgeschlossene Modi. Deshalb können die Werte gegenüber Alpha 0.15.0 sinken oder zunächst leer sein: Unbekannte Runs bei Bedarf unter „Strategie / Modus“ ausdrücklich als Normalrun bestätigen. Eine Importzeit oder Tages-/Nachtstrategie ersetzt diese Prüfung nicht.

Einzelwerte und alle Originalruns bleiben in History, Detailansicht und Backups vorhanden. „Letzte Runs“ im Dashboard ist eine vollständige chronologische Übersicht, keine Farming-Aggregation. Beste Farming-Wave bezieht sich ausdrücklich auf dieselbe Normalrun-Auswahl. Es wurden keine zusätzlichen Modus-Dashboards angelegt.

## Anzeige und Export

- `T1 · Wave 8.428 · Normalrun`
- `🏆 T5+ · Wave 360 · Tournament`
- `◈ T1 · Wave 5.085 · Dissonanz` (violettes Symbol plus Text)
- `⚠ T1 · Wave … · Modus unbekannt` bzw. „Modus widersprüchlich“

Pokal und Dissonanz-Raute werden als eingebettete SVG-Symbole gezeichnet und benötigen keine Emoji-Schrift. Die Moduskennzeichnung steht unmittelbar in der Tier-Zeile und bricht auf schmalen Displays um. Strategie und Herkunft werden separat gezeigt. Die kompakte Dashboard-Tier-Zelle verwendet dieselbe Klassifizierung.

CSV behält alle Runs und vorhandenen Spalten und ergänzt `effectiveMode`, `effectiveModeSource` und `farmingEligible`. Der ChatGPT-Export nennt Strategie, Modus, Herkunft und Farming-Zugehörigkeit je Run. Er enthält keine vermischten Farming-Summen. JSON behält Rohfelder und die bestehenden Backup-Formate; effektive Lesemetadaten ersetzen keine gespeicherten Originalwerte.

## Prüfungen

Die automatisierten Tests decken die neun angeforderten Fälle ab:

1. Expliziter T1-Normalrun zählt; reale Stunden gewichten Coins und Cells.
2. Tournament aus T5+, kanonischem Modus oder altem `runType` zählt nicht.
3. Dissonanz zählt nicht, auch bei gleicher Tier-/Strategie-/Zeitgruppe.
4. Fehlende/ungeklärte Modi und reine OCR-Hinweise bleiben sichtbar und ausgeschlossen.
5. Nachträgliche bestätigte History-Tournament-Zuordnung entfernt den Run sofort aus Dashboard und Progression.
6. Manuelle Korrektur zurück zu Normal aktualisiert dieselben Auswertungen nach Speicherung und Reload.
7. Sämtliche Runs, Originalerträge und Notizen bleiben vorhanden.
8. Unterschiedliche Alpha-Feldformen werden schreibfrei aufgelöst; vorhandene DB-/Backup-/Rollback-Tests bleiben erhalten.
9. Echte Chromium-Prüfung mit gemischter History bei 320×360, 384×400 und 412×460, lesbaren Symbolen, ohne Seitenüberbreite; Kontextkorrekturen werden über die tatsächlichen UI-Felder gespeichert.

Zusätzlich werden die konkreten Funktionen `dashboard`, `trend`, `accountRunInsights`, `progressionGroups`, `progressionEvidence`, `dayNightComparison`, CSV- und Text-Export geprüft. Die vorhandenen OCR-Regressionen bleiben zur Bewahrung der technischen Grundlage im Testlauf; es wurden keine neuen Workshop-Erkennungsversuche entwickelt.

## Daten und Android-Abnahme

IndexedDB `tower-analytics-alpha`, Version 2, Stores und Schlüssel bleiben gleich. Keine Migration, kein automatisches Umschreiben bestehender Runs, keine Löschung oder Levelrekonstruktion.

Auf dem bestehenden Android-Browser die Seite neu laden und Alpha 0.15.1 unter Diagnose prüfen. Einen bekannten Tournament- und Dissonanzrun in der History ansehen. Im Dashboard Ausschlusszahlen kontrollieren. Einen unbekannten tatsächlichen Normalrun ausdrücklich als Normal klassifizieren und die aktualisierten Farmingwerte prüfen. Alle vorhandenen Runs und manuell erfassten Account-Daten müssen weiterhin vorhanden sein. Die physische Geräteabnahme kann die Entwicklungsumgebung nicht ersetzen.
