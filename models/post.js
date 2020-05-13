const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = mongoose.Schema({
    
    title:{
        type:String,
        require:true
    },
    status:{
        type:String,
        default:'public'
    },
    description:{
        type:String,
        require:true
    },
    CreationDate:{
        type:Date,
        default:Date.now()
    },
    userId: {
        type: Schema.Types.ObjectId
        
    },
    
    category_title: {
        type: Schema.Types.ObjectId
    },
    Image:{
        type:String
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'comment'
        }
    ],
    
    allowComments: {
        type: Boolean,
        default: false
    }

    
    
});

var post=mongoose.model("post", PostSchema)

module.exports=post