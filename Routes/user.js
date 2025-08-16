const express = require('express');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
require('dotenv').config();
const { checkAuth } = require("../Middlewares/checkAuth");


const User = require('../Models/User');
const TakeMoney = require('../Models/TakeMoney');
const GiveMoney = require('../Models/GiveMoney');
const Transaction = require('../Models/Transaction');
const TopGoal = require('../Models/TopGoal');
const Goal = require('../Models/Goal');

const router = express.Router();


// This verify if a request is from a logged-in user
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

router.get('/balance', async (req, res) => {
    const id = req.user.id;

    try{
        const user = await User.findById(id);
        if(!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ balance: user.current_balance });
    }catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    
});

router.patch('/balance', async (req, res) => {
    const {updateBal} = req.body;
    const id = req.user.id;

    try{
        const user = await User.findOneAndUpdate(
            { _id: id },
            { current_balance: updateBal },
            { new: true }
        );

        if(!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ balance: user.current_balance });
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
        const records = await GiveMoney.find({ user: userId, marked: false }).sort({ createdAt: -1 });
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
    let updated = await TakeMoney.findByIdAndUpdate(
      id,
      { marked },
      { new: true }
    );

    if (!updated) {
      updated = await GiveMoney.findByIdAndUpdate(
        id,
        { marked },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ message: 'Transaction not found in either collection' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

router.get('/history', async (req, res) => {
  const id = req.user.id;

  try {
    const takeMoneyRecords = await TakeMoney.find({
      user: id,
      marked: true
    }).sort({ createdAt: -1 });

    const giveMoneyRecords = await GiveMoney.find({
      user: id,
      marked: true
    }).sort({ createdAt: -1 });

    let records = [...takeMoneyRecords, ...giveMoneyRecords];
    //sorted by createdAt
    records = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ records });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }

})

// GOALS -------


// Get the top goal for the user
router.get('/top-goal',  async (req, res) => {
  const userId = req.user.id; // ✅ Comes from checkAuth middleware

  try {
    const goal = await TopGoal.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!goal) {
      return res.status(404).json({ message: 'No goal found for this user' });
    }
    res.status(200).json({ data: goal });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Add a new top-goal
router.post('/top-goal', async (req, res) => {
  const { goal, time, cost } = req.body;
  const userId = req.user.id; // ✅ Comes from checkAuth middleware

  if (!goal && (time || cost)) {
    return res.status(400).json({ message: 'Goal is required' });
  }

  try {
    const newGoal = new TopGoal({
      goal,
      time,
      cost,
      user: userId // ✅ Comes from checkAuth middleware
    });

    await newGoal.save();

    // Count total goals for this user
    const count = await TopGoal.countDocuments({ user: userId });

    // If more than 10, delete the oldest ones
    if (count > 10) {
      const excess = count - 10;
      // Step 1: Find the oldest goals
      const oldestGoals = await TopGoal.find({ user: userId })
        .sort({ createdAt: 1 }) // oldest first
        .limit(excess)
        .select('_id');

      // Step 2: Delete them by ID
      await TopGoal.deleteMany({
        _id: { $in: oldestGoals.map(g => g._id) }
      });
    }

    res.status(201).json({
      message: 'Top Goal created successfully',
      data: newGoal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get all the goals for the user
router.get('/goals', async (req, res) => {
  const userId = req.user.id; 

  try {
    const goals = await Goal.find({ user: userId });
    res.status(200).json({ goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new goal
router.post('/add-goal', async (req, res) => {
  const formData = req.body;
  const userId = req.user.id; 

  if (!formData) {
    return res.status(400).json({ message: 'Data required' });
  }

  try {
    const newGoal = new Goal({
      ...formData,
      user: userId 
    });

    await newGoal.save();
    res.status(201).json({ message: 'Goal created successfully', data: newGoal });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
