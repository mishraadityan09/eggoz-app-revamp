#!/usr/bin/env python3
"""WCAG contrast of text in a screenshot region (stdlib only, no Pillow).

Takes the darkest and lightest pixel in the region as the two colours, which works for
text on a flat background. Use full-resolution screenshots (e.g. from snap.sh).

Usage: contrast.py <screenshot.png> <x0> <y0> <x1> <y1>
"""
import struct
import sys
import zlib


def load_png(path):
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        sys.exit("not a PNG")
    i, idat = 8, b""
    while i < len(data):
        n = struct.unpack(">I", data[i:i + 4])[0]
        kind, chunk = data[i + 4:i + 8], data[i + 8:i + 8 + n]
        i += 12 + n
        if kind == b"IHDR":
            width, height, depth, ctype = struct.unpack(">IIBB", chunk[:10])
            if depth != 8 or ctype not in (2, 6):
                sys.exit("only 8-bit RGB/RGBA PNGs are supported")
        elif kind == b"IDAT":
            idat += chunk
    bpp = 4 if ctype == 6 else 3
    raw, stride, rows, prev, o = zlib.decompress(idat), width * bpp, [], bytearray(width * bpp), 0
    for _ in range(height):
        ftype, line = raw[o], bytearray(raw[o + 1:o + 1 + stride])
        o += 1 + stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if ftype == 1:
                line[x] = (line[x] + a) & 255
            elif ftype == 2:
                line[x] = (line[x] + b) & 255
            elif ftype == 3:
                line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif ftype == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line
    return lambda x, y: tuple(rows[y][x * bpp:x * bpp + 3])


def luminance(rgb):
    def channel(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = map(channel, rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def main():
    if len(sys.argv) != 6:
        sys.exit(__doc__)
    path, (x0, y0, x1, y1) = sys.argv[1], map(int, sys.argv[2:])
    px = load_png(path)
    pixels = [px(x, y) for y in range(y0, y1) for x in range(x0, x1)]
    dark, light = min(pixels, key=luminance), max(pixels, key=luminance)
    ratio = (luminance(light) + 0.05) / (luminance(dark) + 0.05)
    verdict = "PASS (AA text)" if ratio >= 4.5 else "large text / icons only" if ratio >= 3 else "FAIL"
    print("dark #%02X%02X%02X  light #%02X%02X%02X  ratio %.2f:1  %s" % (*dark, *light, ratio, verdict))


if __name__ == "__main__":
    main()
