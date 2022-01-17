import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import axios from "axios";
import "dotenv/config";

const passwordReset = async (req, res) => {
	try {
		const existingUser = await User.findOne({ email: req.body.email });

		if (!existingUser) {
			return res.status(404).json({ message: "Account not found" });
		}

		const token = jwt.sign({ email: req.body.email }, process.env.SECRET_KEY, {
			expiresIn: "1d",
		});

		existingUser.passwordResetToken = token;

		await existingUser.save();

		await axios.post("http://localhost:6000/email/sendEmail", {
			email: existingUser.email,
			subject: "Password reset",
			text: `Hello, use the following link to set your new password. http://localhost:5000/user/setNewPassword/${token}`,
		});

		res
			.status(200)
			.json({ token: token, message: "Use this token to reset password" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export default passwordReset;
