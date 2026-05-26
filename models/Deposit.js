const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  nin: {
    type: String,
    trim: true,
    required: true,
    uppercase: true,
    match: [/^C[MF]\d{10}[A-Z]{3}$/, "Enter a valid Ugandan NIN"],
  },
  phonenumber: {
    type: String,
    required: true,
  },
  customeraddress: {
    type: String,
    required: true,
  },
  customerdistance: {
    type: Number,
    required: true,
  },
depositedItems: [
    {
  productname: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  priceAtDeposit: {
        type: Number,
        required: true
      }
}
  ],
  amountDeposited: {
    type: Number,
    required: true,
  },
  deliverymethod: { type: String, enum: ['hardware', 'pickup'], required: true },
  transportCost: { 
    type: Number, 
  },
  total: { 
    type: Number 
  },
  outstandingBalance: { 
    type: Number 
  },
  date: {
    type: Date,
    default: Date.now,
  },

paymentHistory: [
    {
      amount: { type: Number, required: true },
      paymentMethod: { type: String, required: true }, // 'cash', 'momo', 'bank'
      dateRecorded: { type: Date, default: Date.now }  // Automatically captures timestamps
    }
  ]
});

module.exports = mongoose.model("Deposit", depositSchema);
