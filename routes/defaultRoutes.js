var express=require("express")
var router=express.Router()
var category=require("../models/Categorymodel")
var post=require("../models/post")
var user=require("../models/usermodel")
var bcrypt=require("bcryptjs")
var jwt=require("jsonwebtoken")
var auth=require("../auth")
var comment=require('../models/CommentModel')
var db=require("../db")
if(typeof localStorage === "undefined" || localStorage === null){
    var LocalStorage=require("node-localstorage").LocalStorage
    localStorage = new LocalStorage('./scratch')
}
db.on('error', (err)=>{
    console.log(err)
})

db.once('open', ()=>{
    router.get("/",async (req, res)=>{
        var cate= await category.find()
        var Post=await post.find()
        res.render("default/index", {records:cate, posts:Post})
    
        
        
    })
    
    router.get("/login", (req, res)=>{
        var loginuser=localStorage.getItem("usertoken")
        if(loginuser){
            res.redirect("/")
        }else{
            res.render("default/login")
        }
    })
    
    router.post("/login", (req, res)=>{
        user.find({Email:req.body.Email})
        .exec()
        .then(doc=>{
            if(bcrypt.compareSync(req.body.Password, doc[0].Password)){
                var token=jwt.sign({
                    _id:doc[0]._id
                }, "mykey123" , {
                    expiresIn:"1h"
                })
                localStorage.setItem("usertoken", token)
                req.flash("success-message", "Login Succesfully!!")
                res.redirect("/")
                
            }else{
                req.flash("error_message", "Incorrect Email or password!")
                res.redirect("/login")
            }
        })
    })
    
    router.get("/register", (req, res)=>{
        var loginuser=localStorage.getItem("usertoken")
        if(loginuser){
            res.redirect("/")
        }else{
            res.render("default/register")
        }
        
    })
    
    router.post("/register", (req, res)=>{
        bcrypt.hash(req.body.Password, 10, (err, hash)=>{
            if(err){
                req.flash("error_message", "Somthing was wrong!")
            }else{
                user.findOne({Email:req.body.Email}, (err, result)=>{
                    if(err){
                        req.flash("error_message", "Email already Present!")
                    }else{
                        var User=new user({
                            FirstName:req.body.FirstName,
                            LastName:req.body.LastName,
                            Email:req.body.Email,
                            Password:hash
                        })
                        User.save()
                        .then(doc=>{
                            console.log(doc)
                            req.flash("success-message", "Registration Succesfully!!")
                            res.redirect("/login")
                        })
                    }
                })
                
            }
        })
    })

    router.get("/logout", (req, res)=>{
        localStorage.removeItem("usertoken")
        res.redirect("/")
    })
    
    router.get("/post/:id", (req, res)=>{
        post.findOne({_id:req.params.id})
        .exec()
        .then(doc=>{
            var mongoclient=require("mongodb").MongoClient
            var url="mongodb://localhost:27017/CMS"
            mongoclient.connect(url, (err, db)=>{
                var dbo=db.db("CMS")
                dbo.collection("comments").aggregate([
                    {
                        $lookup:{
                            from: "users",
                            localField: "userId",
                            foreignField:"_id",
                            as:"disas"
                        }
                    },
                    {
                        $lookup:{
                            from:"posts",
                            localField:"_id",
                            foreignField:"comments",
                            as:"comas"
                        }
                    },
                    {
                        $project:{
                            FirstName:"$disas.FirstName",
                            LastName:"$disas.LastName",
                            body:1
                        }
                    }
                ]).toArray()
                .then(docs=>{
                    res.render("default/singlePost", {com:doc, list:docs})
                })
            })
        })
    })

    router.post("/post/:id",auth.auth, (req, res)=>{
        post.findById(req.body.id)
        .then(posts=>{
            var newcomment=new comment({
                userId:req.user._id,
                body:req.body.comment_body,

            })
            posts.comments.push(newcomment)
            posts.save()
            .then(data=>{
                newcomment.save().then(save=>{
                    req.flash("success-message", "Your Comment was sent")
                    res.redirect("/")
                })
            })
        })
    })

    

    
        
})

module.exports=router
