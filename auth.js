var jwt=require("jsonwebtoken")
var User=require("./models/usermodel")

var auth=async(req, res, next)=>{
    try{
        var token=localStorage.getItem("usertoken")
        var data=jwt.verify(token, "mykey123")
        var user=await User.findOne({_id:data._id})

        req.user=user
        next()
    }catch (error){
        res.redirect("/login")
    }
}

module.exports={auth}