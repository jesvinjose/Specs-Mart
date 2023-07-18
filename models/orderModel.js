const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          name: { type: String },
          price: { type: Number },
          quantity: { type: Number },
          image: { type: String },
        },
    ],
    billingaddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BillingAddress",
        required: true,
    },
    shippingaddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShippingAddress",
        required: true,
    },
    orderId: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    usedWallet:{
        type:Number,
        default:0
    },
    status: {
        type: String,
        enum: ["pending", "Shipped", "Delivered", 'Cancelled', 'Returned'],
        default: "pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    deliveredDate:{
        type: Date
    },
    returnEndDate:{
        type:Date,
    },
})

const Order=mongoose.model("Order", orderSchema);
module.exports = Order;