var mongoose=require("mongoose")
var userschema=mongoose.Schema({
    FirstName:{
        type:String,
        require:true
    },
    LastName:{
        type:String,
        require:true
    },
    Email:{
        type:String,
        require:true
    },
    Password:{
        type:String,
        require:true
    }
})

var User=mongoose.model("User", userschema)

module.exports=User

