const express = require('express');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
require('dotenv').config();


const User = require('../Models/User');
const TakeMoney = require('../Models/TakeMoney');
const GiveMoney = require('../Models/GiveMoney');
const Transaction = require('../Models/Transaction');

const router = express.Router();


// router.get('/verify', (req, res) => {
//     res.status(200).json({ user: req.user }); // or a simple `{ authenticated: true }`
// });


// This verify if the cookie is present and valid 
router.get('/verify', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ message: 'Not authenticated' });
    }

    const userFromDb = await User.findById(req.user.id).select('-password'); // exclude password
    if (!userFromDb) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: userFromDb });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
});


router.patch('/balance', async (req, res) => {
    const {email, updateBal} = req.body;

    try{
        const user = await User.findOneAndUpdate(
            { email },
            { current_balance: updateBal },
            { new: true }
        );

        if(!user) return res.status(404).json({ message: 'User not found' });
    }catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    
});

router.post('/takemoney', async (req, res) => {
    const formData = req.body;

    try {
        const newEntry = new TakeMoney(formData);
        await newEntry.save();
        res.status(201).json({ message: 'Take Money record saved', data: newEntry });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})

router.post('/givemoney', async (req, res) => {
    const formData = req.body;
    try {
        const newEntry = new GiveMoney(formData);
        await newEntry.save();
        res.status(201).json({ message: 'Give Money record saved', data: newEntry });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})

router.post('/fetch-takemoney', async (req, res) =>{
    const { userId } = req.body;

    try {
        const records = await TakeMoney.find({ user: userId, marked: false }).sort({ createdAt: -1 });
        res.status(200).json({ records });
    } catch (err) {
        console.error('Error fetching take-money data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.post('/fetch-givemoney', async (req, res) =>{
    const { userId } = req.body;

    try {
        const records = await GiveMoney.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ records });
    } catch (err) {
        console.error('Error fetching take-money data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/schedule-email', (req, res) => {
  const { to, subject, text, datetime } = req.body;
  console.log("Text: ", text)
  const date = new Date(datetime);
  schedule.scheduleJob(date, () => {
    transporter.sendMail({
      from: process.env.EMAIL_ID,
      to,
      subject,
      text
    }, (err, info) => {
      if (err) console.error(err);
      else console.log('Email sent: ' + info.response);
    });
  });

  res.json({ message: 'Reminder scheduled!' });
});

router.post('/delete-TakeRecord', async (req, res) => {
  const { userId, Id} = req.body;

    try {
      await TakeMoney.findOneAndDelete({ _id: Id, user: userId });
      const records = await TakeMoney.find({ user: userId }).sort({ createdAt: -1 });
      res.status(200).json({ records });
    } catch (err) {
        console.error('Error fetching take-money data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.post('/delete-GiveRecord', async (req, res) => {
  const { userId, Id} = req.body;

    try {
      await GiveMoney.findOneAndDelete({ _id: Id, user: userId });
      const records = await GiveMoney.find({ user: userId }).sort({ createdAt: -1 });
      res.status(200).json({ records });
    } catch (err) {
        console.error('Error fetching give-money data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.post('/fetch-transaction', async (req, res) => {
  const { userId } = req.body;

    try {
        const records = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ records });
    } catch (err) {
        console.error('Error fetching take-money data:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.post('/transaction-add', async (req, res) => {
    const formData = req.body;
    if(!formData) return res.status(400).json({ message: "User Transaction Data is required "})
    try {
        const newEntry = new Transaction(formData);
        await newEntry.save();
        res.status(201).json({ message: 'Transaction record saved', data: newEntry });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})


router.post('/transaction-data', async (req, res) => {
    const { userId } = req.body;

    if(!userId) return res.status(400).json({ message: "User ID is required "})

    try {
      const userData = await Transaction.find({
        user: userId,
      }).sort({ date: 1 }); // optional: sort oldest to newest

      res.status(200).json({ message: 'Transaction data fetched successfully', data: userData });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
})

router.patch('/:id/mark', async (req, res) => {
  const { id } = req.params;
  const { marked } = req.body;

  try {
    const updated = await TakeMoney.findByIdAndUpdate(
      id,
      { marked },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

router.get('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const records = await TakeMoney.find({
      user: id,
      marked: true
    }).sort({ createdAt: -1 });

    res.status(200).json({ records });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }

})

module.exports = router;
