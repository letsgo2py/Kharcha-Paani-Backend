const { Schema, model } = require("mongoose");

const giveMoneySchema = new Schema({
    amount: {
        type: Number, 
        required: true,
    },
    giveTo: { 
        type: String, 
        required: true,
    },
    date: {
        type: Date, 
    }, 
    interest: {
        type: Number, 
    }, 
    interestPeriod: {
        type: String,
    },
    reason: {
        type: String,
    },
    marked: {
        type: Boolean,
        default: false
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // 🔗 this is the reference to your User model
      required: true,
    },
},
    {timestamps: true}
);

const GiveMoney = model('GiveMoney', giveMoneySchema);

module.exports = GiveMoney