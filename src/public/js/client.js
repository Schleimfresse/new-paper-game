// on success - start -
SOCKET.on("ActiveLobbyDataRequest", (data) => {
	if (data.length != 0) {
		OPENLOBBYS.style.display = "block";
		OPENLOBBYS.children[0].innerHTML = "";
		for (object of data) {
			if (object.icon) {
				OPENLOBBYS.children[0].innerHTML += `<span>${object.name}</span><br />`;
			}
		}
	}
});

SOCKET.on("connect", () => {
	SOCKET.emit("ActiveLobbyDataRequest");
});

SOCKET.on("success", (data) => {
	document.title = "Lobby | Paper Game";
	FORM.style.display = "none";
	PREROOM.style.display = "block";
	FORMCREATE.style.display = "none";
	PREROOM.style.display = "block";
	ROOMNO.textContent = `You are in ${data.room}'s lobby`;
	Systemdata = { message: `${data.name} has joined the lobby`, lobby: data.room };
	SystemMessage(Systemdata);
	SOCKET.emit("SystemMessage", Systemdata);
	createElement(data, true);
	SOCKET.emit("NewUserUpdateOtherClients", data);
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

ENDNEXT.addEventListener("click", () => {});
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

SOCKET.on("startbt", () => {
	STARTBT.setAttribute("id", "startbt");
	STARTBT.setAttribute("class", "bt-small");
	STARTBT.innerHTML = "Start";
	PREROOM.appendChild(STARTBT);
});
SOCKET.on("fail", (data) => {
	if (!(LASTCLICK >= Date.now() - 3400)) {
		if (data.boolean) {
			FAIL.innerHTML = data.message;
			FAIL.style.visibility = "visible";
			FAIL.classList.add("transition");
			setTimeout(() => {
				FAIL.classList.remove("transition");
				FAIL.style.visibility = "hidden";
			}, 3000);
		} else if (!data.boolean) {
			FAILCREATE.innerHTML = data.message;
			FAILCREATE.style.visibility = "visible";
			FAILCREATE.classList.add("transition");
			setTimeout(() => {
				FAILCREATE.classList.remove("transition");
				FAILCREATE.style.visibility = "hidden";
			}, 3000);
		}
		LASTCLICK = Date.now();
	}
});
SOCKET.on("terminate", () => {
	window.open("/", "_self");
});
SOCKET.on("reset", () => {
	PREROOM.style.display = "none";
	JCSELC.style.display = "flex";
});
SOCKET.on("endGame", (data) => {
	endGame();
});
SOCKET.on("startNewRound", (r) => {
	startNewRound(r);
});
// client <- server - end -

// Extra content
