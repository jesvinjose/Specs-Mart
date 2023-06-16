const mongoose = require('mongoose')

const billingAddressSchema = new mongoose.Schema({

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

const billingAddress=mongoose.model('billingAddress', billingAddressSchema)
module.exports = billingAddress;