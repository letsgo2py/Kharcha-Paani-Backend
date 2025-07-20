const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        if (error.code === 11000 && error.keyPattern?.email) {
            // Duplicate email
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await User.matchPassword(email, password);
        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        const token = jwt.sign(
            { id: result._id, username: result.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        // Set cookie here
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // secure: false,    // Set to false in development (no HTTPS on localhost)
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,  // 1d
        });

        // console.log("Token from login route: ", token)
        res.status(200).json({ message: 'Login successful', user: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// router.get('/verify', (req, res) => {
//     res.status(200).json({ user: req.user }); // or a simple `{ authenticated: true }`
// });

// router.post('/logout', (req, res) => {
//     res.clearCookie('token', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//     });
//     res.status(200).json({ message: 'Logged out successfully' });
// });

module.exports = router;