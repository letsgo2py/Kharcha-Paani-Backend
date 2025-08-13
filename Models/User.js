const bcrypt = require("bcrypt");
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String, 
        required: true,
    },
    email: { 
        type: String, 
        required: true,
        unique: true 
    },
    password: {
        type: String, 
        required: true,
    }, 
    current_balance: {
        type: Number, 
        default: 0,
    }, 
},
    {timestamps: true}
);

// It is Mongoose middleware
userSchema.pre("save", async function (next){
    if (!this.isModified("password")) return next();

    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (err) {
        return next(err);
    } 
})


userSchema.static("matchPassword", async function(email, password){
    try {
        const user = await this.findOne({ email });

        if (!user) {
            return { error: "Incorrect Email" };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return { error: "Incorrect Password" };
        }
        
        return user;
    } catch (err) {
        console.error("Authentication error:", err.message);
        return { error: "Server error during authentication" };
    }
})

const User = model('User', userSchema);

module.exports = User
