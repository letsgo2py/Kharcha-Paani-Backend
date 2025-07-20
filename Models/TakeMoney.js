const { Schema, model } = require("mongoose");

const takeMoneySchema = new Schema({
    amount: {
        type: Number, 
        required: true,
    },
    takeFrom: { 
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

const TakeMoney = model('TakeMoney', takeMoneySchema);

module.exports = TakeMoney