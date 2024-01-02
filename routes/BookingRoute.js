const express = require('express');
const router = express.Router();
const moment = require('moment');
const nodemailer = require('nodemailer');
const bookingModel = require('../models/BookingModel');
const roomModel = require('../models/RoomModel');
const userModel = require('../models/UserModel');
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require('twilio')(accountSid, authToken);
const fromNumber = process.env.fromNumber;
const toNumber = process.env.toNumber;

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

let sendMessageToAdmin = (message) =>{
    client.messages
        .create({
            body: message,
            from: fromNumber,
            to: toNumber
        })
        .then(message => console.log(`SMS sent: ${message.sid}`))
        .catch(error => console.error(`Error sending SMS: ${error.message}`));
}


router.post("/bookRoom",async(req,res)=>{
    const {roomId,fromDate,toDate,userId} = req.body ; 
    try {
        const FromDate = moment(fromDate,'DD-MMM-YYYY');
        const ToDate = moment(toDate,'DD-MMM-YYYY');
        const user = await userModel.findOne({_id:userId});
        const totalDays = moment.duration(ToDate.diff(FromDate)).asDays()+1;
        console.log(totalDays)
        const room = await roomModel.findOne({room_id:roomId});
        const totalAmount = room.roomRent*totalDays ;
        const newBooking = new bookingModel({
            roomName : room.roomName ,
            room_id : room.room_id ,
            imageUrl : room.imageUrls[0],
            userName : user.userName ,
            userEmail : user.userEmail,
            totalAmount ,
            userId,
            fromDate,
            toDate,
            totalDays
        }) ;
        await newBooking.save();
        const bookingId  = newBooking._id ;
        room.currentBookings.push({bookingId,fromDate,toDate,roomId,userId,totalAmount,status:"booked"});
        await room.save();
        const message = `Hey, Got a new booking for ${room.roomName} from ${fromDate} to ${toDate} by ${user.userName} ${user.userEmail}!!`;
        sendMessageToAdmin(message);
        let mailOptions = {
            from: process.env.myEmail,
            to: user.userEmail,
            subject: 'BOOKING CONFIRMATION FROM THE HIMALAYAN HOTEL',
            html: `
            <div style="max-width:800px;text-align:justify;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif"><div class="adM">
                    </div><h1 style="text-align:center;color:#088178">ROOM BOOKED SUCCESSFULLY !</h1>
                    <h3>Hi,<span style="color:#088178">${user.userName}</span></h3>
                    <p style="color:#414141">
                        Thanks for choosing us!<br><br>
                        Just wanted to give you a confirmation that <span style="font-weight:bolder;color:#088178">your
                        booking for ${room.roomName} from ${fromDate} to ${toDate} has been successfully done.</span> We're here to
                        make your stay enjoyable. If you have any specific needs or requests for your stay, feel free to
                        let us know we are always at your service.
                        We're grateful for your stay and want to ensure that your stay will be very smooth and enjoyable. If
                        there's anything we can do to assist you, please don't hesitate to reach out us.
                        <br><br> Looking forward to make your check-in effortless!</p>
                    <h4>Welcome to <a href="https://hotel.rohitweb.tech" style="color:#088178;text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://hotel.rohitweb.tech&amp;source=gmail&amp;ust=1704270815561000&amp;usg=AOvVaw0dFCqzeb-cjn09mBU-Nq9q">THE HIMALAYAN HOTEL.</a></h4>
                    <a href="https://hotel.rohitweb.tech/mybookings" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://hotel.rohitweb.tech/mybookings&amp;source=gmail&amp;ust=1704270815561000&amp;usg=AOvVaw3OmZvcapVcpCnTtDKUQPny"><button style="border:none;padding:5px 10px;margin-top:20px;color:white;font-size:14px;background:#088178">
                        Click Here For More Information
                    </button></a><div class="yj6qo"></div><div class="adL"> 
                </div></div>
                `
        };
        sendEmail(mailOptions);
        res.json({"message":"success"})
    } catch (error) {
        console.log(error)
        res.status(400).json({"message":"internal server error"})
    }
})

router.post('/getUserBookings',async(req,res)=>{
    const {userId} = req.body ;
    try {
        const bookings = await bookingModel.find({userId});
            res.json({bookings});
    } catch (error) {
        res.status(400).json({"message" : "internal server error"});
    }
})

router.post("/cancelBooking",async(req,res)=>{
    const {bookingId} = req.body ;
    try {
        console.log(bookingId)
        const booking = await bookingModel.findOne({_id:bookingId});
        booking.status= "cancelled" ;
        await booking.save() ;
        const room = await roomModel.findOne({room_id:booking.room_id});
        let roomBookings = room.currentBookings ;
        room.currentBookings = roomBookings.filter(room=>{
            return room.bookingId != bookingId ;
        });
        await room.save();
        const allBookings = await bookingModel.find({userId : booking.userId});
        const message = `Oops, The booking for ${room.roomName} from ${booking.fromDate} to ${booking.toDate} by ${booking.userName} ${booking.userEmail} has been cancelled by the customer!!`;
        sendMessageToAdmin(message);
        let mailOptions = {
            from: process.env.myEmail,
            to: booking.userEmail,
            subject: 'BOOKING CENCELATION CONFIRMATION FROM THE HIMALAYAN HOTEL',
            html: `
            <div style="width:100%; display:flex; justify-content:center;">
                <div style="max-width:800px;text-align: justify; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <h1 style="text-align:center ; color:#088178">ROOM BOOKING CANCELLED !</h1>
                    <h3>Hi,<span style="color:#088178">${booking.userName}</span></h3>
                    <p style="color:#414141;">
                        Your Booking has been cancelled successfully!<br><br>
                        Just wanted to give you a confirmation that <span style="font-weight: bolder; color :#088178;">your
                        booking for ${booking.roomName} from ${booking.fromDate} to ${booking.toDate} has been cancelled as per your request.</span>
                    <h4>Best Regards from <a target="_blank" href="https://hotel.rohitweb.tech" style="color:#088178 ; text-decoration: none;">THE HIMALAYAN HOTEL.</a></h4>
                    <a target="_blank" href="https://hotel.rohitweb.tech/mybookings"><button style="border:none ; padding : 5px 10px ; margin-top : 20px ; color : white ; font-size:14px ; cursor: pointer ; background : #088178;">
                        Click Here For More Information
                    </button></a> 
                </div>
            </div>
                `
        };
        sendEmail(mailOptions);
        res.json(allBookings);
    } catch (error) {
        res.status(400).json({"message" : "internal server error"})
    }
})

router.get("/allBookings",async(req,res)=>{
    try{
        const bookings = await bookingModel.find({});
        res.send({bookings,"message":"success"});
    }catch(err){
        res.status(400).json({"message":"internal server error"});
    }
})

module.exports=router ;
