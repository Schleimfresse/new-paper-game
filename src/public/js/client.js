// on success - start -
SOCKET.on("ActiveLobbyDataRequest", (data) => {
	ActiveLobbyDataRequest(data);
});

SOCKET.on("connect", () => {
	SOCKET.emit("ActiveLobbyDataRequest");
});

SOCKET.on("success", (data) => {
	success(data);
});
// on success - end -

// EventListner - start -
JOINBT.addEventListener("click", () => {
	document.title = "Join | Paper Game";
	JCSELC.style.display = "none";
	FORM.style.display = "flex";
});

CREATEBT.addEventListener("click", () => {
	document.title = "Create | Paper Game";
	JCSELC.style.display = "none";
	FORMCREATE.style.display = "flex";
});

BACKTOFORM.addEventListener("click", () => {
	SOCKET.emit("getInfoForChat", SOCKET.id);
	SOCKET.once("getInfoForChat", (data) => {
		BackToForm(data);
	});
});

FORM.addEventListener("submit", () => {
	let lobbyName = roomName.value;
	let name = NAMEJOIN.value;
	let data = { lobby: lobbyName, name: name };
	SOCKET.emit("join", data);
});

FORMCREATE.addEventListener("submit", () => {
	let name = NAMEFIELD.value;
	SOCKET.emit("create", name);
});

setInterval(function () {
	startTime = Date.now();
	SOCKET.emit("ping");
}, 2000);

SOCKET.on("pong", () => {
	let latency = Date.now() - startTime;
	if (latency >= 100) {
		PING_BOX.style.color = "#cf0404";
	} else if (latency >= 30) {
		PING_BOX.style.color = "#dbc818";
	} else if (latency >= 0) {
		PING_BOX.style.color = "#1c9e30";
	}
	PING_ELEMENT.innerText = `${latency} ms`;
});

// EventListner - end -

// client <- server - start -
SOCKET.on("disconnected", function () {
	SOCKET.emit("removeUserElement", name);
});

SOCKET.on("AddElementToOtherClients", (data) => {
	createElement(data, false);
});

SOCKET.on("removeUserElement", (data) => {
	document.getElementById(data.user).remove();
});

SOCKET.on("createOtherOnlineUsers", (data) => {
	for (item of data) {
		createElement(item, false);
	}
});

SOCKET.on("START_BT", () => {
	START_BT.setAttribute("id", "START_BT");
	START_BT.setAttribute("class", "bt-small");
	START_BT.innerText = "Start";
	PREROOM.appendChild(START_BT);
	ENDNEXT.setAttribute("id", "end-card-next");
	ENDNEXT.setAttribute("class", "bt-small");
	ENDNEXT.innerText = "Next";
	ENDFOOTER.appendChild(ENDNEXT);
});

SOCKET.on("fail", (data) => {
	fail(data);
});

SOCKET.on("terminate", () => {
	window.open("/", "_self");
});

SOCKET.on("reset", () => {
	PREROOM.style.display = "none";
	JCSELC.style.display = "flex";
});
// client <- server - end -
