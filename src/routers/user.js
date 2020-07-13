const express=require('express');
const router=new express.Router();
const User=require('../models/user');
const auth=require('../middleware/auth');
const multer=require('multer');
const {sendWelcomeEmail}=require('../emails/acount');
const {sendCancalationEmail}=require('../emails/acount');
const sharp=require('sharp');
const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/.(jpg|jpeg|npg)$/)){
            return cb(new Error('File must be an Image'));
        }
        cb(undefined,true);
    }
        
});


router.post('/users',async (req,res)=>{//create a user sign up
    const user=new User(req.body);
    try{
        await user.save();
        sendWelcomeEmail(user.email,user.name);
        const token=await user.generateAuthToken();
        res.status(201).send({user,token});
        }
        catch(err){
            res.status(500).send(err);
        }
});

router.post('/users/login',async (req,res)=>{ // login a user
    try{
    const user=await User.findByCredentials(req.body.email,req.body.password);
    const token= await  user.generateAuthToken();
    res.send({user,token});
    }
    catch(err){
        res.send();
    }

});

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>token.token!==req.token);
        await req.user.save();
        res.send();
        }
    catch(e){
        res.status(500).send();
    }
});

router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        res.send();
        }
    catch(e){
        res.status(500).send();
    }
});

router.get('/users/me',auth,async (req,res)=>{ // get all users
    res.send(req.user); 
});

router.patch('/users/me',auth,async (req,res)=>{// update a user by ID the loged in user
    const updates=Object.keys(req.body); // array of keys to update from user
    const allowed=["name","email","password","age"];
    let isValid=updates.every(up=>allowed.includes(up));

    if(!isValid){
        return response.status(404).send({error:'Inavlid Updates'});
    }
    try{
       updates.forEach((update)=>req.user[update]=req.body[update]); // update manually user info from update array
       await req.user.save();
        res.send(req.user);
    }
    catch(err){
        res.status(400).res(err);
    }
});

router.delete('/users/me',auth,async (req,res)=>{ // delete a user by ID
    try{
        
        
        await req.user.remove();
        sendCancalationEmail(req.user.email,req.user.name)
        res.send(req.user);
    }
    catch(err){
        res.status(500).send(err.message );
    }
});

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    // req.user.avatar=req.file.buffer;
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250  }).png().toBuffer();
    req.user.avatar=buffer;
    await req.user.save();
    res.send();
},(err,req,res,next)=>{
    res.status(400).send({error:err.message});
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined;
    await req.user.save();

    res.send();
});

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user=await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error();
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);

    }catch(err){
        res.status(404).send();
    }
});


module.exports=router;