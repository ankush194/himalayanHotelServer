const express = require("express");
const app = express();
const dbconfig = require("./dbconfig") ;
const RoomRoute = require("./routes/RoomRoute") ;
const UserRoute = require("./routes/UserRoute") ;
const BookingRoute = require('./routes/BookingRoute')
const cors = require("cors");
const EmailSending = require('./routes/EmailSending');

app.use(express.json());
app.use(cors());
app.use(RoomRoute);
app.use(UserRoute);
app.use(BookingRoute);
app.use(EmailSending);


app.get("/",async(req,res)=>{
    res.json({"message" : "This is Rohit's Server"});
})

app.listen(5500,()=>{
    console.log("Server is running on port 5500");
})
