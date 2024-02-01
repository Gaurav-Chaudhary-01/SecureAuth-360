const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema= new mongoose.Schema({

    first_name:{
        type:String,
        // required:true,
    },
    last_name:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        // required:true,
        unique:true
    },
    pass:{
        type:String,
        // required:true,
        unique:true
    },
    address:{
        type:String,
        // required:true
    },
    city:{
        type:String,
        // required:true
    },
    pincode:{
        type:Number,
        // required:true
    },
    date:
        { type : Date, 
            default: Date.now },
        
      confirmpass:{
                type:String,
            // required:true,
         unique:true
     },
    tokens:[{
        token:{
            type:String,
            // required:true
        }
    }]

});


//GENERATING TOKEN

userSchema.methods.generateAuthToken=async function(){
    try {

        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
        
    } catch (error) {
        res.send("error part"+error);
    }
}



//HASHING

userSchema.pre("save", async function(next){

    if(this.isModified("pass")){

        console.log(`the current password is ${this.pass}`);
    this.pass=await bcrypt.hash(this.pass,10);
    console.log(`the current password is ${this.pass}`);

    this.confirmpass=undefined;

    }
    next();
});


//Collection

const Register=new mongoose.model("Register",userSchema);

module.exports=Register;