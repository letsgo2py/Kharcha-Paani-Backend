const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const { checkAuth } = require("./Middlewares/checkAuth");

const app = express();
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  'http://localhost:5173',                   // for local dev
  'https://kharcha-paani-frontend.netlify.app'       // for production
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true  //  Crucial: allows cookies to be sent
}));

app.use(cookieParser());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.use('/auth', require('./Routes/auth'));
app.use('/user', checkAuth, require('./Routes/user'));

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})