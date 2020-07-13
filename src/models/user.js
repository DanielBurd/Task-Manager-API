const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const Task=require('./task');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number');
            }
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invaild')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(validator.contains(value,'password')){
                throw new Error('Password can not contain the word password');
            }
        }
    },
    tokens:[{
            token:{
                type:String,
                required:true
                
            }
        }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});

userSchema.statics.findByCredentials = async (email,password) => { // static metohd on the model
    const user=await User.findOne({email});
    if(!user){
        throw new Error('unable to login');
    }

    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('unable to login')
    }

    return user;
};

userSchema.methods.generateAuthToken= async function(){ //methodd on a specific user
    const user=this;
    const token=jwt.sign({_id:user.id.toString()},process.env.JWT_SECRET);
    user.tokens=user.tokens.concat({token});
    await user.save();
    return token;

};

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
});

userSchema.methods.toJSON=function (){
    const user=this;
    const userObj=user.toObject();
   delete userObj.password;
   delete userObj.tokens;
   delete userObj.avatar;
    return userObj;
};

userSchema.pre('save',async function(next){ // hash the plane text password before saving
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();
});

userSchema.pre('remove',async function(next){
    const user=this;
    await Task.deleteMany({owner:user._id});
    next();
})
const User=mongoose.model('User',userSchema)


module.exports=User;