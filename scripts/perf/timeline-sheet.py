#!/usr/bin/env python3
"""Lay out launch-timeline.sh filmstrips as one image: a row per run, a column per second.

Usage: timeline-sheet.py <frames-dir> <out.png> "<label>=Row title|subtitle" ... [blur=<label>-<s>,...]
Frames listed in blur= are blurred and marked "ad (blurred)" (used for celebrity ad splashes).
Needs Pillow (pip install pillow).
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, out, *args = sys.argv[1:]
blur = {k for a in args if a.startswith('blur=') for k in a[5:].split(',') if k}
rows = [a.split('=', 1) for a in args if not a.startswith('blur=')]
W, H, G, LW, TOP = 200, 444, 8, 230, 44
img = Image.new('RGB', (LW + 12 * (W + G) + G, TOP + len(rows) * (H + G) + G), 'white')
d = ImageDraw.Draw(img)
try:
    f = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22)
    fs = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 18)
except OSError:
    f = fs = ImageFont.load_default()
for s in range(1, 13):
    d.text((LW + (s - 1) * (W + G) + W // 2 - 14, 12), f'{s} s', fill='black', font=f)
for r, (key, label) in enumerate(rows):
    y = TOP + r * (H + G)
    for i, line in enumerate(label.split('|')):
        d.text((10, y + H // 2 - 30 + i * 26), line, fill='black', font=f if i == 0 else fs)
    for s in range(1, 13):
        name = f'{key}-{s}'
        fr = Image.open(f'{src}/{name}.png').convert('RGB')
        x = LW + (s - 1) * (W + G)
        if name in blur:
            fr = fr.filter(ImageFilter.GaussianBlur(14))
        img.paste(fr, (x, y))
        if name in blur:
            d.rectangle([x + 30, y + H // 2 - 18, x + W - 30, y + H // 2 + 18], fill='white')
            d.text((x + 44, y + H // 2 - 11), 'ad (blurred)', fill='black', font=fs)
        d.rectangle([x, y, x + W - 1, y + H - 1], outline=(200, 200, 200))
img.save(out, optimize=True)
print(out)
