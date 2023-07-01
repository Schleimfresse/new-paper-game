import mongoose from "mongoose";
import Text from "../models/content.mjs";

/*const connectDB = async () => {
	try {
		await mongoose.connect(
			process.env.URI,
			async () => {
				console.log("connected");
				await Text.deleteMany();
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

export default connectDB;
*/