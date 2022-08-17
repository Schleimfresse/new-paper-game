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
const ENDCARDUSERS = document.getElementById("end-card-users");
const SPAN = document.createElement("span");
const END_BUTTON_WRAPPER = document.getElementById("end-bt-wrapper");
const PING_ELEMENT = document.getElementById("ping-update");
const PING_BOX = document.getElementById("ping-box");
const DURATION_ELEMENT = document.getElementById("duration");
const READY_BOX = document.getElementById("ready-box");
const x = 5;
let i = 0;
let you = "";
let LASTCLICK = 0;
let ICON = "";
let prevObj = undefined;
let currentChild = 0;
let called = false;
let openNewTabController = 0;
let date_instance = new Date();
let currentDate =
	date_instance.getFullYear() + "-" + (date_instance.getMonth() + 1) + "-" + date_instance.getDate();

function IconChooser(data) {
	if (data.icon) {
		ICON = '<ion-icon class="icon-spacing-right icon-size-small" name="diamond-outline"></ion-icon>';
		return ICON;
	} else if (!data.icon) {
		ICON = '<ion-icon class="icon-spacing-right icon-size-small" name="person-circle-outline"></ion-icon>';
		return ICON;
	}
}

function BackToForm(data) {
	PLAYERLIST.innerHTML = "";
	CHATAREA.innerHTML = "";
	ROOMNO.innerHTML = "";
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
		index = sessionStorage.getItem("index");
		from = sessionStorage.getItem("from");
		fromStr = sessionStorage.getItem("name");
		return (data = {
			data: { text: input, to: parseInt(to), fromStr: fromStr, from: parseInt(from), game: game, round: "" },
			index: index,
		});
	}
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
	READY_BOX.children[0].style.display = "flex";
	READY_BOX.children[1].style.display = "flex";
	const Element = data.gameIsOn.find((e) => {
		return e.name == data.users[SOCKET.id];
	});
	sessionStorage.setItem("lobby", Element.lobby);
	sessionStorage.setItem("name", Element.name);
	sessionStorage.setItem("from", Element.playerindex);
	sessionStorage.setItem("index", Element.playerindex);
	if (Element.playerindex === data.all) {
		sessionStorage.setItem("to", 1);
	} else if (Element.playerindex < data.all) {
		sessionStorage.setItem("to", ++Element.playerindex);
	}
	ALLUSERS.innerText = data.all;
}

function startNewRound(data) {
	ROUND.innerText = data.rounds.curRound;
	GAMETEXTSUBMIT.removeAttribute("disabled");
	const getNeededObj = data.senddata.find((e) => {
		return sessionStorage.getItem("from") == e.to && e.round == data.rounds.prevRound;
	});
	console.log("getNeededObj", getNeededObj);
	sessionStorage.setItem("index", getNeededObj.index);
	SHOWCASE.innerText = getNeededObj.text;
}

function getElementsForEnd(boolean) {
	if (boolean) {
		return document.querySelectorAll(".end-card-users");
	}
	if (!boolean) {
		return document.querySelectorAll(".endcontent-box");
	}
}

function endGame(data) {
	data.data.sort((a, b) => {
		return a.index - b.index;
	});
	READY_BOX.children[1].style.display = "none";
	READY_BOX.children[2].style.display = "flex";
	DURATION_ELEMENT.innerText = `${data.duration} min`;
	const PDF_ARRAY = data.data.slice();
	for (e of data.curRoomUsers) {
		ENDCARDUSERS.innerHTML += `<span class="end-card-users" id="enduser-${e.playerindex}">${e.name}</span>`;
		ENDCONTENT.innerHTML += `<div class="endcontent-box" id="enduser-${e.playerindex}-BOX"></div>`;
	}
	ENDCARDUSERS.children[0].classList.add("end-card-users-active");
	sessionStorage.clear();
	ROUND.innerText = "End!";
	GAMESECTION.style.display = "none";
	ENDSECTION.style.display = "flex";
	ENDNEXT.addEventListener("click", () => {
		onEndNextClick(data, PDF_ARRAY);
		SOCKET.emit("EndNextClick", data.lobby);
	});
	SOCKET.on("EndNextClick", () => {
		onEndNextClick(data, PDF_ARRAY);
	});
}

function onEndNextClick(data, PDF_ARRAY) {
	if (data.data.length === 0) return;
	if (prevObj != undefined && prevObj.index !== data.data[0].index) {
		openNewTabController++;
		if (openNewTabController === 1) {
			currentChild++;
			document.getElementById(`enduser-${prevObj.index}-BOX`).style.display = "none";
			getElementsForEnd(true).forEach((e) => {
				e.classList.remove("end-card-users-active");
			});
			ENDCARDUSERS.children[currentChild].classList.add("end-card-users-active");
		}
		if (openNewTabController === 2) {
			document.getElementById(
				`enduser-${data.data[0].index}-BOX`
			).innerHTML += `<div class="end-card-content-item"><span>${data.data[0].text}</span><br><span class="author">${data.data[0].fromStr}</span></div>`;
			document.getElementById(`enduser-${data.data[0].index}-BOX`).style.display = "block";
			prevObj = data.data.shift();
			openNewTabController = 0;
		}
	} else {
		console.log("trigger 3");
		document.getElementById(
			`enduser-${data.data[0].index}-BOX`
		).innerHTML += `<div class="end-card-content-item"><span>${data.data[0].text}</span><br><span class="author">${data.data[0].fromStr}</span></div>`;
		document.getElementById(`enduser-${data.data[0].index}-BOX`).style.display = "block";
		prevObj = data.data.shift();
	}

	if (data.data.length === 0 && !called) {
		getElementsForEnd(true).forEach((element) => {
			element.setAttribute("onclick", "changeTab(this.id);");
			element.style.cursor = "pointer";
		});
		SOCKET.emit("leaveRoom", data.lobby);
		ENDNEXT.style.display = "none";
		called = true;
		END_BUTTON_WRAPPER.innerHTML += `<button type="button" id="download_pdf" class="bt2 icon-spacing-right"><span class="bt__icon"><ion-icon name="download-outline"></ion-icon></span><span class="bt__text">Download as PDF</span></button> <button type="button" onclick="window.location.href = '/'" class="bt2"><span class="bt__icon"><ion-icon name="home-outline"></ion-icon></span><span class="bt__text">Home</span></button>`;
		document.getElementById("download_pdf").onclick = function () {
			console.log("PDF_ARRAY", PDF_ARRAY);
			createPDF(PDF_ARRAY, currentDate);
		};
	}
}
function createPDF(data, date) {
	let doc = {
		content: [],
		styles: {
			header: {
				fontSize: 22,
				bold: true,
				characterSpacing: 1.2,
				//decoration: "underline"
			},
			paragraph: {
				lineHeight: 1.2
			},
			author: {
				alignment: "right",
				color: "#a3a3a3"
			},
		}
	};
	while (data.length !== 0) {
		if (prevObj === undefined || prevObj.index !== data[0].index) {
			let line = {canvas: [{ type: 'line', x1: 0, y1: 1, x2: 595-2*40, y2: 1, lineWidth: 1 }]}
			let header = { text: data[0].fromStr, style: "header" };
			let textcontent = { text: `\n${data[0].text}`, style: "paragraph" };
			let author = { text: data[0].fromStr, style: "author" };
			doc.content.push(header);
			doc.content.push(line);
			doc.content.push(textcontent);
			doc.content.push(author);
			prevObj = data.shift();
		} else {
			let textcontent = { text: data[0].text, style: "paragraph" };
			let author = { text: data[0].fromStr, style: "author" };
			doc.content.push(textcontent);
			doc.content.push(author);
			prevObj = data.shift();
		}
	}
	pdfMake.createPdf(doc).download(`paper_game-${date}`);
}

function changeTab(element) {
	getElementsForEnd(true).forEach((e) => {
		e.classList.remove("end-card-users-active");
	});
	getElementsForEnd(false).forEach((e) => {
		e.style.display = "none";
	});
	document.getElementById(`${element}-BOX`).style.display = "block";
	document.getElementById(element).classList.add("end-card-users-active");
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
	if (!data.boolean) {
		const elements = Array.from(OPENLOBBYS.children[0].children);
		const result = elements.find((e) => {
			return e.textContent.includes(data.data.name);
		});
		result.remove();
	}
	if (data.boolean) {
		OPENLOBBYS.style.display = "block";
		for (object of data.data) {
			if (!object.icon) return;
			OPENLOBBYS.children[0].innerHTML += `<span>${object.name}<br /></span>`;
		}
	}
	if (!OPENLOBBYS.children[0].hasChildNodes()) {
		OPENLOBBYS.style.display = "none";
	}
}
