function StartGame(data) {
	document.title = "Paper Game";
	HEADER.style.display = "none";
	PREROOM.style.display = "none";
	GAMESECTION.style.display = "flex";
	const Element = data.gameIsOn.find((e) => {
		return e.name == data.users[SOCKET.id];
	});
	GAMETEXTAREA.classList.add(Element.playerindex);
	GAMETEXTAREA.classList.add(Element.lobby);
	GAMETEXTAREA.classList.add(Element.name);
	data = { ready: 0, all: data.all };
	setReadyPLayers(data);
}

SOCKET.on("StartGame", (data) => {
	StartGame(data);
});
GAMETEXTSUBMIT.addEventListener("click", () => {
	let input = GAMETEXTAREA.value;
	GAMETEXTSUBMIT.setAttribute("disabled", true);
	GAMETEXTAREA.value = "";
	SOCKET.emit("addContentToDb", getInfo(input));
});
SOCKET.on("updateReadyPlayers", (data) => {
	updateReadyPLayers(data);
});
function startNewRound() {
	SOCKET.emit("getLength", getInfo(undefined).game);
	SOCKET.once("getLength", (data) => {
		datanew = {
			game: getInfo(undefined).game,
			round: getInfo(undefined).round,
			from: getInfo(undefined).from,
		};
		if (datanew.from > data.all) {
			data = { datanew: datanew, dataall: data.all };
			datanew.from = 1;
			SOCKET.emit("getDataFromDb", data);
		}
	});
}
function endGame() {
	GAMESECTION.style.display = "none";
	ENDSECTION.style.display = "flex";
}

SOCKET.on("DataFromDb", (data) => {
	datanew = {
		from: getInfo(undefined).from,
		round: getInfo(undefined).round,
	};
	if (datanew.from > data.data) {
		datanew.from = 1;
	}
	const getNeededObj = data.senddata.find((e) => {
		return e.from == datanew.from && e.round == datanew.round;
	});
	GAMETEXTAREA.classList.remove[2];
	console.log("the indexes", data.indexes);
	console.log("the .from", datanew.from);
	const filteredIndexes = Object.fromEntries(
		Object.entries(data.indexes).filter(([key, value]) => key === datanew.from.toString())
	);
	GAMETEXTAREA.classList.add(Object.values(filteredIndexes));
	SHOWCASE.innerText = getNeededObj.text;
});