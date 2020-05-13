var mongoose=require("mongoose")
var Schema=mongoose.Schema

var commentschema=new Schema({
    body:{
        type:String,
        require:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user'
        
    },
    Date:{
        type:Date,
        default:Date.now()
    },
    commentApproved:{
        type:Boolean,
        default:false
    }
})

var comment=mongoose.model("comment", commentschema)

module.exports=comment

