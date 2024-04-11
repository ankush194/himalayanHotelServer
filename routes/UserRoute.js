const express = require("express");
const router = express.Router();
const userModel = require("../models/UserModel");
const adminModel = require("../models/AdminModel");

router.post("/registerUser",async(req,res)=>{
    try{
        const {userName,userEmail,userPassword,userNumber} =  req.body;
        const users = await userModel.find({userEmail:userEmail});
        if(users.length>0){
            res.json({"message":"User Already Exits With Same Email!"});
        }else{
            const newUser = new userModel({
                userName ,
                userEmail ,
                userPassword ,
                userNumber
            });
            await newUser.save();
            const user = await userModel.findOne({userEmail:userEmail});
            res.json({...user,"message":"success"});
        }
    }catch(err){
        res.status(400).json({"message" : "internal server error"})
    }
})
router.post("/loginUser",async(req,res)=>{
    try{
        const {userEmail,userPassword} =  req.body;
        const user = await userModel.find({userEmail:userEmail});
        if(user.length<0){
            res.json({"message":"Please Login With Right Credentials!!"});
        }else{
            if(user[0].userPassword===userPassword){
                res.json({...user,"message":"success"});
            }else{
                res.json({"message":"Please Login With Right Credentials!!"});
            }
        }
    }catch(err){
        res.status(400).json({"message" : "internal server error"})
    }
})

router.get("/allUsers",async(req,res)=>{
    try {
        const users = await userModel.find({});
        res.json({users,"message":"success"})
    } catch (error) {
        res.status(400).json({"message" : "internal server error"})
    }
})

router.post("/isAdmin",async(req,res)=>{
    const {userId} = req.body ;
    try {
        const user = await userModel.findOne({_id:userId});
        const isAdmin = user.isAdmin ;
        console.log(isAdmin);
        res.json({isAdmin,"message" : "success"});
    } catch (error) {
        res.status(400).json({"message":"internal server error"});
    }
})

router.post("/loginAdmin",async(req,res)=>{
    const {userName,password} = req.body.adminDetails ;
    try {
        const admin = await adminModel.findOne({});
        console.log(admin)
        if(admin.password!=password&&admin.userName!=userName){
            res.json({"message" : "Please login with right credentials!!"});
        }else{
            res.json({"message":"success"});
        }
    } catch (error) {
        res.status(500).json({"message":"internal server error"})
    }
})

module.exports = router ;