// Initial - start -
const Lib = require("./Lib/Lib.js");
Lib.static;
Lib.bodyparsing;
Lib.listen;
Lib.connectDB();
// initial - end -

Lib.io.sockets.on("connection", connected);
// Main content - start -
function connected(socket) {
	console.log("A new client was registed");
	socket.on("join", (data) => {
		let lobby = Lib.roomNo[data.lobby];
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
		if (!Lib.checkName(data)) {
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
		Lib.users[socket.id] = data.name;
		let createData = Lib.userToRoom.filter(function (e) {
			return e.lobby == lobby;
		});
		Lib.userToRoom.push({
			name: data.name,
			lobby: lobby,
			socketid: socket.id,
			icon: false,
		});
		socket.emit("createOtherOnlineUsers", createData);
	});
	socket.on("create", (data) => {
		if (data === Lib.roomNo[data]) {
			data = { boolean: false, message: "This lobby already exists" };
			socket.emit("fail", data);
			return;
		}
		Lib.roomNo[data] = data;
		socket.join(Lib.roomNo[data]);
		console.log(`New client connection: room nr. ${Lib.roomNo[data]} (${socket.id})`);
		let datacreate = {
			room: Lib.roomNo[data],
			name: data,
			icon: true,
		};
		socket.emit("success", datacreate);
		socket.emit("START_BT");
		console.log("Just came: ", data);
		Lib.users[socket.id] = data;
		Lib.userToRoom.push({
			name: data,
			lobby: Lib.roomNo[data],
			socketid: socket.id,
			icon: true,
		});
		Lib.io.emit("ActiveLobbyDataRequest", { data: Lib.userToRoom, boolean: true });
	});

	socket.on("addContentToDb", (senddata) => {
		senddata.data.round = Lib.rounds[senddata.data.game]; // Gives the dataflow the current round
		Lib.addContentToDb(senddata);
		const quantity = Lib.gameIsOn.filter((e) => {
			return e.lobby == senddata.data.game;
		});
		data = { object: senddata, quantity: quantity.length };
		Lib.io.in(senddata.data.game).emit("updateReadyPlayers", data);
	});

	socket.on("removeUserElement", (data) => {
		delete Lib.users[socket.id];
		console.log("data", data);
		socket.leave(data.lobby);
		Lib.io.to(data.lobby).emit("removeUserElement", data);
		if (data.user === data.lobby) {
			Lib.io.emit("ActiveLobbyDataRequest", { data: { name: data.user }, boolean: false });
			socket.leave(data.lobby);
			Lib.removeAllUsersFromArray(data);
			Lib.io.to(data.lobby).emit("SystemMessage", {
				message: `${data.user} left the lobby, the room will be terminated; you will be redirected shortly.`,
			});
			setTimeout(() => {
				Lib.io.to(data.lobby).emit("terminate");
				Lib.io.to(data.lobby).socketsLeave(data.lobby);
				if (Lib.io.sockets.adapter.rooms.get(data.lobby) == undefined) {
					delete Lib.roomNo[data.lobby];
				}
			}, 5000);
		}
		Lib.removeDisconnectFromArray(Lib.userToRoom, socket);
	});

	socket.on("NewUserUpdateOtherClients", (data) => {
		socket.to(data.room).emit("AddElementToOtherClients", data);
	});

	socket.on("ActiveLobbyDataRequest", () => {
		Lib.io.emit("ActiveLobbyDataRequest", { data: Lib.userToRoom, boolean: true });
	});

	socket.on("getInfoForChat", (data) => {
		let userObject = Lib.userToRoom.find((e) => {
			return e.socketid == data;
		});
		let playerAmount = Lib.userToRoom.filter((e) => {
			return e.lobby == userObject.lobby;
		});
		data = { user: userObject.name, lobby: userObject.lobby, amount: playerAmount.length };
		Lib.io.to(data.lobby).emit("getInfoForChat", data);
	});

	socket.on("sendMessageToOtherClients", (data) => {
		socket.to(data.lobby).emit("sendMessageToOtherClients", data);
	});

	socket.on("StartGame", (data) => {
		Lib.rounds[data.lobby] = 5;
		Lib.removeStartedRoomFromArray(Lib.userToRoom, data);
		const currentRoomUsers = Lib.gameIsOn.filter((e) => {
			return e.lobby == data.lobby;
		});
		Senddata = { gameIsOn: Lib.gameIsOn, users: Lib.users, all: currentRoomUsers.length };
		Lib.io.in(data.lobby).emit("StartGame", Senddata);
	});

	socket.on("SystemMessage", (data) => {
		socket.to(data.lobby).emit("SystemMessage", data);
	});

	socket.on("updateRound", (data) => {
		console.log("159", data);
		Lib.rounds[data.object.data.game]++;
		if (Lib.rounds[data.object.data.game] === 7) {
			Lib.getDataForEnd(data);
		} else {
			Lib.getData(data, Lib.rounds[data.object.data.game]);
		}
	});

	socket.on("getDataForEnd", (data) => {
		Lib.getDataForEnd(data);
	});
	
	socket.on("disconnect", () => {
		console.log("DISCONNECTION for ", socket.id);
		console.log("disconn user: ", Lib.users[socket.id]);
		let dcuser = Lib.users[socket.id];
		if (dcuser != undefined) {
			dcuser = Lib.userToRoom.find((e) => {
				return e.name == dcuser;
			});
			Systemdata = { message: `${dcuser.name} has left the lobby` };
			Lib.io.to(dcuser.lobby).emit("SystemMessage", Systemdata);
			Lib.io.to(dcuser.lobby).emit("removeUserElement", { user: dcuser.name });
			if (dcuser.name === dcuser.lobby) {
				Lib.io.emit("ActiveLobbyDataRequest", { data: { name: dcuser.name }, boolean: false });
				socket.leave(dcuser.lobby);
				Lib.io.to(dcuser.lobby).socketsLeave(dcuser.lobby);
				Lib.removeAllUsersFromArray(dcuser);
				if (Lib.io.sockets.adapter.rooms.get(dcuser.lobby) == undefined) {
					// When lobby is empty (dcuser.lobby), because all clients left and the room then gets deleted, the room gets removed from the array
					delete Lib.roomNo[dcuser.lobby];
				}
				console.log("roomNo", Lib.roomNo);
				Lib.io.to(dcuser.lobby).emit("SystemMessage", {
					message: `${dcuser.name} disconnected, the room will be terminated; you will be redirected shortly.`,
				});
				setTimeout(() => {
					Lib.io.to(dcuser.lobby).emit("terminate");
				}, 5000);
			} else {
				socket.leave(dcuser.lobby);
				Lib.removeDisconnectFromArray(Lib.userToRoom, socket);
				if (Lib.io.sockets.adapter.rooms.get(dcuser.lobby) == undefined) {
					delete Lib.roomNo[dcuser.lobby];
				}
			}
		}
		delete Lib.users[socket.id];
	});
}
// Main content - end -

// Error handling

Lib.app.use(function (req, res) {
	res.status(404);
	res.sendFile(__dirname + "/public/404.html");
	return;
});
