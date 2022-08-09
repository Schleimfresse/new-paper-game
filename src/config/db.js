const mongoose = require("mongoose");
const Text = require("../models/content");

const connectDB = async () => {
	try {
		await mongoose.connect(
			process.env.URI,
			async () => {
				console.log("connected");
				await Text.deleteMany()
			},
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		);
	} catch (err) {
		console.error("Database connection error: ", err);
	}
};

module.exports = connectDB;
