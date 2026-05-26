const mongoose = require("mongoose");
//
const saleSchema = new mongoose.Schema({
  customername: {
    type: String,
    required:true
  },
  customercontact: {
    type: String,
    required:true
  },
  customeraddress: {
    type: String,
    required:true
  },
  customerdistance: {
    type: Number,
    required:true
  },
  items: [{
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  qty: {
    type: Number,
    required:true
  },
  unit: {
    type: String,
    required: true,
  },
  sellingprice: {
    type: Number,
    required:true
  }
  }],
  attendant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  deliverymethod: { type: String, enum: ['hardware', 'pickup'], required: true },
  transportCost: {
    type: Number,
  },
  // amountpaid: {
  //   type: Number,
  // },
  total: {
    type: Number,
  },
 
});

module.exports = mongoose.model("Sale", saleSchema);
