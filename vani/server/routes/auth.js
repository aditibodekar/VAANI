import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
const router=express.Router();
const code=()=>String(Math.floor(100000+Math.random()*900000));
const mailer=()=>nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
router.post('/signup',async(req,res)=>{try{
 const {name,email,password}=req.body;
 if(!name||!email||!password)return res.status(400).json({message:'All fields are required'});
 if(password.length<6)return res.status(400).json({message:'Password must be at least 6 characters'});
 let user=await User.findOne({email}); if(user&&user.verified)return res.status(409).json({message:'Account already exists'});
 const hashed=await bcrypt.hash(password,12); const verificationCode=code();
 user=user||new User({name,email,password:hashed}); user.name=name; user.password=hashed; user.verificationCode=verificationCode; user.verificationExpires=new Date(Date.now()+10*60*1000); user.verified=false; await user.save();
 if(process.env.SMTP_USER){await mailer().sendMail({from:process.env.SMTP_USER,to:email,subject:'Verify your Vani account',text:`Your Vani verification code is ${verificationCode}. It expires in 10 minutes.`});}
 res.status(201).json({message:'Account created. Enter the verification code.',email,devCode:process.env.NODE_ENV==='development'?verificationCode:undefined});
}catch(e){res.status(500).json({message:e.message});}});
router.post('/verify',async(req,res)=>{try{
 const {email,verificationCode}=req.body; const user=await User.findOne({email});
 if(!user||user.verificationCode!==verificationCode||!user.verificationExpires||user.verificationExpires<Date.now())return res.status(400).json({message:'Invalid or expired verification code'});
 user.verified=true; user.verificationCode=undefined; user.verificationExpires=undefined; await user.save();
 const token=jwt.sign({id:user._id,email:user.email,name:user.name},process.env.JWT_SECRET,{expiresIn:'7d'});
 res.json({message:'Email verified',token,user:{name:user.name,email:user.email}});
}catch(e){res.status(500).json({message:e.message});}});
router.post('/login',async(req,res)=>{try{
 const {email,password}=req.body; const user=await User.findOne({email}); if(!user)return res.status(401).json({message:'Invalid email or password'});
 if(!user.verified)return res.status(403).json({message:'Please verify your email first'});
 if(!(await bcrypt.compare(password,user.password)))return res.status(401).json({message:'Invalid email or password'});
 const token=jwt.sign({id:user._id,email:user.email,name:user.name},process.env.JWT_SECRET,{expiresIn:'7d'}); res.json({token,user:{name:user.name,email:user.email}});
}catch(e){res.status(500).json({message:e.message});}});
export default router;
