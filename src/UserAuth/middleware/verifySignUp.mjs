import lib from "../Lib/lib.mjs";
const checkDuplicateUsername = (req, res, next) => {
	lib.database.findOne(
		{
			username: `@${req.body.username}`,
		},
		(err, user) => {
			if (err) {
				res.status(500).send({ message: err });
				return;
			}

			if (user) {
				res.status(400).send({ message: "Failed! Username is already in use!" });
				return;
			}
            next();
		}
	);
};

const verifySignUp = {
	checkDuplicateUsername,
};

export { verifySignUp };
