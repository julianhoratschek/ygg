let game_list = []

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

	const re = new RegExp(event.target.value);

	const results = game_list
	    .filter(e => e[1].search(re) != -1);
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
