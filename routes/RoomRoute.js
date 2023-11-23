const express = require("express");
const router = express.Router();
const RoomModel = require("../models/RoomModel");

router.get("/getRooms",async(req,res)=>{
    try{
        const rooms = await RoomModel.find({});
        res.json(rooms);
    }catch(err){
        res.status(400).json({"message" : "error"}) ;
    }
})

router.post("/getRoomDetail",async(req,res)=>{
    const {roomId} = req.body ;
    try {
        const room = await RoomModel.find({room_id:roomId});
        if(room.length>0){
            res.json({...room,"message":"success"});
        }
    } catch (error) {
        res.status(400).json({"message" : "internal server error"})
    }
})

router.post("/setRoomData",async(req,res)=>{
    const {roomName,room_id,roomRent,maxCount,imageUrl} = req.body ;
    try {
        const room = await RoomModel.find({room_id});
        if(room.length>0){
            res.json({"message":"A room already exit with same number !!"}) ;
        }else{
            const newRoom = await new RoomModel({
                roomName ,
                room_id : parseInt(room_id) ,
                roomRent : parseInt(roomRent), 
                maxCount : parseInt(maxCount),
                imageUrls : imageUrl
            }) ;
            await newRoom.save();
            res.json({"message":"success"});
        }
    } catch (error) {
        res.status(400).json({"message" : "internal server error"})
    }
})

module.exports = router ;