import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        let existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({ email, password: hashed });

        res.json({ message: "User created", userId: user._id });
    } catch (err) {
        res.status(500).json({ error: "Signup error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.json({
            token,
            user: { id: user._id, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ error: "Login error" });
    }
};
