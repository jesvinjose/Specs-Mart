const mongoose = require('mongoose')
const Review = require('./reviewModel');



const productSchema = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    imageUrls: {
        type: Array,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    stockCount: {
        type: Number,
        required: true
    },
    onCart: {
        type: Boolean,
        default: false
    },
    inWishList: {
        type: Boolean,
        default: false
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    boughtBy: {
        type: Array
    },
    quantity: {
        type: Number
    }

})

const Product = mongoose.model('Product', productSchema)
module.exports = Product;