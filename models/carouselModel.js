// const { Carousel } = require('bootstrap');
const mongoose=require('mongoose');

const carouselSchema=new mongoose.Schema({
    carouselImages:{
        type:Array,
        required:true
    },
    carouselName:{
        type:String,
        required:true
    },
    carouselDescription:{
        type:String,
        required:true
    },
    isDisabled:{
        type:Boolean,
        default:false
    }
})

Carousel=mongoose.model('Carousel',carouselSchema)

module.exports=Carousel;