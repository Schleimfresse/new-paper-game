import jwt from "jsonwebtoken";
import config from "../config/auth.config.mjs";
import lib from "../Lib/lib.mjs";

const verifyToken = (req, res, next) => {
	let token = req.session.token;
	if (!token) {
		return res.status(403).render(__dirname + "/public/views/auth.ejs", {
			heading: "You are not logged in",
			desc: "You can access this page only if you are logged in",
			type: "Login",
			link: "auth/signin",
		});
	}

	jwt.verify(token, config, (err, decoded) => {
		if (err) {
			return res.status(401).render(__dirname + "/public/views/auth.ejs", {
				heading: "Unauthorized!",
				desc: "Token could not be found",
				type: "Home",
				link: "",
			});
		}
		req.userId = decoded.id;
		console.log("req.userId:", req.userId);
	});
	next();
};

const verifyTokenSoft = (req, res, next) => {
	console.log("SOFT");
	let token = req.session.token;
	if (!token) {
		req.userId = "";
		console.log("SOFT no token");
		next();
	}
	if (token) {
		jwt.verify(token, config, (err, decoded) => {
			if (err) {
				req.userId = "";
			} else {
				req.userId = decoded.id;
				console.log("req.userId:", req.userId);
			}
			next();
		});
	}
};

const setUser = (req, res, next) => {
	lib.database.loadDatabase();
	lib.database.findOne({ _id: req.userId }, {}, (err, user) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}
		console.log("Set user" + user);
		if (user === null) {
			req.user = {
				username: "",
				display_text: "Not logged in",
			};
		} else {
			req.user = user;
			req.user.display_text = `Logged in as ${req.user.alias}`;
			delete req.user.password;
		}
		next();
	});
};

const authJwt = {
	verifyToken,
	setUser,
	verifyTokenSoft
};
export default authJwt;
