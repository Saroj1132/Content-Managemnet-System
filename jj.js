var express=require("express")
var router=express.Router()


router.get("/", (req, res)=>{
    var mongoclient=require("mongodb").MongoClient
    var url="mongodb://localhost:27017/CMS"
    mongoclient.connect(url, (err, db)=>{
        var dbo=db.db("CMS")
        dbo.collection("users").aggregate([
            { $lookup:
                {
                  from: 'comments',
                  localField: '_id',
                  foreignField: 'userId',
                  as: 'orderdetails'
                }
              },
              {$unwind:"$orderdetails"}
            ]).toArray(function(err, res) {
              console.log(res)
              db.close();
            });
    })
})

module.exports=router