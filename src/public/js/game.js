GAMETEXTSUBMIT.addEventListener("click", () => {
	submitText(GAMETEXTAREA.value);
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