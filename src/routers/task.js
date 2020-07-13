const express=require('express');
const router=new express.Router();
const Task=require('../models/task');
const auth=require('../middleware/auth');

router.post('/tasks',auth,async (req,res)=>{ // create a task 
    //const task=new Task(req.body);
    const task=new Task({...req.body,owner:req.user._id})
    try{
        await task.save();
        res.status(201).send(task);
    }
    catch(err){
        res.status(400).send(err);
    }
 
});

router.get('/tasks',auth,async (req,res)=>{ // get all tasks

    const match={};
    const sort={};
    if(req.query.completed){
        match.completed=req.query.completed==='true';
    }

    if(req.query.sortBy){
        const parts=req.query.sortBy.split('_');
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }
        try{
            //const tasks=await Task.find({owner:req.user._id});
            await req.user.populate({
                path:'tasks',
                 match,
                 options:{
                     limit:parseInt(req.query.limit),
                     skip:parseInt(req.query.skip),
                     sort
                 }
                }).execPopulate();
            res.send(req.user.tasks);
        }
        catch(err){
            res.status(500).send(err.message);
        }
});

 router.get('/tasks/:id',auth,async (req,res)=>{ // get a task by ID
    try{
     const task=await Task.findOne({_id:req.params.id,owner:req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }
    catch(err){
        res.status(500).send(err);
    }
 });


 router.patch('/tasks/:id',auth,async (req,res)=>{ //update a task by ID
     const toUpdate=Object.keys(req.body); //containts the keys of what to update from the user
     const allowedUpdates=['description','completed'];
     const isValid=toUpdate.every(p=>allowedUpdates.includes(p));
     
     if(!isValid){
         return res.status(500).send({error:"Not a valid update"})
     }

    try{
        const task= await Task.findOne({_id:req.params.id,owner:req.user._id});

       //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        if(!task){
            return res.status(404).send();
        }

        toUpdate.forEach(update=>task[update]=req.body[update]); // manually updates user fildes that are in the to update array  
        await task.save();
        res.send(task);
    }catch(err){
        res.status(500).send(err);
    }

 });

 router.delete('/tasks/:id',auth, async (req,res)=>{ //delete a task by ID
     try{
       const task=await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if(!taks){
             res.status(404).send();
        }
        res.send(task);
     }
     catch(err){
         res.status(500).send(err);
     }
 });


module.exports=router;