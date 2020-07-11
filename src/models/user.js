const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Value cannot contain the word "Password"');
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    },
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;  //to remove avatar from profile response (slows down)

    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token: token});
    await user.save();
    return token;
}

//Creating findByCredentials function for login
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email});

    if(!user) {
        throw new Error('Unable to Login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to Login');
    }

    return user;
}

//middleware for hashing the password before saving
userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//Delete User Tasks when user is removed

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User