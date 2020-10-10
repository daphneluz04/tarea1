const mongoose=require('../connect');
const user=({
    foto:String,
    nombre:String,
    email:String,
    password:String 
});
const usermodel=mongoose.model('user', user);
module.exports=usermodel;
