const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userName : {
        type : String,
        require : true 
    },
    userEmail : {
        type : String ,
        require : true 
    },
    userPassword : { 
        type : String ,
        require : true 
    },
    userContact : {
        type : String
    }, 
    isAdmin : {
        type : Boolean ,
        require : true ,
        default : false 
    }
},{
    timestamps : true 
})

const userModel = mongoose.model("users",userSchema);

module.exports = userModel ;