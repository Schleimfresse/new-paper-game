GAMETEXTSUBMIT.addEventListener("click", () => {
	let input = GAMETEXTAREA.value;
	GAMETEXTSUBMIT.setAttribute("disabled", true);
	GAMETEXTAREA.value = "";
	SOCKET.emit("addContentToDb", getInfo(input));
});

SOCKET.on("StartGame", (data) => {
	StartGame(data);
});

SOCKET.on("updateReadyPlayers", (data) => {
	updateReadyPLayers(data);
});

SOCKET.on("endGame", (data) => {
	endGame(data);
});

SOCKET.on("startNewRound", (data) => {
	startNewRound(data);
});