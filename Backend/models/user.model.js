const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')


const userSchema=new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            required:true,
            minlength:[3,'First name must be at least 3 character long'],
        },
        lastname:{
            type:String,
            minlength:[3,'last name must be at least 3 character long'],
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minlength:[5,'email name must be at least 5 character long']

    },
    password:{
        type:String,
        required:true,
        select:false,
        minlength:[8,'password must be at least 8 character long']
    },
    socketId:{
        type:String
    }
}) 

userSchema.methods.generateAuthToken=function(){
    const token = jwt.sign(
        { _id: this.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token
}

userSchema.methods.comparepassword=async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};
  



const userModel=mongoose.model("User",userSchema)

//userModels are required in controllers

module.exports = userModel;


