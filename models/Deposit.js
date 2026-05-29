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
    uppercase: true, // Automatically forces the stored text to be uppercase in MongoDB
    match: [/^C[MF][0-9]{2}[0-9A-Z]{10}$/, "Enter a valid 14-character Ugandan Citizen NIN starting with CM or CF"], // UPDATED REGEX PATTERN HERE
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