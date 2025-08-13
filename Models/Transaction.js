const { Schema, model } = require("mongoose");

const transactionSchema = new Schema({
    amount: {
        type: Number, 
        required: true,
    },
    type: {    // income or expense
        type: String, 
        required: true,
    },
    category:{  
        type: String, 
        required: true,
    },
    date: {
        type: Date, 
        required: true,
    }, 
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // 🔗 this is the reference to your User model
      required: true,
    },
},
    {timestamps: true}
);

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction