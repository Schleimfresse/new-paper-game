// Initial - start -
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
global.__dirname = __dirname;
import * as path from "path";
import { fileURLToPath } from "url";
import Lib from "./src/Lib/Lib.mjs";
import UserAuth from "./src/UserAuth/index.mjs";
import cookieSession from "cookie-session";
import Datastore from "nedb";
const tag_database = new Datastore("tags.db");
const database = new Datastore("database.db");
Lib.app.use(
	cookieSession({
		name: "PaperShuffle-session",
		keys: ["key1", "key2"],
		secret: process.env.key,
		httpOnly: true,
	})
);
tag_database.loadDatabase();
database.loadDatabase();
Lib.app.use(Lib.express.static(__dirname + "/public"));
Lib.app.use("/auth", UserAuth.authRoutes);
Lib.app.set("view engine", "ejs");
Lib.app.set("views", path.join(__dirname, "public/views/"));
Lib.app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
	next();
});

// initial - end -
Lib.app.get(
	"/",
	[UserAuth.middleware.authJwt.verifyTokenSoft, UserAuth.middleware.authJwt.setUser],
	(req, res) => {
		res.status(200).render(__dirname + "/public/views/index.ejs", {
			data: { user: req.user },
		});
	}
);

Lib.app.get(
	"/archive",
	[UserAuth.middleware.authJwt.verifyToken, UserAuth.middleware.authJwt.setUser],
	(req, res) => {
		res.status(200).render(__dirname + "/public/views/archive.ejs", {
			data: { user: req.user },
		});
	}
);

Lib.app.get(
	"/archive/add",
	[UserAuth.middleware.authJwt.verifyToken, UserAuth.middleware.authJwt.setUser],
	(req, res) => {
		res.status(200).render(__dirname + "/public/views/add.ejs", {
			data: { user: req.user },
		});
	}
);

Lib.app.get("/api/:id", (req, res) => {
	database.find({ _id: req.params.id }, (err, data) => {
		if (err) {
			res.end();
			return;
		}
		res.json(data);
	});
});

Lib.app.get(
	"/archive/:id",
	[UserAuth.middleware.authJwt.verifyToken, UserAuth.middleware.authJwt.setUser],
	(req, res) => {
		res.status(200).render(__dirname + "/public/views/page.ejs", {
			data: { user: req.user },
		});
	}
);

Lib.app.post("/add", (req, res) => {
	console.log("ADDED: ", req.body);
	database.insert(req.body, (err) => {});
	res.json({ title: "Success", desc: "Successfully added page!", status: 200 });
});

Lib.app.get("/api", (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const resultsPerPage = 8;
	const startIndex = (page - 1) * resultsPerPage;
	const endIndex = startIndex + resultsPerPage;
	database.find({}, (err, data) => {
		if (err) {
			res.end("<h1>500 Internal Server Error</h1>");
			return;
		}
		const totalPages = Math.ceil(data.length / resultsPerPage);
		const results = data.slice(startIndex, endIndex);
		console.log(totalPages);
		res.json({ results: results, total: totalPages });
	});
});

Lib.app.post("/api/tags/add", (req, res) => {
	tag_database.find({title: req.body.title}, (err, data) => {
		console.log(data.length);
		if (data.length !== 0) {
			res.json({ title: "Conflict", desc: "Tag already exists!", status: 409 });
			return;
		}
		tag_database.insert(req.body, (err) => {
			if (err) {
				res.json({ title: "Error", desc: "500 Internal Server Error", status: 500 });
				return;
			}
			res.json({ title: "Success", desc: "Successfully added tag!", status: 200 });
		});
	})
});

Lib.app.get("/api/tags", (req, res) => {
	tag_database.find({}, (err, data) => {
		if (err) {
			res.end("<h1>500 Internal Server Error</h1>");
			return;
		}
		console.log('TAGS' + data);
		res.json(data);
	});
});

Lib.app.get("/app", (req, res) => {
	res.status(200).sendFile(__dirname + "/public/app.html");
	Lib.io.sockets.on("connection", connected);
	function connected(socket) {
		console.log("A new client was registed");
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
			Lib.rounds[data.lobby] = 1;
			Lib.removeStartedRoomFromArray(Lib.userToRoom, data);
			const currentRoomUsers = Lib.gameIsOn.filter((e) => {
				return e.lobby == data.lobby;
			});
			Senddata = { gameIsOn: Lib.gameIsOn, users: Lib.users, all: currentRoomUsers.length };
			Lib.io.in(data.lobby).emit("StartGame", Senddata);
		});

		socket.on("EndNextClick", (data) => {
			console.log("data on server", data);
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
});

// Error handling

Lib.app.use(function (req, res) {
	res.status(404);
	res.sendFile(__dirname + "/public/404.html");
	return;
});
