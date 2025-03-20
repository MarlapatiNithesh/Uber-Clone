const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long']
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long']
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: [5, 'Email must be at least 5 characters long'],
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    socketId:{
        type:String
    },
    status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    },
    vehicle:{
        color: {
            type:String,
            required:true,
            minlength:[3,'color must be at least 3 characters long']
        },
        plate:{
            type:String,
            required:true,
            minlength:[3,'plate must be at least 3 characters long']
        },
        capacity:{
            type:Number,
            required:true,
            min:[1,'capacity must be at least 1']
        },
        vehicleType:{
            type:String,
            required:true,
            enum:['car','moto','auto']
        }
    },
    location:{
        lat:{
            type:Number
        },
        lng:{
            type:Number
        }
    }

});

captainSchema.methods.generateToken = function(){
    const token=jwt.sign({_id:this._id},process.env.JWT_SECRET,{expiresIn:'24h'})

    return token
}

captainSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

captainSchema.methods.hashPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password,salt)
}

module.exports = mongoose.model('Captain', captainSchema);
