const mongoose = require('mongoose')

const shippingAddressSchema = new mongoose.Schema({

    userId:{
        type: String,
        required: true
    },

    name:{
        type: String,
        required: true
    },

    mobile:{
        type: Number,
        required: true
    },

    email:{
        type: String,
        required:true
    },

    addressLine:{
        type: String,
        required: true
    },

    city:{
        type: String,
        required: true
    },

    state:{
        type: String,
        required: true
    },

    pincode:{
        type: Number,
        required: true
    }
})

const shippingAddress=mongoose.model('shippingAddress', shippingAddressSchema)
module.exports = shippingAddress;