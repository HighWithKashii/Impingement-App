#!/usr/bin/env python3
"""Generates the app icons from scratch (no external image assets).

Draws an abstract shoulder rotation arc: a teal arc on a dark slate rounded
square, with an amber dot marking the range-of-motion / progress point.
Run: python3 tools/generate_icons.py
"""
import math
import os
from PIL import Image, ImageDraw

BG = (11, 18, 32, 255)  # --bg
TEAL = (45, 212, 191, 255)  # --primary
TEAL_DARK = (20, 184, 166, 255)
AMBER = (245, 158, 11, 255)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")


def rounded_square(size, radius_ratio, fill):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=fill)
    return img


def draw_mark(img, cx, cy, r, stroke):
    draw = ImageDraw.Draw(img)
    # Arc representing rotational range of motion (shoulder rotation cuff),
    # from -210° to 30° (a 240° open arc).
    bbox = [cx - r, cy - r, cx + r, cy + r]
    draw.arc(bbox, start=150, end=390, fill=TEAL, width=stroke)

    # amber dot at the arc's start point (progress marker)
    start_angle = math.radians(150)
    dot_r = stroke * 0.85
    dx = cx + r * math.cos(start_angle)
    dy = cy + r * math.sin(start_angle)
    draw.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r], fill=AMBER)

    # small teal dot at the arc's end point
    end_angle = math.radians(390)
    ex = cx + r * math.cos(end_angle)
    ey = cy + r * math.sin(end_angle)
    dot_r2 = stroke * 0.6
    draw.ellipse([ex - dot_r2, ey - dot_r2, ex + dot_r2, ey + dot_r2], fill=TEAL_DARK)


def make_icon(size, radius_ratio, mark_scale, path):
    img = rounded_square(size, radius_ratio, BG)
    cx = cy = size / 2
    r = size * 0.27 * mark_scale
    stroke = max(2, int(size * 0.085 * mark_scale))
    draw_mark(img, cx, cy, r, stroke)
    img.save(path)
    print("wrote", path)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    make_icon(192, 0.22, 1.0, os.path.join(OUT_DIR, "icon-192.png"))
    make_icon(512, 0.22, 1.0, os.path.join(OUT_DIR, "icon-512.png"))
    # Maskable: keep the mark within the ~80% safe zone, background fills edge-to-edge.
    make_icon(512, 0.0, 0.78, os.path.join(OUT_DIR, "icon-maskable-512.png"))


if __name__ == "__main__":
    main()
