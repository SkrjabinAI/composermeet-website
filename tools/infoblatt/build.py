import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table,
                                TableStyle, Image, KeepTogether, PageBreak, HRFlowable, ListFlowable, ListItem)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

S, OUT = sys.argv[1], sys.argv[2]
FD = '/usr/share/fonts/truetype/liberation/'
pdfmetrics.registerFont(TTFont('Arial', FD + 'LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', FD + 'LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', FD + 'LiberationSans-Italic.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')

# Farben exakt aus dem bisherigen Infoblatt
NAVY = HexColor('#1b3a5c'); BLUE = HexColor('#2e75b6'); TEXT = HexColor('#333333')
BOX = HexColor('#e8f0f8'); BULLET_DARK = HexColor('#6ba3d6'); TEXT_ON_DARK = HexColor('#d0d8e8'); GREY = HexColor('#666666')

title = ParagraphStyle('t', fontName='Arial-Bold', fontSize=26, leading=30, textColor=NAVY)
subtitle = ParagraphStyle('st', fontName='Arial', fontSize=14, leading=18, textColor=BLUE)
h1 = ParagraphStyle('h1', fontName='Arial-Bold', fontSize=18, leading=22, textColor=NAVY, spaceAfter=8)
lead = ParagraphStyle('lead', fontName='Arial-Bold', fontSize=12, leading=15.5, textColor=NAVY, spaceAfter=6)
body = ParagraphStyle('b', fontName='Arial', fontSize=11, leading=14.3, textColor=TEXT, spaceAfter=9)
small = ParagraphStyle('s', parent=body, spaceAfter=0)
caption = ParagraphStyle('c', fontName='Arial-Italic', fontSize=9, leading=12, textColor=GREY, alignment=TA_CENTER)
item = ParagraphStyle('i', fontName='Arial', fontSize=11, leading=14, textColor=TEXT, spaceAfter=5)
item_dark = ParagraphStyle('id', parent=item, textColor=TEXT_ON_DARK)
box_title_dark = ParagraphStyle('btd', fontName='Arial-Bold', fontSize=16, leading=20, textColor=white, spaceAfter=6)
c_title = ParagraphStyle('ct', fontName='Arial-Bold', fontSize=12, leading=16, textColor=NAVY, alignment=TA_CENTER)
c_line = ParagraphStyle('cl', fontName='Arial', fontSize=10, leading=14, textColor=GREY, alignment=TA_CENTER)

W = A4[0] - 2 * 60   # Satzbreite wie im Original (Ränder 60 pt)

def box(flows, bg, pad=14):
    t = Table([[flows]], colWidths=[W])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), bg), ('BOX', (0,0), (-1,-1), 0.75, HexColor('#000000')),
                           ('LEFTPADDING', (0,0), (-1,-1), pad), ('RIGHTPADDING', (0,0), (-1,-1), pad),
                           ('TOPPADDING', (0,0), (-1,-1), pad - 3), ('BOTTOMPADDING', (0,0), (-1,-1), pad - 1)]))
    return t

def bullets(entries, style, color, label_color):
    rows = []
    for label, text in entries:
        rows.append(ListItem(Paragraph(f'<font name="Arial-Bold" color="{label_color}">{label}:</font> {text}', style),
                             leftIndent=33, value='•'))
    return ListFlowable(rows, bulletType='bullet', start='•', bulletColor=color, bulletFontName='Arial',
                        bulletFontSize=11, leftIndent=33, bulletDedent=20, bulletOffsetY=0, spaceBefore=0)

def page(canvas, doc):
    canvas.saveState(); canvas.setFont('Arial', 11); canvas.setFillColor(HexColor('#000000'))
    canvas.drawCentredString(A4[0] / 2, 32, str(doc.page)); canvas.restoreState()

doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=60, rightMargin=60, topMargin=46, bottomMargin=56,
                      title='ComposerMeet: Informationsblatt', author='Célest Lang',
                      subject='Im Dialog mit historischen Persönlichkeiten', creator='ComposerMeet')
doc.addPageTemplates([PageTemplate(frames=[Frame(60, 56, W, A4[1] - 46 - 56, id='f', leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=page)])

s = []
logo = Image(f'{S}/logo.png', width=104, height=104 * 834 / 1128)
head = Table([[[Paragraph('ComposerMeet', title), Spacer(1, 4), Paragraph('Im Dialog mit historischen Persönlichkeiten', subtitle)], logo]],
             colWidths=[W - 110, 110])
head.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'BOTTOM'), ('ALIGN', (1,0), (1,0), 'RIGHT'),
                          ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0), ('BOTTOMPADDING', (0,0), (-1,-1), 6)]))
s += [head, HRFlowable(width='100%', thickness=1, color=BLUE, spaceBefore=2, spaceAfter=16)]

s.append(box([Paragraph('Das Publikum stellt eine Frage, und eine historische Persönlichkeit antwortet als Video-Avatar: in Echtzeit, mit Stimme und Untertiteln.', lead),
              Paragraph('Mitschnitt eines Publikumsdialogs mit Fanny Hensel an der HMTM München, 2026:<br/>'
                        '<link href="https://youtu.be/RFo1mFihDnw" color="#2e75b6"><u>https://youtu.be/RFo1mFihDnw</u></link>', small)], BOX))
s.append(Spacer(1, 18))
s.append(Paragraph('ComposerMeet ist ein Vermittlungsprojekt von Célest Lang. Es eignet sich für Konzerteinführungen ebenso wie für '
                   'Langzeitinstallationen und lässt sich auf jede gut dokumentierte historische Persönlichkeit zuschneiden: '
                   'Komponist*innen ebenso wie Maler*innen, Schriftsteller*innen, Philosoph*innen oder Politiker*innen. '
                   'Jede Figur wird eigens für ein Projekt entwickelt.', body))
s.append(Paragraph('Grundlage sind ausgewählte Quellen: Briefe, Tagebücher, wissenschaftliche Analysen und zeitgenössische Berichte. '
                   'Ein KI-System formuliert daraus eine Antwort im Stil der Zeit und nennt die Quellen. Bis die Antwort kommt, '
                   'vergehen ein paar Sekunden. In dieser Zeit sieht das Publikum, wie das System arbeitet.', body))
s.append(Paragraph('Das Format ist partizipativ: Das Publikum hört nicht nur zu, es fragt selbst. Der Avatar antwortet auf Augenhöhe '
                   'und doziert nicht. Dass die Antworten aus einem KI-System stammen, wird offen gesagt. Es geht nicht um eine '
                   'Replikation, sondern um eine Interpretation, und um die spielerische Auseinandersetzung mit Geschichte und ihren Quellen.', body))
s.append(Spacer(1, 10))
img_w = 360
s.append(KeepTogether([Image(f'{S}/asc-print.jpg', width=img_w, height=img_w * 9 / 16), Spacer(1, 6),
                       Paragraph('Installation „Virtual Arnold“ im Arnold Schönberg Center Wien, mit dem KI-Avatar von Arnold Schönberg.<br/>'
                                 'Foto: Arnold Schönberg Center', caption)]))
s.append(PageBreak())

s.append(Paragraph('Referenzen', h1))
s.append(bullets([
    ('Seit Oktober 2026', 'Installation „Virtual Arnold“ im Arnold Schönberg Center Wien, eröffnet in der Langen Nacht der Museen'),
    ('Oktober 2026', 'Xplorer Day des XR Hub im Deutschen Museum Verkehrszentrum München'),
    ('September 2026', 'Cross-Innovation-Reise von Bayern Innovativ zur Ars Electronica Linz; Vortrag und Roundtable bei den 17. International Music Business Research Days (IMBRA) in München'),
    ('April 2026', 'Honorable Mention bei „The next THING“ des Venture Team Kultur'),
    ('Februar 2026', 'Pilotfolge mit Fanny Hensel an der HMTM München, entwickelt für XPLORE, den Wettbewerb für neue Konzertformate'),
    ('Seit 2025', 'Förderung im STARTER-Programm des Venture Team Kultur'),
], item, BLUE, '#1b3a5c'))
s.append(Spacer(1, 16))
s.append(Paragraph('Mögliche Einsatzbereiche', h1))
s.append(bullets([
    ('Museen und Gedenkorte', 'Als Installation in Ausstellung, Foyer oder Gedenkstätte, stabil und unbeaufsichtigt im Dauerbetrieb.'),
    ('Orchester und Konzerthäuser', 'Als Werkeinführung im Gespräch oder als Teil der Moderation, 20 bis 30 Minuten.'),
    ('Festivals', 'Für Musik-, Literatur-, Kunst- oder Geschichtsfestivals, auch hybrid und per Livestream.'),
    ('Schule und Unterricht', 'In Musik, Geschichte, Deutsch, Kunst oder Philosophie, verbunden mit der Frage, was KI kann und was nicht.'),
], item, BLUE, '#1b3a5c'))
s.append(Spacer(1, 18))
s.append(box([Paragraph('Ihre Vorteile', box_title_dark), bullets([
    ('Verlässliche Inhalte', 'Jede Antwort beruht auf belegten Quellen und nennt sie.'),
    ('Eigens entwickelt', 'Persönlichkeit, Stil, Länge und Quellen werden pro Projekt abgestimmt. Sie behalten die redaktionelle Kontrolle.'),
    ('Stabil und ausfallsicher', 'Redundant aufgebaut, läuft zuverlässig im Dauerbetrieb und live auf der Bühne.'),
    ('Wenig Technik', 'Rechner, Bildschirm, Mikrofon und Lautsprecher genügen.'),
    ('Barrierefrei und transparent', 'Untertitel, Quellenangaben und ein für alle sichtbarer Ablauf.'),
    ('Partizipativ', 'Das Publikum wird zum aktiven Teil des Geschehens.'),
], item_dark, BULLET_DARK, '#ffffff')], HexColor('#1b3a5c')))
s.append(Spacer(1, 22))
s.append(box([Paragraph('Interesse? Sprechen Sie uns an.', c_title), Spacer(1, 3),
              Paragraph('Célest Lang&nbsp;&nbsp;|&nbsp;&nbsp;<link href="mailto:celest@composermeet.com" color="#2e75b6"><u>celest@composermeet.com</u></link>'
                        '&nbsp;&nbsp;|&nbsp;&nbsp;<link href="https://composermeet.com" color="#0563c1"><u>www.composermeet.com</u></link>', c_line)], BOX, pad=12))
doc.build(s)
print('ok')
