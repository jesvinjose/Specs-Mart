const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    percentage: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Offer", offerSchema);