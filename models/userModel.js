const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   email: {
      type: String,
      required: true
   },
   mobile: {
      type: Number,
      required: true
   },
   userName: {
      type: String,
      required: true
   },
   password: {
      type: String,
      required: true
   },
   isAdmin: {
      type: Number,
      default: 0
   },
   isVerified: {
      type: Boolean,
      default: false
   },
   blockStatus: {
      type: Boolean,
      default: false
   },
   otp: {
      type: String,
      default: ""
   },
   cart: [
      {
         products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
         },
         quantity: {
            type: Number,
            default: 1
         }
      }
   ],
   wishList: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Product'
      }

   ],
   boughtBy:[
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Product'
      }
   ],
   wallet: {
      balance: {
          type: Number,
          default: 0,
      },
      transactions: [
          {
              date: {
                  type: Date,
              },
              details: {
                type: String,
              },
              amount: {
                  type: Number,
              },
              status: {
                  type: String,
              },
          },
      ],
  },
},{ versionKey: 'version' });

const User = mongoose.model('User', userSchema);
module.exports = User;
