const express=require('express');
const app=express();
const userRouter=require('./routers/user');
const taskRouter=require('./routers/task');
require('./db/mongoose'); //runs the file



const port=process.env.PORT;

 
app.use(express.json());// automatically parses 
app.use(userRouter);
app.use(taskRouter);



app.listen(port,()=>{
    console.log('Server is up on port '+port);
});








