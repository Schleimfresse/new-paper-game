CHATSUBMIT.addEventListener("click", () => {
	if (CHATTEXTFIELD.value != "") {
		SOCKET.emit("getInfoForChat", SOCKET.id);
		SOCKET.once("getInfoForChat", (data) => {
			let ITEM = document.createElement("div");
			ITEM.setAttribute("class", "message");
			ITEM.innerHTML = `<span class="chat-name">${data.user}</span><span class="chat-message-content"></span>`;
			ITEM.children[1].innerText = CHATTEXTFIELD.value;
			CHATAREA.appendChild(ITEM);
			CHATAREA.scrollTop = CHATAREA.scrollHeight;
			data = { message: CHATTEXTFIELD.value, user: data.user, lobby: data.lobby };
			SOCKET.emit("sendMessageToOtherClients", data);
			CHATTEXTFIELD.value = "";
		});
	}
});

SOCKET.on("sendMessageToOtherClients", (data) => {
	const ITEM = document.createElement("div");
	ITEM.setAttribute("class", "message");
	ITEM.innerHTML = `<span class="chat-name">${data.user}</span><span class="chat-message-content"></span>`;
	ITEM.children[1].innerText = data.message;
	CHATAREA.appendChild(ITEM);
	CHATAREA.scrollTop = CHATAREA.scrollHeight;
});

STARTBT.addEventListener("click", () => {
	if (!(LASTCLICK >= Date.now() - 2000)) {
		SOCKET.emit("getInfoForChat", SOCKET.id);
		SOCKET.once("getInfoForChat", (data) => {
			if (data.amount <= 3) {
				if (data.amount != 3) {
					plural = "s";
				} else {
					plural = "";
				}
				Systemdata = {
					message: `There are not enough players, you need at least ${
						4 - data.amount
					} more player${plural} to start a game.`,
				};
				SystemMessage(Systemdata);
			} else if (data.amount >= 4) {
				STARTBT.setAttribute("disabled", "disabled");
				Systemdata = {
					message: `${data.user} has started the game which will start in 5 seconds`,
					lobby: data.lobby,
				};
				SOCKET.emit("SystemMessage", Systemdata);
				SystemMessage(Systemdata);
				let counter = 5;
				for (let i = 0; i < x; i++) {
					setTimeout(function () {
						Systemdata = { message: counter, lobby: data.lobby };
						SystemMessage(Systemdata);
						SOCKET.emit("SystemMessage", Systemdata);
						counter--;
					}, i * 1000);
				}
				setTimeout(() => {
					SOCKET.emit("StartGame", data);
				}, 5000);
			}
		});
		LASTCLICK = Date.now();
	}
});
SOCKET.on("SystemMessage", (data) => {
	SystemMessage(data);
});
