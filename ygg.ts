enum OpenType {
    Closed = 0,
    Left   = 1,
    Right  = 2,
    Both   = 3
}


class OpenRange {
    constructor(
	public min: number,
	public max: number,
	public open: OpenType = OpenType.Closed) {}

    contains(other: number | OpenRange): boolean {
	const isRange = other instanceof OpenRange;
	const left    = isRange ? other.min : other;
	const right   = isRange ? other.max : other;

	const leftValid = (this.open & OpenType.Left) !== 0 || this.min <= left;
	const rightValid = (this.open & OpenType.Right) !== 0 || this.max >= right;

	return leftValid && rightValid;
    }

    toString(): string {
	return `${this.min} - ${this.max}${(this.open & OpenType.Right) !== 0 ? '+' : ''}`;
    }

    static fromString(s: string): OpenRange {
	let st = s.trim();
	let open = st.at(-1) == '+' ? OpenType.Right : OpenType.Closed;
	let nums = (st.match(/\d+/g) || []).map(Number).sort();

	if (nums)
	    return new this(nums[0], nums.at(-1) || nums[0], open);
	return new this(1, 1, open);
    }
}


interface GameEntry {
    id: string;
    name: string;
    lang: string;
    players: OpenRange
}


interface GameEntryDTO extends Omit<GameEntry, "players"> {
    players: {
	min: number;
	max: number;
	open: number;
    };
}


let gameList: GameEntry[] = []

function displayGameList(data: GameEntry[]) {
    const ul = document.getElementById("list");

    if (!ul)
	return;

    ul.replaceChildren()

    const fragment = document.createDocumentFragment();

    data.forEach(d => {
	const li = document.createElement("li");

	const idSpan = document.createElement("span");
	idSpan.className = "game_id";
	idSpan.textContent = d.id;

	const nameSpan = document.createElement("span");
	nameSpan.className = "game_name";
	nameSpan.textContent = d.name;

	const playersSpan = document.createElement("span");
	playersSpan.className = "game_players";
	playersSpan.textContent = d.players.toString();

	li.append(idSpan, nameSpan, playersSpan);
	fragment.appendChild(li);
    });

    ul.appendChild(fragment);
}


async function loadGameList(): Promise<GameEntry[]> {
    try {
	const response = await fetch("./ygg_db.json");
	if (!response.ok)
	    throw new Error(`HTTP Error! ${response.statusText}`);

	const data: GameEntryDTO[] = await response.json();

	return data.map(entry => ({
	    ...entry,
	    players: new OpenRange(entry.players.min, entry.players.max, entry.players.open)
	}));
    }
    catch (err) {
	console.error(err);
	return [];
    }
}

const filterInput = document.getElementById("filter") as HTMLInputElement | null;

filterInput?.addEventListener("input", event => {
    const target = event.target as HTMLInputElement;
    let value = target.value.toLowerCase();

    if (value == "") {
	displayGameList(gameList);
	return;
    }

    const playersPattern = /\s*p:\s*([\d\-\s\+]+)/i
    const players = value.match(playersPattern)

    let displayList = gameList;

    if (players) {
	const range = OpenRange.fromString(players[1]);
	console.log(range.toString());
	displayList = displayList.filter(e => e.players.contains(range))
	value = value.replace(playersPattern, "")
    }

    // const re = new RegExp(value, "i");
    displayGameList(displayList.filter(e => e.name.toLowerCase().includes(value)));
});


async function init() {
    gameList = await loadGameList();
    displayGameList(gameList);
}

init();

