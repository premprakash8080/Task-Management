import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    username:{
        type:String,
        unique:[true,"Please choose a different username"]
    },
    password: {
        type: String,
         required: true
    },
    name:String,
    lastName:String,
    public:{
        type:Boolean,
    },
    profilePhoto:{
        type:String,
        default:'default.jpg'
    },
    createdDate:{
        type:Date,
        default:Date.now
    }
})

export const User = mongoose.model('user',UserSchema);