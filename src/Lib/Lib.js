// Init start
const bodyparser = require("body-parser");
const express = require("express");
require("dotenv").config();
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;
const bodyparsing = app.use(bodyparser.json({ limit: "1mb" }));
const listen = server.listen(port, () => {
	console.log(`app listening at Port: ${port}`);
});
const Text = require("../models/content");
const User = require("../models/users");
const static = app.use(express.static("src/public"));
const connectDB = require("../config/db");
// Init end
// Global variables start
/**
 * An Object which holds all rooms and in which round they are currently in
 * @returns {Object} An Object with all rooms and in which round they are currently in
 * @public
 */
let rounds = {};
/**
 * A list of socket ids with the associated username.
 * @returns A list with all current online users.
 * @public
 */
let users = {};
/**
 * Contains all users who are currently online and in which room they are
 * @returns The current online users
 * @public
 */
let userToRoom = [];
/**
 * Contains all users who are currently in a game - Array
 * @returns an array with all users who are currently in a game
 * @public
 */
let gameIsOn = [];
/**
 * Contains all rooms that are created and active; empty rooms are deleted
 * @returns a list of the current created rooms and from which user they are created, usally the same, because the room is named after the user
 * @public
 */
let roomNo = {};
/**
 * An Object which holds a Timestamp when the round was created
 * @returns {*} Number
 * @public
 */
let duration = {};
// Global variables end
function join(data, socket) {
	let lobby = roomNo[data.lobby];
	if (data.name.length > 15) {
		data = {
			boolean: true,
			message: `Your name cannot be longer than 15 characters!<br>your name is currently ${data.name.length} characters long`,
		};
		socket.emit("fail", data);
		return;
	}
	if (data.lobby !== lobby) {
		data = { boolean: true, message: "This lobby does not exists" };
		socket.emit("fail", data);
		return;
	}
	if (!checkName(data)) {
		data = {
			boolean: true,
			message: "In that lobby you wanted to join,<br /> is already someone with that name",
		};
		socket.emit("fail", data);
		return;
	}
	socket.join(lobby);
	console.log(`New client connection: room nr. ${lobby} (${socket.id})`);
	let senddata = {
		room: lobby,
		name: data.name,
		icon: false,
	};
	socket.emit("success", senddata);
	console.log("Just came: ", data.name);
	users[socket.id] = data.name;
	let createData = userToRoom.filter(function (e) {
		return e.lobby == lobby;
	});
	userToRoom.push({
		name: data.name,
		lobby: lobby,
		socketid: socket.id,
		icon: false,
	});
	socket.emit("createOtherOnlineUsers", createData);
	console.log("usertoroom", userToRoom);
}

function create(data, socket) {
	if (data === roomNo[data]) {
		data = { boolean: false, message: "This lobby already exists" };
		socket.emit("fail", data);
		return;
	}
	roomNo[data] = data;
	socket.join(roomNo[data]);
	console.log(`New client connection: room nr. ${roomNo[data]} (${socket.id})`);
	let datacreate = {
		room: roomNo[data],
		name: data,
		icon: true,
	};
	socket.emit("success", datacreate);
	socket.emit("START_BT");
	console.log("Just came: ", data);
	users[socket.id] = data;
	userToRoom.push({
		name: data,
		lobby: roomNo[data],
		socketid: socket.id,
		icon: true,
	});
	io.emit("ActiveLobbyDataRequest", { data: roomNo, boolean: true });
	console.log("usertoroom", userToRoom);
}

function disconnect(socket) {
	console.log("DISCONNECTION for ", socket.id);
	console.log("disconn user: ", users[socket.id]);
	let dcuser = users[socket.id];
	if (dcuser != undefined) {
		let dcuserFinal = userToRoom.find((e) => {
			return e.name == dcuser;
		});
		array = userToRoom;
		controll = false;
		if (dcuserFinal === undefined) {
			dcuserFinal = gameIsOn.find((e) => {
				return e.name == dcuser;
			});
			array = gameIsOn;
			controll = true;
		}
		Systemdata = { message: `${dcuserFinal.name} has left the lobby` };
		io.to(dcuserFinal.lobby).emit("SystemMessage", Systemdata);
		io.to(dcuserFinal.lobby).emit("removeUserElement", { user: dcuserFinal.name });
		if (dcuserFinal.name === dcuserFinal.lobby && !controll) {
			io.to(dcuserFinal.lobby).emit("SystemMessage", {
				message: `${dcuserFinal.name} disconnected, the room will be terminated; you will be redirected shortly.`,
			});
			setTimeout(() => {
				io.to(dcuserFinal.lobby).emit("terminate");
			}, 4000);
		}
		if (controll) {
			io.to(dcuserFinal.lobby).emit("GameIsOn_interruption", {
				message: `${dcuserFinal.name} has left the game or disconnected, the round will end shortly;<br>you will be redirected in a moment.`,
			});
		}
		if (controll || dcuserFinal.lobby === dcuserFinal.name) {
			socket.leave(dcuserFinal.lobby);
			io.to(dcuserFinal.lobby).socketsLeave(dcuserFinal.lobby);
			let filtered = array.filter((e) => e.lobby === dcuserFinal.lobby);
			filtered.forEach((e) => delete users[e.socketid]);
			removeAllUsersFromArray(dcuserFinal, array);
			if (io.sockets.adapter.rooms.get(dcuserFinal.lobby) === undefined) {
				// When lobby is empty (dcuser.lobby), because all clients left and the room then gets deleted, the room gets removed from the array
				delete roomNo[dcuserFinal.lobby];
			}
			io.emit("ActiveLobbyDataRequest", { data: roomNo, boolean: false });
		} else {
			socket.leave(dcuserFinal.lobby);
			removeDisconnectFromArray(array, socket);
			if (io.sockets.adapter.rooms.get(dcuserFinal.lobby) == undefined) {
				delete roomNo[dcuserFinal.lobby];
			}
			delete users[socket.id];
		}
	}
}

/**
 * Removes the entry of the disconnected user from the userToRoom array.
 * @param {Object} userToRoom - Array
 * @returns the updated userToRoom array
 * @public
 */
function removeDisconnectFromArray(array, socket) {
	const indexOfObject = array.findIndex((e) => {
		return e.socketid == socket.id;
	});
	array.splice(indexOfObject, 1);
}
function removeStartedRoomFromArray(array, data) {
	const ARRAYLENGTH = array.length;
	for (let i = 0; i < ARRAYLENGTH; i++) {
		const index = array.findIndex((e) => {
			return e.lobby == data.lobby;
		});
		if (index !== -1) {
			let spliceArray = array.splice(index, 1);
			let obj = spliceArray[0];
			const filterforobjects = gameIsOn.filter((e) => {
				return e.lobby == obj.lobby;
			});
			obj.playerindex = filterforobjects.length + 1;
			gameIsOn.push(obj);
		}
	}
}
async function addContentToDb(data) {
	data.data.round = rounds[data.data.game]; // Gives the dataflow the current round
	console.log("Data from addContentToDb", data);
	let content = new Text({
		text: data.data.text,
		to: data.data.to,
		from: data.data.from,
		fromStr: data.data.fromStr,
		round: data.data.round,
		game: data.data.game,
		index: data.index,
	});
	console.log("content", content);
	await content.save();

	const quantity = gameIsOn.filter((e) => {
		return e.lobby == data.data.game;
	});
	senddata = { object: data, quantity: quantity.length };
	io.in(data.data.game).emit("updateReadyPlayers", senddata);
}
function checkName(data) {
	const check = userToRoom.some((e) => e.name === data.name && e.lobby === data.lobby);
	if (check) {
		return false;
	} else {
		return true;
	}
}
function removeAllUsersFromArray(dcuser, array) {
	const indexOfObject = array.filter((e) => {
		return e.lobby == dcuser.lobby;
	});
	for (i = indexOfObject.length - 1; i >= 0; i--) {
		array.splice(indexOfObject[i], 1);
	}
}
async function getData(data) {
	senddata = await Text.find({
		game: data.object.data.game,
		round: rounds[data.object.data.game] - 1,
	}); // Getting the data from the previous round, therefore the "rounds" variable must be reduced by one
	senddata.forEach((e) => {
		e.from = e.index;
	});
	finaldata = {
		senddata: senddata,
		data: data.dataall,
		rounds: {
			curRound: rounds[data.object.data.game],
			prevRound: rounds[data.object.data.game] - 1,
		},
	};
	io.in(data.object.data.game).emit("startNewRound", finaldata);
}
async function getDataForEnd(data) {
	const currentRoom = gameIsOn.filter((e) => {
		return e.lobby == data.object.data.game;
	});
	searchdata = await Text.find({ game: data.object.data.game });
	let duration_res = Date.now() - duration[data.object.data.game];
	duration_res = duration_res / 1000 / 60;
	duration_res = Math.round((duration_res + Number.EPSILON) * 100) / 100;
	finaldata = {
		data: searchdata,
		all: currentRoom.length,
		curRoomUsers: currentRoom,
		duration: duration_res,
		lobby: data.object.data.game,
	};
	io.in(data.object.data.game).emit("endGame", finaldata);
	await Text.deleteMany({ game: data.object.data.game });
	clearData(data.object.data.game);
}

function clearData(game) {
	let filtered = gameIsOn.filter((e) => e.lobby === game);
	filtered.forEach((e) => gameIsOn.splice(gameIsOn.indexOf(e), 1));
	filtered.forEach((e) => delete users[e.socketid]);
	delete roomNo[game];
	delete rounds[game];
	delete duration[game];
}

module.exports = {
	bodyparser,
	app,
	express,
	server,
	io,
	port,
	bodyparsing,
	listen,
	static,
	rounds,
	users,
	userToRoom,
	gameIsOn,
	roomNo,
	join,
	create,
	disconnect,
	removeDisconnectFromArray,
	removeStartedRoomFromArray,
	addContentToDb,
	checkName,
	removeAllUsersFromArray,
	Text,
	User,
	connectDB,
	getData,
	getDataForEnd,
	duration,
};
