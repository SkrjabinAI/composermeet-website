# Informationsblatt (PDF) neu erzeugen

Erzeugt `assets/ComposerMeet_Infosheet.pdf` im bisherigen Design (zwei A4-Seiten).
Texte und Referenzen stehen direkt in `build.py` und lassen sich dort ändern.

```bash
pip install reportlab
python3 tools/infoblatt/build.py tools/infoblatt assets/ComposerMeet_Infosheet.pdf
```

Benötigt die Schrift Liberation Sans (maßgleich zu Arial) unter
`/usr/share/fonts/truetype/liberation/` (Paket `fonts-liberation`).

- `logo.png`: Signet mit Wortmarke, transparent
- `asc-print.jpg`: Foto für Seite 1 (Foto: Arnold Schönberg Center)
