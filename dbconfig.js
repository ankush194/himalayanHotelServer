const mongoose = require("mongoose") ;

const db_url = process.env.db_url ;

mongoose.connect(process.env.database, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const con = mongoose.connection ;

con.on("connected",()=>{
    console.log("db connected")
})

con.on("error",()=>{
    console.log("db connection error")
})

module.exports = mongoose ;