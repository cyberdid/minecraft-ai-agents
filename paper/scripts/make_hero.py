#!/usr/bin/env python3
"""README banner: the AI-generated illustration (docs/hero-art.png, made with the
generate_image tool of Antigravity / Gemini) with the title set over its calm left side.

Usage: python3 paper/scripts/make_hero.py
Writes docs/hero.png (2752x1536, 2x of the art).
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / "docs" / "hero-art.png"
OUT = ROOT / "docs" / "hero.png"
FONT = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"
MONO = "/usr/share/fonts/truetype/noto/NotoSansMono-Bold.ttf"
LEVEL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]  # same as the paper's evidence levels

art = Image.open(ART).convert("RGB")
W, H = art.size[0] * 2, art.size[1] * 2
img = art.resize((W, H), Image.LANCZOS)

# a soft dark veil on the left so the type reads on the sky
veil = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(veil)
for x in range(W):
    a = max(0.0, 1 - x / (W * 0.62))
    d.line([(x, 0), (x, H)], fill=int(225 * a ** 1.25))
veil = veil.filter(ImageFilter.GaussianBlur(40))
img = Image.composite(Image.new("RGB", (W, H), (8, 12, 26)), img, veil)

draw = ImageDraw.Draw(img)
x0, y0 = 120, 250


def text(xy, s, size, font=FONT, fill=(255, 255, 255), shadow=True):
    f = ImageFont.truetype(font, size)
    if shadow:
        draw.text((xy[0] + 3, xy[1] + 4), s, font=f, fill=(0, 0, 0))
    draw.text(xy, s, font=f, fill=fill)
    return draw.textbbox(xy, s, font=f)


text((x0, y0 - 70), "MINECRAFT  ·  MULTI-AGENT  ·  LONG HORIZON", 30, MONO, fill=(176, 196, 230), shadow=False)
b = text((x0, y0), "Four coding agents,", 92)
b = text((x0, b[3] + 14), "one survival world,", 92)
b = text((x0, b[3] + 14), "every step audited.", 92)
y = b[3] + 50
text((x0, y), "Gemini 3.8 Flash agents write JavaScript", 38, FONT_R, fill=(226, 232, 244))
text((x0, y + 54), "for Mineflayer bots, share notes and chat,", 38, FONT_R, fill=(226, 232, 244))
text((x0, y + 108), "and keep going for days.", 38, FONT_R, fill=(226, 232, 244))

# evidence-level chips: the paper's A-D scale
y = y + 200
labels = ["A  autonomous", "B  night skip", "C  assisted", "D  scripted"]
x = x0
f = ImageFont.truetype(MONO, 28)
for col, lab in zip(LEVEL, labels):
    w = draw.textbbox((0, 0), lab, font=f)[2] + 44
    draw.rounded_rectangle([x, y, x + w, y + 58], radius=29, fill=col)
    draw.text((x + 22, y + 11), lab, font=f, fill=(255, 255, 255))
    x += w + 18
text((x0, y + 92), "Stage 1 reached autonomously in 2.4 active hours", 30, FONT_R, fill=(214, 222, 238))
text((x0, y + 136), "server-log audit of 16 milestones", 30, FONT_R, fill=(214, 222, 238))
text((W - 640, H - 56), "illustration: AI-generated (Gemini image model)", 24, FONT_R, fill=(235, 235, 235), shadow=True)

img.save(OUT, optimize=True)
print("wrote", OUT, img.size)
