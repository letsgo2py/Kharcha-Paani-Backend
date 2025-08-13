const { Schema, model } = require("mongoose");

const topGoalSchema = new Schema({
    goal: {
        type: String, 
    },
    time: { 
        type: String, 
    },
    cost: {
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

const TopGoal = model('TopGoal', topGoalSchema);

module.exports = TopGoal