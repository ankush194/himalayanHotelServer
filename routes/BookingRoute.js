const express = require('express');
const router = express.Router();
const moment = require('moment');
const bookingModel = require('../models/BookingModel');
const roomModel = require('../models/RoomModel');
const userModel = require('../models/UserModel');

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