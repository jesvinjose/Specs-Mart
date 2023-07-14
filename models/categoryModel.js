const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    categoryImage:{
      type:Array,
      required:true
  },  
    categoryDescription:{
        type:String,
        required:true
    },
    isDisabled:{
        type:Boolean,
        default:false
    }
})

const Category=mongoose.model('Category',categorySchema)
module.exports=Category;