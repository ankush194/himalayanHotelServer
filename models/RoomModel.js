const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
    room_id : {
        type : Number ,
        require : true
    },
    roomName:{
        type : String,
        require : true 
    },
    roomDescription :{
        type : String ,
        require : true ,
        default : "Lorem ipsum sit amet consectetur adipisicing elit. Inventore dicta autem maxime est deleniti assumenda omnis aliquid distinctio nemo ipsam! Quis officia maxime sed doloribus ea."
    },
    roomRent : {
        type : Number ,
        require : true 
    },
    maxCount : {
        type : Number ,
        require : true 
    },
    imageUrls : [],
    currentBookings : []
},{
    timestamps : true 
})

const roomModel = mongoose.model("rooms",roomSchema) ;

module.exports = roomModel ;