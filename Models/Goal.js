const { Schema, model } = require("mongoose");

const GoalSchema = new Schema({
    title: {
        type: String, 
    },
    category: { 
        type: String, 
    },
    icon: {
        type: String, 
    }, 
    targetAmt: {
        type: Number, 
    }, 
    unit: {
        type: String, 
    },
    currentAmt: {
        type: Number, 
    }, 
    deadline: {
        type: Date, 
    }, 
    notes: {
        type: String, 
    }, 
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // 🔗 this is the reference to your User model
      required: true,
    },
},
    {timestamps: true}
);

const Goal = model('Goal', GoalSchema);

module.exports = Goal