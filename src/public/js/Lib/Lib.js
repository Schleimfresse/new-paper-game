/**
 * The socket.io client-side instance
 */
const SOCKET = io();
const PLAYERLIST = document.getElementById("player-list");
const PREROOM = document.getElementById("pre-room");
const FORM = document.getElementById("form");
const JOINBT = document.getElementById("Join");
const CREATEBT = document.getElementById("Create");
const ROOMNAME = document.getElementById("roomName");
const FORMCREATE = document.getElementById("formCreate");
const NAMEFIELD = document.getElementById("nameCreate");
const JCSELC = document.getElementById("joincreateselection");
const FAIL = document.getElementById("fail");
const FAILCREATE = document.getElementById("failCreate");
const NAMEJOIN = document.getElementById("name");
const ROOMNO = document.getElementById("RoomNo");
const START_BT = document.createElement("button");
const BACKTOFORM = document.getElementById("backToForm");
const OPENLOBBYS = document.getElementById("openLobbys");
const CHATAREA = document.getElementById("chatarea");
const CHATFORM = document.getElementById("chatform");
const CHATSUBMIT = document.getElementById("chatsubmit");
const CHATTEXTFIELD = document.getElementById("chatTextfield");
const HEADER = document.querySelector("header");
const GAMETEXTSUBMIT = document.getElementById("game-text-submit");
const GAMETEXTAREA = document.getElementById("game-textarea");
const GAMESECTION = document.getElementById("game-section");
const USERSREADY = document.getElementById("usersReady");
const ALLUSERS = document.getElementById("allUsers");
const ROUND = document.getElementById("round");
const SHOWCASE = document.getElementById("showcase");
const BODY = document.querySelector("body");
const HTML = document.querySelector("html");
const ENDSECTION = document.getElementById("end-section");
const ENDNEXT = document.createElement("button");
const ENDCONTENT = document.getElementById("end-card-content");
const ENDFOOTER = document.getElementById("end-card-content-footer");
const ENDCARDUSERS = document.getElementById('end-card-users')
const SPAN = document.createElement("span");
const x = 5;
let i = 0;
let you = "";
let LASTCLICK = 0;
let ICON = "";
function IconChooser(data) {
	if (data.icon) {
		ICON =
			'<ion-icon class="icon-spacing-right icon-size-small" name="diamond-outline"></ion-icon>';
		return ICON;
	} else if (!data.icon) {
		ICON =
			'<ion-icon class="icon-spacing-right icon-size-small" name="person-circle-outline"></ion-icon>';
		return ICON;
	}
}
function BackToForm(data) {
	PLAYERLIST.innerHTML = "";
	CHATAREA.innerHTML = "";
	SOCKET.emit("removeUserElement", data);
	PREROOM.style.display = "none";
	JCSELC.style.display = "block";
}
function createElement(data, boolean) {
	IconChooser(data);
	const ITEM = document.createElement("li");
	ITEM.setAttribute("id", `${data.name}`);
	ITEM.setAttribute("class", "user-listitem");
	ITEM.innerHTML = `${ICON}<span></span>`;
	PLAYERLIST.appendChild(ITEM);
	if (boolean) {
		you = " (you)";
	} else {
		you = "";
	}
	document.getElementById(`${data.name}`).children[1].innerText += data.name + you;
}
function SystemMessage(data) {
	const ITEMSys = document.createElement("div");
	ITEMSys.setAttribute("class", "system-message");
	ITEMSys.innerText = data.message;
	CHATAREA.appendChild(ITEMSys);
	CHATAREA.scrollTop = CHATAREA.scrollHeight;
}
function updateReadyPLayers(data) {
	i++;
	USERSREADY.innerText = i;
	console.log("gotten datsa endpoint", data);
	if (!(i == data.quantity)) return;
	setTimeout(() => {
		i = 0;
		USERSREADY.innerText = i;
		if (!(parseInt(sessionStorage.getItem("from")) === 1)) return;
		SOCKET.emit("updateRound", data);
	}, 2000);
}

function getInfo(input) {
	if (input == undefined) {
		game = sessionStorage.getItem("lobby");
		to = sessionStorage.getItem("to");
		return (data = { to: to, game: game });
	} else if (input != undefined) {
		game = sessionStorage.getItem("lobby");
		to = sessionStorage.getItem("to");
		index = sessionStorage.getItem("name");
		from = sessionStorage.getItem("from");
		return (data = {
			data: { text: input, to: to, from: from, game: game, round: null },
			index: index,
		});
	}
}
function showNext(data) {
	data.find({ game: data.game });
	SPAN.innerHTML;
}

function fail(data) {
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
}

function StartGame(data) {
	document.title = "Paper Game";
	HEADER.style.display = "none";
	PREROOM.style.display = "none";
	GAMESECTION.style.display = "flex";
	const Element = data.gameIsOn.find((e) => {
		return e.name == data.users[SOCKET.id];
	});
	console.log("Element", Element);
	sessionStorage.setItem("lobby", Element.lobby);
	sessionStorage.setItem("name", Element.name);
	sessionStorage.setItem("from", Element.playerindex);
	if (Element.playerindex === data.all) {
		sessionStorage.setItem("to", 1);
	} else if (Element.playerindex < data.all) {
		sessionStorage.setItem("to", ++Element.playerindex);
	}
	ALLUSERS.innerText = data.all;
}

function startNewRound(data) {
	ROUND.innerText = data.rounds.curRound;
	GAMETEXTSUBMIT.setAttribute("disabled", false);
	const getNeededObj = data.senddata.find((e) => {
		return sessionStorage.getItem("from") == e.to && e.round == data.rounds.prevRound;
	});
	console.log("getNeededObj", getNeededObj);
	SHOWCASE.innerText = getNeededObj.text;
}

function endGame(data) {
	console.log('ok', data.curRoomUsers);
	for (e of data.curRoomUsers) {
		ENDCARDUSERS.innerHTML += `<span class="end-card-users">${e.name}</span>`
	}
	sessionStorage.clear();
	ROUND.innerText = "End!";
	GAMESECTION.style.display = "none";
	ENDSECTION.style.display = "flex";
		console.log("getData", data);
		ENDNEXT.addEventListener("click", () => {
			if (data.data.length != 0) {
				ENDCONTENT.innerHTML += `<div class="end-card-content-item"><span>${data.data[0].text}</span><br><span class="author">${data.data[0].fromStr}</span></div>`;
				data.data.shift();
			}
			/*else if () {

			}*/
		});
}

function success(data) {
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
}

function ActiveLobbyDataRequest(data) {
	if (data.length === 0) return;
	OPENLOBBYS.style.display = "block";
	OPENLOBBYS.children[0].innerHTML = "";
	for (object of data) {
		if (!object.icon) return;
		OPENLOBBYS.children[0].innerHTML += `<span>${object.name}</span><br />`;
	}
}
