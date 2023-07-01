import middleware from "../middleware/index.mjs";
import * as controller from "../controller/auth.controller.mjs";
import express from "express";
let router = express.Router();

router.use(function (req, res, next) {
	res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
	next();
});

router.post(
	"/signup",
	[middleware.verifySignUp.checkDuplicateUsername],
	controller.signup
);

router.post("/signin", controller.signin);

router.post("/signout", controller.signout);

router.get("/signin", (req, res) => {
	res.sendFile(__dirname + "/public/signin.html");
})
router.get("/signup", (req, res) => {
	res.sendFile(__dirname + "/public/signup.html");
})

export default router;
