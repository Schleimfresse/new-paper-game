import config from "../config/auth.config.mjs";
import lib from "../Lib/lib.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const signup = (req, res) => {
	const user = {
		alias: req.body.alias,
		username: `@${req.body.username}`,
		password: bcrypt.hashSync(req.body.password, 8),
	};
	console.log(user);
	lib.database.insert(user, (err, data) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}
		res.send({ message: "User was registered successfully!" });
	});
	lib.loadDatastore;
};
const signin = (req, res) => {
	lib.database.findOne(
		{
			username: `@${req.body.username}`,
		},
		(err, user) => {
			if (err) {
				res.status(500).send({ message: err });
			}

			if (!user) {
				return res.status(401).send({
					accessToken: null,
					status: "error",
					heading: "Invalid combination!",
					desc: "Your username, password combination was not correct, try again!",
				});
			}

			const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
			if (!passwordIsValid) {
				return res.status(401).send({
					accessToken: null,
					status: "error",
					heading: "Invalid combination!",
					desc: "Your username, password combination was not correct, try again!",
				});
			}

			const token = jwt.sign({ id: user._id }, config, {
				expiresIn: 604800, // 1 week
			});

			req.user = user;
			req.session.token = token;
			console.log(req.user);
			res.status(200).send({
				status: "success",
				heading: "Success",
				desc: `You have been successfully signed in as ${user.username}`,
			});
		}
	);
};

const signout = async (req, res) => {
	try {
		req.session = null;
		return res.status(200).send({ message: "You've been signed out!" });
	} catch (err) {
		this.next(err);
	}
};

export { signup, signin, signout };
