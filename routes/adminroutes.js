var express=require("express")
var router=express.Router()
var post=require("../models/post")
var user=require("../models/usermodel")
var category=require("../models/Categorymodel")
var db=require('../db')
var mkdirp=require("mkdirp")
var multer=require("multer")
var path=require("path")
var auth=require("../auth")
//var admincontroller=require("../controller/admincontroller")

var storage=multer.diskStorage({
    destination: "./public/postimage/",
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
  });

  var Upload=multer({storage:storage}).single('uploadedFile')


db.on('error', (err)=>{
    console.log(err)
})
// router.all('/*',auth.auth, (req, res, next) => {

//     req.app.locals.layout = 'admin';

//     next();
// });
db.once('open', ()=>{
    
    
    router.get("/", (req, res)=>{
        res.render("admin/index" ,{layout:'admin'})
    })
    
    router.get("/posts",auth.auth, (req, res)=>{
        
        var mongoclient=require("mongodb").MongoClient
        var url="mongodb://localhost:27017/CMS"
        mongoclient.connect(url, (err, db)=>{
            var dbo=db.db("CMS")
            dbo.collection("posts").aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField:"category_title",
                        foreignField:"_id",
                        as:"catas"
                    }
                },
                {
                    $project:{
                        title:1,
                        description:1,
                        status:1,
                        allowComments:1,
                        category_title:"$catas.category_title"
                    }
                }
            ]).toArray().then(doc=>{
                console.log(doc)
                res.render("admin/posts/index", {list:doc, layout:'admin'})
            })
        })
        
    })
    
    router.get("/posts/create",auth.auth,  (req, res)=>{
        var query={userId:req.user._id}
        category.find(query)
        .exec()
        .then(doc=>{
            res.render("admin/posts/create", {records:doc, layout:'admin'})
        })
    })
    
    router.post("/posts/create", Upload, auth.auth, (req, res)=>{


        var comment=req.body.allowComments ? true : false

        
        //var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
        
        var Post=new post({
            title:req.body.title,
            status:req.body.status,
            description:req.body.description,
            userId:req.user._id,
            allowComments:comment,
            category_title:req.body.category,
            Image:req.file.filename
        })
        Post.save()
        .then(doc=>{
            
            req.flash("success-message", 'post added sucessfully !!!')
            console.log(doc)
            res.redirect('/admin/posts/create')
        })

    })
    
    router.get("/posts/edit/:id",auth.auth, (req, res)=>{
        var query={_id:req.params.id, userId:req.user._id}
        post.findById(query)
        .exec()
        .then(doc=>{
            category.find()
            .exec()
            .then(docs=>{
                res.render("admin/posts/edit", {
                    com:doc,
                    records:docs,
                    layout:'admin'
    
            })
            
            })
        })
    })

    router.get("/posts/delete/:id", auth.auth, (req, res)=>{
        var query={_id:req.params.id, userId:req.user._id}
        post.findByIdAndDelete(query)
        .exec()
        .then(doc=>{
            req.flash("success-message", 'post added sucessfully!!')
            res.redirect("/admin/posts")
        })
    })



    router.post("/category/create",auth.auth, (req, res)=>{
        var Category=new category({
            category_title:req.body.title,
            userId:req.user._id
        })
        Category.save()
        .then(doc=>{
            
            req.flash('success-message', "Category added sucessfully")
            res.redirect("/admin/category")
        })
    })

    router.get("/category",auth.auth, (req, res)=>{
        var query={userId:req.user._id}
        category.find(query)
        .exec()
        .then(doc=>{
            res.render("admin/category/index", {records:doc, layout:'admin'})
        })
    })

    router.get("/category/edit/:id",auth.auth, (req, res)=>{
        category.findById({_id:req.params.id, userId:req.user._id})
        .exec()
        .then(doc=>{
            res.render("admin/category/edit", {com:doc, records:doc, layout:'admin'})
        })
    })

    router.post("/category/edit",auth.auth, (req, res)=>{
        category.findByIdAndUpdate(
            {_id:req.body.id},
            {category_title:req.body.title},
            {new:true}
        )
        .exec()
        .then(doc=>{
            res.redirect("/admin/category")
        })
    })
    router.get("/category/delete/:id",auth.auth, (req, res)=>{
        category.findByIdAndDelete({_id:req.params.id, userId:req.user._id} )
        .exec()
        .then(doc=>{
            res.redirect("/admin/category")
        })
    })

    router.get("/comment",auth.auth, (req, res)=>{
        var mongoclient=require("mongodb").MongoClient
        var url="mongodb://localhost:27017/CMS"
        mongoclient.connect(url, (err, db)=>{
            var dbo=db.db("CMS")
            dbo.collection("comments").aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField:"userId",
                        foreignField:"_id",
                        as:"catas"
                    }
                },
                
                {
                    $project:{
                        _id:"$catas._id",
                        FirstName:"$catas.FirstName",
                        LastName:"$catas.LastName",
                        commentApproved:1,
                        Date:1,
                        body:1
                        
                    }
                }
            ]).toArray()
            .then(doc=>{
                console.log(doc)
                res.render("admin/comments/index",  {comments:doc, layout:'admin'})
            })
        })
    })
})
module.exports=router