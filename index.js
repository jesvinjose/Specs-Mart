const mongoose=require('mongoose')                          //to connect to the database
mongoose.connect('mongodb://127.0.0.1:27017/project')       //create database project
.then(()=>console.log("Connection Successfull...."))
.catch((err)=>console.log(err));
const multer=require('multer')
const express=require('express');                          //to run the server using app
const session = require('express-session');
const Razorpay=require('razorpay');
const cloudinary=require('cloudinary');

const ejs=require('ejs');

cloudinary.config({ 
  cloud_name: 'dz0rmyh4n', 
  api_key: '891497115833535', 
  api_secret: 'IeuiwEaiE1XmHihxOi4NG9kqwiQ' 
});

const app=express();

app.use(express.static('public'))

//Set up the session middleware
app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
    })
  );
  // console.log(session,"hhhhh")

  // Register the session middleware before the route handlers
app.use(express.urlencoded({ extended: true }));

// Your route handlers go here

const userRoute =require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')

app.use('/',userRoute)
app.use('/',adminRoute)

const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

const path=require('path');
const { noCache } = require('./middlewares/routeMiddlewares');

app.set('view engine','ejs');
app.set('views','./views')

app.use(express.static(path.join(__dirname,'public')));


app.listen(3000,function(){
    console.log("Server is running:listento http://localhost:3000");
})
