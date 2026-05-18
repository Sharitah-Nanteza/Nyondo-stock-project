const mongoose = require("mongoose");
//
const stockSchema = new mongoose.Schema({
  productname: {
    type: String,
    required:true
  },
    image: {
    type: String,
    required:true
  },
  category: {
    type: String,
    required:true
  },
  quantity: {
    type: Number,
    required:true
  },
  unit: {
    type: String,
    required:true
  },
  unitcost: {
    type: Number,
    required:true
  },
  sellingprice: {
    type: Number,
    required:true
  },
  factoryname: {
    type: String,
    required:true
  },
  suppliername: {
    type: String,
    required:true
  },
  suppliercontact: {
    type: String,
    required: true,
    // match: [/^2567\d{8}$/, "Invalid Ugandan number"]
  },
  paymentstatus: {
    type: String,
    required:true
  },
  date: {
    type: Date,
    default: Date.now,
  },
  total: {
    type: Number,
  }
});

module.exports = mongoose.model("Stock", stockSchema);
