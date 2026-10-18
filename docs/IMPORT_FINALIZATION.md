# Alpha 0.15.0 – Importprozesse für Meilenstein 1

## Änderungen

- Kompakter Originaltext-Import mit einem primären Button „Analysieren & speichern“. Vollständige, widerspruchsfreie Pflichtangaben werden direkt gespeichert. Fehlende/ungültige Daten, doppelte Kopffelder oder widersprüchliche Stundenwerte öffnen eine korrigierbare Vorschau. Ein unbekannter Modus blockiert den Import nicht.
- Run-History bietet „Nächsten Report importieren“. Der getestete TXT-Sammelimport bleibt unter „Erweiterte Optionen“ erhalten. Dateiname, MIME-Typ und Textinhalt verhindern, dass JPEG-/PNG-Binärdaten als Reports eingelesen werden.
- History kann vor dem Battle Report als separat geprüfte Beobachtung gespeichert werden. Sie besitzt keine erfundene Laufzeit und erscheint nicht in Report-Effizienzanalysen. Nach späterem Report-Import werden offene Beobachtungen erneut zur Zuordnung angeboten. Umgekehrte Reihenfolge bleibt möglich.
- Tier/Wave plus mindestens zwei passende Zusatzmerkmale aus Datum/Coins/Cells bleiben Voraussetzung einer Report-Zuordnung. Bei gleichwertigen Kandidaten gibt es eine ausdrückliche Auswahl. Widersprüchliche Zahlen werden angezeigt und sperren die Zuordnung. Ein geprüfter, separater History-Eintrag darf trotzdem existieren.
- Bestätigter Modus-Widerspruch benötigt eine zusätzliche Bestätigung. Frühere Modusangaben bleiben im Kontextverlauf erhalten. Originaltext, Erträge, Laufzeit und Notizen des Reports werden nicht durch OCR ersetzt.
- Strategie und Modus sind getrennte Auswahlfelder. Herkunft wird in den Run-Karten angezeigt. Der Altwert `day-afk` bleibt lesbar; neue Tagesruns heißen `day`. Nachtzeiten belegen keine AFK-Spielweise.
- Account-OCR wertet mehrere Erkennungspässe und Wortpositionen in zweispaltigen Workshop-Karten aus. Effekt, Kosten und Max-Status sind getrennt editierbar. Zahlen werden nie in Workshop-Level umgerechnet. Laufende Forschung wird als Ziellevel vorgeschlagen, nicht als abgeschlossenes Level.
- Leere/unerklärbare Account-Ergebnisse unterscheiden fehlenden Text, unbekannte Begriffe/Bereiche und fehlende Wertzuordnung. OCR-Ladephasen, feste Asset-Versionen, Zeitlimits und wiederholbare Ladefehler sind sichtbar. Keine Bilder werden hochgeladen oder in IndexedDB gespeichert.
- Dashboard-Effizienz schließt bestätigte Tournament- und Dissonanzruns aus. Die vorhandenen vergleichbaren Gruppen führen Modi weiterhin getrennt.

## Datenhaltung und Backups

Die IndexedDB bleibt `tower-analytics-alpha`, Version 2. Keine vorhandenen Stores oder Daten werden migriert/gelöscht. Neue History-Beobachtungen liegen als ausdrücklich typisierte `history-observation`-Datensätze im bestehenden Run-Store; das aktuelle UI trennt sie von vollständigen Reports. Das Einlesen vorhandener Reports bleibt schreibfrei.

Run-Backups behalten `schemaVersion: 1` und `runs` bei; das optionale Feld `historyEntries` ergänzt die Beobachtungen. Alte Backups ohne dieses Feld bleiben importierbar. Neuere Backups sind mit älteren App-Versionen für den Report-Teil lesbar; ältere Versionen ignorieren die ergänzte History. Gesamte Sicherungen werden vor dem Schreiben validiert und in einer einzigen Transaktion hinzugefügt. Bestehende globale IDs werden nicht überschrieben. Ein Downgrade der App ist wegen der zusätzlichen Datensatzart nicht als Betriebsweg vorgesehen.

## Verifiziertes Spielwissen

Dissonanz-Arten: Attack, Defense, Utility, Ultimate Weapons. Primärquelle: Tech Tree Games, **v28 Patch Notes**, https://www.techtreegames.com/post/v28-patch-notes , geprüft 18.10.2026. Die Quelle bestätigt die Kategorien und betroffenen Stat-Systeme, veröffentlicht dort aber keine vollständige Wave-Kurve mit allen relevanten aktuellen Modifikatoren. Deshalb **keine Bonus-/Echo-Berechnung**. Community-Formeln werden nicht als vollständig verifizierte Berechnung ausgegeben.

Der bestehende Katalog mit 711 Community-Referenzen und seinem unveränderten SDK-Commit bleibt erhalten. Die in Tests verwendeten MuMuPlayer-Bilder belegen nur das Bildlayout, nicht die Spielregeln oder Strategieaussagen der begleitenden Artikel.

## Tests

- Parser, Kalender/DST, chronologische Reihenfolge, 30er-Sammelimport, konkurrierende Duplikate, Alt-DB, Rollback und Backups.
- Ein-Klick-Import, korrigierbare Fehler, Strategie/Modus-Trennung, Moduskonflikt und direkte Folgeimporte.
- History zuerst/später, erneut gespeicherte Beobachtungen, ausdrückliche Kandidatenauswahl, Konfliktbestätigung und unveränderte Reportwerte.
- Reale Node-Tesseract-OCR plus Produktions-Canvas/Matching: zwei öffentliche History-Bilder, reale Lab-/Workshop-Bilder. Zusätzlich privates History-Bild lokal: sechs volle Runs, T5+/360 und T1/5085 mit den erwarteten Symbolhinweisen. Das private Bild und dessen OCR-Text werden nicht veröffentlicht.
- Reale Browser-Worker/WASM-OCR: History-Prüfung/Speicherung, Lab-/Workshop-Vorschläge, selektive Account-Speicherung und Reload.
- Browser: 320×360, 384×400, 412×460; alle sechs Seiten ohne Seitenüberbreite. Primäraktion bei 384×400 oberhalb der unteren Navigation.

55 Fach-/DOM-Tests bestanden lokal. Beide realen Account-Bilder lieferten sinnvolle Vorschläge (Lab-Forschungsziel und elf Workshop-Eigenschaften). Browser-Worker/WASM, private sechszeilige History und der öffentliche CDN-Ladeweg bestanden. Beim CDN-Test benötigt die Entwicklungsumgebung ihren HTTPS-Proxy; dessen lokale CA wird vom Chromium-Testprofil nicht erkannt. `TOWER_OCR_PROXY_TEST=1` erlaubt ausschließlich im Testprofil diesen Proxy. Die App selbst umgeht keine TLS-Prüfung.

Befehle: `npm ci`, `npm test`, `npm run test:browser`, `npm run test:ocr`, `npm run test:ocr-browser`. Für eine lokale Browserinstallation optional `TOWER_CHROMIUM_EXECUTABLE`; private zusätzliche History-Prüfung über `TOWER_PRIVATE_HISTORY_IMAGE`. Der optionale manuelle CDN-Test verwendet `TOWER_OCR_EXTERNAL=1` ohne lokale Asset-Umleitung; deterministische CI verwendet dieselben gepinnten Assets lokal.

## Bekannte Grenzen

- Physisches Samsung-/Android-Verhalten und die gespeicherten Daten auf dem Nutzergerät sind von der Entwicklungsumgebung nicht zugänglich. Browser-Emulation ersetzt diese Abnahme nicht.
- Kleine Dezimalpunkte, abgeschnittene Namen und dekorative Schriften können falsch erkannt werden. Kosten bleiben ausdrücklich ungeprüfte Vorschläge. OCR-Lesarten können abweichen und werden angezeigt; keine automatische Account-Speicherung.
- Das reale Lab-Testbild zeigt eine laufende Forschung mit Ziellevel 7. Für beliebige andere Lab-Ansichten oder Sprachen wird keine universelle Erkennung behauptet. Unbekannte Level bleiben unbekannt.
- Das bekannte private History-Bild zeigt sechs vollständige Runs. Ein abgeschnittenes Datum kann manuell ergänzt werden; ohne eindeutige Zusatzmerkmale gibt es keine automatische Report-Zuordnung.
- Erstnutzung benötigt Zugriff auf die gepinnten OCR-Dateien von cdn.jsdelivr.net; Inhaltsblocker/Netzwerkprobleme werden als Ladefehler gemeldet. Die lokale Texterfassung bleibt verfügbar.

## Kurze Android-Abnahme

1. Gleichen Browser und bestehende App-URL verwenden, **Website-Daten nicht löschen**. Alpha 0.15.0 unter „Diagnose“ prüfen. Run- und Account-Backup exportieren; bisherige Datenanzahl kontrollieren.
2. In 50/50-Split-Screen Report einfügen → „Analysieren & speichern“. Dann „Nächsten Report importieren“. Gleichen Report erneut einfügen: Duplikat, kein weiterer Datensatz.
3. Unter Runs das bekannte History-Bild über den **separaten Screenshot-Import** auswählen. Sechs vollständige Zeilen und Symbolvorschläge prüfen. Nur geprüfte Zeilen markieren. T5/W360 muss nach bestätigtem Abgleich Tournament sein, ohne veränderte Reporterträge.
4. History ohne zugehörigen Report speichern; später passenden Report importieren und in „Gespeicherte History“ zuordnen. Umgekehrte Reihenfolge ebenfalls prüfen.
5. Unter Account einen Labs-/Workshop-Screenshot auswählen. Vorgeschlagene Namen, Effektwerte, Kosten und Max prüfen. Nur korrekte Einträge markieren. Health-/Damage-Effekte dürfen nicht als bestätigte Level erscheinen.
6. Nach Reload Daten und Verlauf kontrollieren. Bei OCR-Fehler die konkrete Lade-/Erkennungsmeldung und die verwendete Spielansicht melden.
