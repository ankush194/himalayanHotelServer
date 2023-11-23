const mongoose = require("mongoose") ;

const db_url = "mongodb://0.0.0.0/HimalayanHotel" ;

mongoose.connect(db_url);

const con = mongoose.connection ;

con.on("connected",()=>{
    console.log("db connected")
})

con.on("error",()=>{
    console.log("db connection error")
})

module.exports = mongoose ;