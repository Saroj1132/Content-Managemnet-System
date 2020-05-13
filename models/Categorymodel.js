var mongoose=require("mongoose")
var Schema=mongoose.Schema
var cateschema=new Schema({
    category_title:{
        type:String,
        require:true
    },
    userId:{
        type:String
    }
})

var Category=mongoose.model("Category", cateschema)

module.exports=Category

