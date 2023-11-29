const express = require("express");
const app = express();
const dbconfig = require("./dbconfig") ;
const RoomRoute = require("./routes/RoomRoute") ;
const UserRoute = require("./routes/UserRoute") ;
const BookingRoute = require('./routes/BookingRoute')
const cors = require("cors");
const moment = require('moment');
const nodemailer = require('nodemailer')
const bookingModel = require('./models/BookingModel');
const roomModel = require('./models/RoomModel');

app.use(express.json());
app.use(cors());
app.use(RoomRoute);
app.use(UserRoute);
app.use(BookingRoute);

setInterval(async () => {
    let date = moment().format('DD-MMM-YYYY');
    let time = moment().format('LTS');
    if (time === "12:30:00 PM") {
        sendPreAlertMail(date);
    } else if (time === "12:45:00 PM") {
        sendCheckOutMail(date);
    }
}, 1000);

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.myEmail,
        pass: process.env.password
    }
});

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function sendPreAlertMail(date) {
    const bookings = await bookingModel.find({ toDate: date });
    if (bookings.length > 0) {
        bookings.forEach(booking => {
            if (booking.status === "booked") {
                console.log("checking out");
                let mailOptions = {
                    from: process.env.myEmail,
                    to: booking.userEmail,
                    subject: 'PRE CHECK OUT ALERT FROM THE HIMALAYAN HOTEL',
                    html: `
                    <div style="width:100%; display:flex; justify-content:center;">
                        <div style="max-width:800px;text-align: justify; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <h1 style="text-align:center ; color:#088178">PRE CHECK OUT ALERT !</h1>
                            <h3>Hi,<span style="color:#088178">${booking.userName}</span></h3>
                            <p style="color:#414141;">
                                Hope you've been enjoying your time with us!<br><br>
                                Just wanted to give you a heads-up that <span style="font-weight: bolder; color :#088178;">your check-out time for the
                                    booking of ${booking.roomName} from ${booking.fromDate} to ${booking.toDate} is toady at 12:45 PM.</span> We're here to
                                make your departure hassle-free. If you have any specific needs or requests for your check-out, feel free to
                                let us know in advance.
                                We're grateful for your stay and want to ensure that your departure is as smooth as your stay has been. If
                                there's anything we can do to assist you before you go, please don't hesitate to reach out.
                                <br><br> Looking forward to making your check-out effortless!</p>
                            <h4>Regards from <a target="_blank" href="https://hotel.rohitweb.tech" style="color:#088178 ; text-decoration: none;">THE HIMALAYAN HOTEL.</a></h4>
                            <a target="_blank" href="https://hotel.rohitweb.tech/mybookings"><button style="border:none ; padding : 5px 10px ; margin-top : 20px ; color : white ; font-size:14px ; cursor: pointer ; background : #088178;">
                                Click Here For More Information
                            </button></a> 
                        </div>
                    </div>
                        `
                };
                sendEmail(mailOptions);
            }
        });
    }
}

async function sendCheckOutMail(date){
    console.log('hi')
    const bookings = await bookingModel.find({ toDate: date });
    if(bookings.length>0){
        bookings.forEach(async(booking)=>{
            if(booking.status==="booked"){
                const room = await roomModel.findOne({room_id:booking.room_id});
                let roomBookings = room.currentBookings ;
                room.currentBookings = roomBookings.filter(room=>{
                   return room.bookingId != booking._id ;
                });
                await room.save();
                booking.status="checked out";
                let mailOptions = {
                    from: process.env.myEmail,
                    to: booking.userEmail,
                    subject: 'CHECK OUT CONFIRMATION FROM THE HIMALAYAN HOTEL',
                    html: `
                    <div style="width:100%; display:flex; justify-content:center;">
                        <div style="max-width:800px;text-align: justify; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            <h1 style="text-align:center ; color:#088178">CHECK OUT CONFIRMATION !</h1>
                            <h3>Hi,<span style="color:#088178">${booking.userName}</span></h3>
                            <p style="color:#414141;">
                                Hope you've enjoyed your time with us!<br><br>
                                Just wanted to give you a confirmation that <span style="font-weight: bolder; color :#088178;">your
                                    booking for ${booking.roomName} from ${booking.fromDate} to ${booking.toDate} has been checked out automatically from hotel side as your check out time has been reached.</span> We're here to
                                make your departure hassle-free. If you have any specific needs or requests for your check-out, feel free to
                                let us know in advance.
                                We're grateful for your stay and want to ensure that your departure is as smooth as your stay has been. If
                                there's anything we can do to assist you before you go, please don't hesitate to reach out.
                                <br><br>Thanks for stay with us ! Please Visit Again</p>
                            <h4>Regards from <a target="_blank" href="https://hotel.rohitweb.tech" style="color:#088178 ; text-decoration: none;">THE HIMALAYAN HOTEL.</a></h4>
                            <a target="_blank" href="https://hotel.rohitweb.tech/mybookings"><button style="border:none ; padding : 5px 10px ; margin-top : 20px ; color : white ; font-size:14px ; cursor: pointer ; background : #088178;">
                                Click Here For More Information
                            </button></a> 
                        </div>
                    </div>
                        `
                };
                sendEmail(mailOptions);
                await booking.save();
            }
        })
    }
}




app.get("/",async(req,res)=>{
    res.json({"message" : "This is Rohit's Server"});
})

app.listen(5500,()=>{
    console.log("Server is running on port 5500");
})
