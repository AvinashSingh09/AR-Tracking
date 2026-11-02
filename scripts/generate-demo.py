"""Create the text-free procedural AR video and its matching poster.

Requires Pillow and ffmpeg on PATH. This is asset authoring, not a web-build step.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import math
import subprocess

destination = Path(__file__).resolve().parents[1] / 'public/content/unbranded-v1'
destination.mkdir(parents=True, exist_ok=True)
encoder = subprocess.Popen([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '640x360', '-r', '24', '-i', '-',
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    str(destination / 'demo.mp4'),
], stdin=subprocess.PIPE)
try:
    for frame_index in range(144):
        time = frame_index / 24
        frame = Image.new('RGB', (640, 360), '#111c23')
        draw = ImageDraw.Draw(frame)
        for x in range(36, 640, 64):
            draw.line((x, 0, x, 360), fill='#1b2a31')
        for y in range(0, 360, 64):
            draw.line((0, y, 640, y), fill='#1b2a31')
        for radius in (48, 70, 92):
            draw.ellipse((320-radius, 158-radius, 320+radius, 158+radius), outline='#c6a361', width=2)
        angle = time * 1.3
        x, y = 320 + 92 * math.cos(angle), 158 + 92 * math.sin(angle)
        draw.ellipse((x-7, y-7, x+7, y+7), fill='#e9cd91')
        draw.rounded_rectangle((38, 310, 602, 314), radius=2, fill='#2d3b40')
        draw.rounded_rectangle((38, 310, 38+max(4, int(564*frame_index/143)), 314), radius=2, fill='#d3ae6b')
        if frame_index == 0:
            frame.save(destination / 'poster.jpg', quality=90)
        encoder.stdin.write(frame.tobytes())
finally:
    encoder.stdin.close()
if encoder.wait() != 0:
    raise RuntimeError('Video encoding failed')
print(f'Saved text-free video and poster to {destination}')
