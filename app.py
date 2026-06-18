from http.client import HTTPResponse
from urllib.error import URLError
import urllib.request as url

import re
from dataclasses import dataclass
from enum import IntFlag

from flask import Flask, jsonify, render_template


app = Flask(__name__)


ENTRY_PATTERN = re.compile(
    r"<tr[^>]+>\s*"
    r"<td[^>]+>(?P<id>[^<]+).*?</td>\s*"
    r"<td[^>]+>(?P<name>[^<]+).*?</td>\s*"
    r"<td[^>]+>(?P<lang>[^<]+).*?</td>\s*"
    r"<td[^>]+>(?P<cnt>[^<]+).*?</td>\s*"
    r"</tr>", re.DOTALL
)


class OpenType(IntFlag):
    Closed = 0
    Left   = 1
    Right  = 2
    Both   = 3


@dataclass
class Range:
    min : int
    max : int
    open: OpenType = OpenType.Closed

    def to_json(self) -> dict[str, int]:
        return { "min": self.min, "max": self.max, "open": self.open}

    @classmethod
    def from_str(cls, s: str):
        s = s.strip()

        o = OpenType.Closed
        if s and s[-1] == '+':
            o = OpenType.Right

        min_num, max_num = 1, 1
        if (nums := sorted([int(i[0]) for i in re.finditer(r"\d+", s)])):
            min_num, max_num = nums[0], nums[-1]

        return cls(min_num, max_num, o)


@dataclass
class Entry:
    id     : str
    name   : str
    lang   : str
    players: Range

    def to_json(self) -> dict[str, str | dict[str, int]]:
        return { 
            "id"     : self.id,
            "name"   : self.name,
            "lang"   : self.lang,
            "players": self.players.to_json()
        }


def read_site() -> str:
    try:
        res = url.urlopen("https://yggdrasil.cafe/pages/spieleauswahl")
        if isinstance(res, HTTPResponse):
            return res.read().decode("utf-8")
    except URLError:
        pass
    return ""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/data")
def data():
    html = read_site()
    table = re.search("<table[^>]+(.*)</table>", html, re.DOTALL)

    if table is None:
        return jsonify({})

    db = [Entry(
        tr["id"],
        tr["name"],
        tr["lang"],
        Range.from_str(tr["cnt"]))
        for tr in ENTRY_PATTERN.finditer(table[0])]

    return jsonify([e.to_json() for e in db[1:]])


