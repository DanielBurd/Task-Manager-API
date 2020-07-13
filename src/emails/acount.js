const sgMail=require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail=(eamil,name)=>{
    sgMail.send({
        to:eamil,
        from:'danielb18@gmail.com',
        subject:'Thanks for joining in',
        text:`Welcome to the app ${name}, let me know how you get along with the app`
    })
};

const sendCancalationEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"danielb18@gmail.com",
        subject:'Goodbye...',
        text:`Hope you had great time using the App ${name}, let us know how we can improve`
    })   
;}

module.exports={
    sendWelcomeEmail,
    sendCancalationEmail
}