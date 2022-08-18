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

SOCKET.on("GameIsOn_interruption", (data) => {
	GAMESECTION.style.filter = "blur(30px)";
	BLURED.style.display = "flex";
	BLURED.children[0].innerHTML = data.message;
	setTimeout(() => {
		window.location.href = "/";
	}, 3000);
});
