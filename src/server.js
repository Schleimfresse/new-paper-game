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
	console.log(Lib.roomNo)
	Lib.io.emit("ActiveLobbyDataRequest", { data: Lib.roomNo, boolean: true });

	socket.on("join", (data) => {
		Lib.join(data, socket);
	});
	socket.on("create", (data) => {
		Lib.create(data, socket);
	});

	socket.on("addContentToDb", (senddata) => {
		Lib.addContentToDb(senddata, socket);
	});

	socket.on("removeUserElement", (data) => {
		delete Lib.users[socket.id];
		socket.leave(data.lobby);
		Lib.io.to(data.lobby).emit("removeUserElement", data);
		if (data.user === data.lobby) {
			Lib.io.emit("ActiveLobbyDataRequest", { data: Lib.roomNo, boolean: false });
			socket.leave(data.lobby);
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
		Lib.duration[data.lobby] = Date.now();
		Lib.rounds[data.lobby] = 5;
		Lib.removeStartedRoomFromArray(Lib.userToRoom, data);
		const currentRoomUsers = Lib.gameIsOn.filter((e) => {
			return e.lobby == data.lobby;
		});
		Senddata = { gameIsOn: Lib.gameIsOn, users: Lib.users, all: currentRoomUsers.length };
		Lib.io.in(data.lobby).emit("StartGame", Senddata);
	});

	socket.on("EndNextClick",(data) => {
		console.log('data on server', data);
		socket.to(data).emit("EndNextClick");
	});

	socket.on("SystemMessage", (data) => {
		socket.to(data.lobby).emit("SystemMessage", data);
	});

	socket.on("updateRound", (data) => {
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

	socket.on("leaveRoom", (data) => {
		socket.leave(data);
	});

	socket.on("ping", function () {
		socket.emit("pong");
	});

	socket.on("disconnect", () => {
		Lib.disconnect(socket);
	});
}
// Main content - end -

// Error handling

Lib.app.use(function (req, res) {
	res.status(404);
	res.sendFile(__dirname + "/public/404.html");
	return;
});
