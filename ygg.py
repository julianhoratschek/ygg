from http.client import HTTPResponse
from urllib.error import URLError
import urllib.request as url

import re
import json
from typing import NamedTuple
from enum import IntFlag
from pathlib import Path


class OpenType(IntFlag):
    Closed = 0
    Left   = 1
    Right  = 2
    Both   = 3


class Range:
    def __init__(self, min_num: int, max_num: int, open_type: OpenType = OpenType.Closed):
        self.min : int      = min_num
        self.max : int      = max_num
        self.open: OpenType = open_type

    def __contains__(self, other: int | Range):
        if self.open == OpenType.Both:
            return True

        if isinstance(other, Range):
            left, right = other.min, other.max
        else:
            left, right = other, other

        return (OpenType.Left in self.open or self.min <= left)\
            and (OpenType.Right in self.open or self.max >= right)

    def __str__(self) -> str:
        return f"{self.min}-{self.max}"

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


class Entry(NamedTuple):
    id     : str
    name   : str
    lang   : str
    players: Range


def read_site() -> str:
    res = None
    try:
        res = url.urlopen("https://yggdrasil.cafe/pages/spieleauswahl")
        if isinstance(res, HTTPResponse):
            return res.read().decode("utf-8")
    except URLError:
        pass
    return ""


ENTRY_PATTERN = re.compile(
    r"<tr[^>]+>\s*"
    r"<td[^>]+>(?P<id>[^<]+).*?</td>\s*"
    r"<td[^>]+>(?P<name>[^<]+).*?</td>\s*"
    r"<td[^>]+>(?P<lang>[^<]+).*?</td>\s*"
    r"<td[^>]+>(?P<cnt>[^<]+).*?</td>\s*"
    r"</tr>", re.DOTALL
)


def json_encode(obj):
    if isinstance(obj, Range):
        return obj.to_json()
    raise TypeError("Cannot serialize")


if __name__ == "__main__":
    html = read_site()
    table = re.search("<table[^>]+(.*)</table>", html, re.DOTALL)

    if table is None:
        print("no table found")
        exit(0)

    db = [Entry(
        tr["id"],
        tr["name"],
        tr["lang"],
        Range.from_str(tr["cnt"]))
        for tr in ENTRY_PATTERN.finditer(table[0])]

    with Path("ygg_db.json").open("w+") as fl:
        json.dump(db, fl, default=json_encode)




