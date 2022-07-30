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
const STARTBT = document.createElement("button");
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
const SPAN = document.createElement("span");
const x = 5;
let i = 0;
let r = 1;
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
function setReadyPLayers(data) {
	USERSREADY.innerText = data.ready;
	ALLUSERS.innerText = data.all;
}
function updateReadyPLayers(data) {
	i++;
	USERSREADY.innerText = i;
	if (i == data) {
		setTimeout(() => {
			i = 0;
			USERSREADY.innerText = i;
			updateRound();
		}, 2000);
	}
}
function updateRound() {
	r++;
	GAMETEXTSUBMIT.removeAttribute("disabled");
	if (r === 7) {
		ROUND.innerText = "End!";
		endGame();
	} else {
		startNewRound();
		ROUND.innerText = r;
	}
}
function getInfo(input) {
	console.log('input head', input);
	if (r === 1) {
		let getinfo = GAMETEXTAREA.className;
		const fromSplited = getinfo.split(" ");
		from = fromSplited[0];
		game = fromSplited[1];
		index = fromSplited[2];
		if (index == undefined) {
			index = fromSplited[1];
		}
		return (data = { data: { text: input, from: from, game: game, round: r }, index: index });
	} else if (input == undefined) {
		let getinfo = GAMETEXTAREA.className;
		const fromSplited = getinfo.split(" ");
		from = fromSplited[0];
		parseInt(from);
		from++;
		game = fromSplited[1];
		return (data = { from: from, game: game, round: r - 1 });
		
	} else if (input != undefined) {
		let getinfo = GAMETEXTAREA.className;
		const fromSplited = getinfo.split(" ");
		from = fromSplited[0];
		game = fromSplited[1];
		index = fromSplited[2];
		return (data = { data: { text: input, from: from, game: game, round: r, index: index }});
	}
}
function showNext(data) {
	data.find({ game: data.game });
	SPAN.innerHTML;
}

function fail(data) {
	if (!(LASTCLICK >= Date.now() - 1000)) {
		if (data.boolean) {
			FAIL.innerHTML = data.message;
			FAIL.style.visibility = "visible";
		} else if (!data.boolean) {
			FAILCREATE.innerHTML = data.message;
			FAILCREATE.style.visibility = "visible";
		}
		LASTCLICK = Date.now();
	}
}
