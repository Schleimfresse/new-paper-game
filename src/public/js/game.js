GAMETEXTSUBMIT.addEventListener("click", () => {
	let input = GAMETEXTAREA.value;
	GAMETEXTSUBMIT.setAttribute("disabled", true);
	GAMETEXTAREA.value = "";
	SOCKET.emit("addContentToDb", getInfo(input));
	console.log('test', getInfo(input));
});

SOCKET.on("StartGame", (data) => {
	StartGame(data);
});

SOCKET.on("updateReadyPlayers", (data) => {
	updateReadyPLayers(data);
});
