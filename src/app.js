require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt= require("bcryptjs");
const cookieParser = require('cookie-parser');
const auth=require('./middleware/auth');
const app = express();
require('./db/conn');

const Register = require("./models/userregister");


const port=process.env.PORT || 3000;

const static_path=path.join(__dirname, '../public');
const templates_path=path.join(__dirname, '../templates/views');
const partials_path=path.join(__dirname, '../templates/partials');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended:false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);


app.get('/', (req, res) => {
  res.render("index");
});

//SECRET PAGE 

app.get('/secret', auth , (req, res) => {
  // console.log(`this is the cookie we get ${req.cookies.jwt}`);
  
  res.render("secret");
});


app.get('/logout', auth , async(req, res) => {
 
try {

  //Logout for single Device

  // req.user.tokens=req.user.tokens.filter((currElement)=>{
  //   return currElement.token!==req.token;
  // })
  

  //Logout from all devices

  req.user.tokens=[];

  
  res.clearCookie("jwt");

  console.log('logout successful');

  await req.user.save();

  res.render("login");
  
} catch (error) {
  res.status(500).send(error);
}
});


//Register User 

app.get('/register', (req, res) => {
  res.render("register");
});

//Create a new user

app.post('/register', async(req, res) => {

  try{

    const password=req.body.pass;
    const cpassword=req.body.confirmpass;

    if(password===cpassword){


      const reguser = new Register({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        pass: req.body.pass,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        date: req.body.date,
        confirmpass: req.body.confirmpass
      });



      const token = await reguser.generateAuthToken();

      res.cookie("jwt", token,{
        expires: new Date(Date.now() + 600000),
        httpOnly: true
      });

      
    const registered = await reguser.save();
    res.status(201).render("index");

    }else{
        res.send(" Password not matching")
    }


  }catch(err){
    res.status(400).send(err);
  }
  
});

//Login User

app.get('/login', (req, res) => {
  res.render("login");
});

//Verify User 

app.post('/login', async(req, res) => {

  try {

    const logemail=req.body.loginemail;
    const logpassword=req.body.loginpass;

    const useremail=await Register.findOne({email:logemail});

    //LOGIN HASHING

    const isMatch=await bcrypt.compare(logpassword, useremail.pass);

    //LOGIN TOKEN GENERATE

    const token = await useremail.generateAuthToken();
    console.log("the token part " + token);
    


    res.cookie("jwt", token,{
      expires: new Date(Date.now() + 600000),
      httpOnly: true
    });



    if(isMatch){
      res.status(201).render("index");
    }else{
      res.send(" Invalid password");
    }
       
  } catch (error) {
    res.status(400).send("Invalid Login Details");
  }
});



app.listen(port, () => {
  console.log(`Connected on Port ${port}`);
});