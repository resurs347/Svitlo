import json, os, re, threading, time, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

QUEUES = ["1.1","1.2","2.1","2.2","3.1","3.2","4.1","4.2","5.1","5.2","6.1","6.2"]
BASE = ("https://alerts.energy/kharkivska-oblast/harkivskij-rayon/"
        "harkivska-terytorialna-hromada/schedule/kharkivska-oblast-oblenergo/")
DAYS = {"today": "", "tomorrow": "/zavtra"}
REFRESH_SECONDS = 300
DATA_FILE = Path(__file__).with_name("data.json")
PORT = int(os.environ.get("PORT", 8080))

INTERVAL = re.compile(r"(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})")

def to_hours(h, m):
    return int(h) + int(m) / 60

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "svitlo-kharkiv/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")

def parse(html):
    if "ще не опубліковано" in html or "ще немає підтвердженого" in html:
        return None
    start = html.find("Мій план відключень")
    block = html[start:start + 2500] if start >= 0 else html
    out = []
    for a, b, c, d in INTERVAL.findall(block):
        s, e = to_hours(a, b), to_hours(c, d)
        if e > s and [s, e] not in out:
            out.append([s, e])
    return out

def refresh():
    data = {"updated": time.strftime("%Y-%m-%d %H:%M:%S"), "queues": {}}
    for q in QUEUES:
        data["queues"][q] = {}
        for day, suffix in DAYS.items():
            try:
                data["queues"][q][day] = parse(fetch(BASE + q + suffix))
            except Exception as ex:
                print("помилка", q, day, ex)
                data["queues"][q][day] = None
            time.sleep(1)
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    print("оновлено", data["updated"])

def loop():
    while True:
        try:
            refresh()
        except Exception as ex:
            print("збій оновлення", ex)
        time.sleep(REFRESH_SECONDS)

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/schedule"):
            body = DATA_FILE.read_bytes() if DATA_FILE.exists() else b'{"queues":{}}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        elif self.path in ("/", "/index.html"):
            page = Path(__file__).with_name("index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page)
        else:
            self.send_response(404)
            self.end_headers()
    def log_message(self, *a):
        pass

if __name__ == "__main__":
    threading.Thread(target=loop, daemon=True).start()
    print("Сервер на порту", PORT)
    ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
