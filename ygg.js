let game_list = []

/**
 * Berechnet die Levenshtein-Distanz zwischen zwei Strings.
 * (Wie viele Änderungen sind nötig, um von str1 zu str2 zu kommen?)
 */
function levenshteinDistance(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    const m = s1.length;
    const n = s2.length;
    const t = Array(n + 1)

    var u = [], i = 0, j = 0;

    if (!m) return n;
    if (!n) return m;

    for (j = 0; j <= n; j++) t[j] = j;
    for (i = 1; i <= m; i++) {
	u = [i];
	for (j = 1; j <= n; j++) {
	    u[j] = s1[i - 1] === s2[j - 1] ? t[j - 1] : Math.min(t[j - 1], t[j], u[j - 1]) + 1;
	}
	t = u;
    }

    return u[n];

	//    const track = Array(s2.length + 1).fill(null).map(() =>
	// Array(s1.length + 1).fill(null));
	//
	//    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
	//    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
	//
	//    for (let j = 1; j <= s2.length; j += 1) {
	// for (let i = 1; i <= s1.length; i += 1) {
	//     const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
	//     track[j][i] = Math.min(
	// 	track[j][1 - 1][i] + 1, // Löschen
	// 	track[j][i - 1] + 1,    // Einfügen
	// 	track[j - 1][i - 1] + indicator // Ersetzen
	//     );
	// }
	//    }
	//    return track[s2.length][s1.length];
}

/**
 * Berechnet die Ähnlichkeit in Prozent (0 bis 1).
 * 1 bedeutet absolut identisch, 0 bedeutet komplett verschieden.
 */
function fuzzyMatch(str1, str2) {
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1.0; // Beide Strings sind leer
    
    // Prozentuale Ähnlichkeit berechnen
    return 1 - (distance / maxLength);
}

function showData(data) {
    const ul = document.getElementById("list");
    ul.replaceChildren()
    data.forEach(d => {
	const li = document.createElement("li");
	li.textContent = `${d[0]} ${d[1]}`;
	ul.appendChild(li);
    });
}

document.getElementById("filter")
    .addEventListener("input", event => {
	if (event.target.value == "") {
	    showData(game_list);
	    return;
	}

	const results = game_list
	    .map(e => ({
		element: e,
		score: fuzzyMatch(e[1], event.target.value)
	    }))
	    .filter(e => e.score > 0.5)
	    .sort((a, b) => b.score - a.score)
	    .map(e => e.element);
	console.log(results)
	showData(results);
    });

fetch("./ygg_db.json")
    .then(r => r.json())
    .then(data => {
	game_list = data;
	showData(data);
    })
    .catch(error => console.error("Fehler: ", error));
