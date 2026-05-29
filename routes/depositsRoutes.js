const express = require("express");
const router = express.Router();
const Deposit = require("../models/Deposit");
const Stock = require("../models/Stock");

// Shared product filters for reloading rendering page variations easily
const targetMaterials = [
  "Cement CEM IIN",
  "Cement CEM IIIN",
  "Iron Bars 10mm",
  "Iron Bars 12mm",
  "Iron Bars 16mm",
  "Iron Sheets Gauge 28 (Red)",
  "Iron Sheets Gauge 28 (Green)",
  "Iron Sheets Gauge 30 (Blue)",
];

// 1. Fetch Form View
router.get("/deposited", async (req, res) => {
  try {
    const materials = await Stock.find({ productname: { $in: targetMaterials } });
    res.render("deposit_reg_form", { items: materials });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).render("deposit_reg_form");
  }
});

// 2. Submit New Multi-Item Deposit
router.post("/deposit", async (req, res) => {
  try {
    const {
      fullName,
      nin,
      phonenumber,
      productname,        
      customeraddress,
      customerdistance,
      deliverymethod,
      quantity,          
      amountDeposited,
    } = req.body;

    // Standardize local 07... numbers to database international format
    let rawPhone = phonenumber.trim();
    if (rawPhone.startsWith("0")) {
      rawPhone = rawPhone.substring(1);
    }
    const phone = "+256" + rawPhone;
    
    let parsedDistance = parseFloat(customerdistance) || 0;
    let transportCost = 30000;

    if (deliverymethod === 'pickup') {
      parsedDistance = 0;
      transportCost = 0;
    }

    // Normalize input data into arrays for processing consistency
    const productIds = Array.isArray(productname) ? productname : [productname];
    const quantities = Array.isArray(quantity) ? quantity : [quantity];

    let totalItemsValue = 0;
    const itemsToProcess = [];

    // Process each product row submitted from the dynamic table lines
    for (let i = 0; i < productIds.length; i++) {
      if (!productIds[i]) continue; 

      const productDetails = await Stock.findById(productIds[i]);
      if (!productDetails) {
        const materials = await Stock.find({ productname: { $in: targetMaterials } });
        return res.status(404).render("deposit_reg_form", { items: materials, error: "One of the chosen products was not found." });
      }

      const orderQty = parseInt(quantities[i], 10);
      
      // Stock protection barrier logic
      if (productDetails.quantity < orderQty) {
        const materials = await Stock.find({ productname: { $in: targetMaterials } });
        return res.status(400).render("deposit_reg_form", { 
          items: materials, 
          error: `Insufficient stock for ${productDetails.productname}. Available inventory: ${productDetails.quantity}` 
        });
      }

      // Decrement inventory metrics directly
      productDetails.quantity -= orderQty;
      await productDetails.save();

      const rowPrice = parseFloat(productDetails.sellingprice);
      totalItemsValue += (orderQty * rowPrice);

      itemsToProcess.push({
        productname: productIds[i], 
        quantity: orderQty,         
        priceAtDeposit: rowPrice
      });
    }

    // Calculate free hardware transport exemptions if condition profiles are satisfied
    if (deliverymethod === 'hardware') {
      transportCost = (parsedDistance <= 10 && totalItemsValue >= 500000) ? 0 : 30000;
    }

    const overallCost = totalItemsValue + transportCost;
    const upfrontPayment = parseFloat(amountDeposited) || 0;
    const dynamicBalance = overallCost - upfrontPayment;

    const newDeposit = new Deposit({
      fullName,
      nin,
      phonenumber: phone,
      customeraddress,
      customerdistance: parsedDistance,
      amountDeposited: upfrontPayment,
      deliverymethod,
      transportCost,
      total: overallCost,
      outstandingBalance: dynamicBalance,
      depositedItems: itemsToProcess 
    });

    await newDeposit.save();
    
    const populatedCustomer = await Deposit.findById(newDeposit._id).populate("depositedItems.productname");
    res.render("a", { customer: populatedCustomer });

  } catch (error) {
    console.error("Submission failed:", error);
    const materials = await Stock.find({ productname: { $in: targetMaterials } });
    return res.status(500).render("deposit_reg_form", { items: materials, error: error.message });
  }
});

// 3. Customer Dashboard View (Shows latest 3 profiles)
router.get("/deposits", async (req, res) => {
  try {
    const limitedRecords = await Deposit.find()
      .populate("depositedItems.productname")
      .sort({ _id: -1 }) 
      .limit(3);

    res.render("deposit", { customers: limitedRecords });
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    res.status(500).render("deposit", { customers: [], error: "Database error reading records" });
  }
});

// 4. Fetch Individual Installment Form
router.get("/record/:id", async (req, res) => {
  try {
    const customerData = await Deposit.findById(req.params.id);
    if (!customerData) return res.status(404).send("Customer profile not located");
    res.render("record_deposit", { customer: customerData });
  } catch (error) {
    console.error("Error loading form:", error);
    res.status(500).send("Server Error processing operational view");
  }
});

// 5. Save Incoming Installment Payment
router.post("/records/:id", async (req, res) => {
  try {
    const { amount_deposited, payment } = req.body;
    const newPayment = parseFloat(amount_deposited) || 0;

    const customer = await Deposit.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer profile not found");

    customer.outstandingBalance -= newPayment;
    customer.amountDeposited += newPayment;

    customer.paymentHistory.push({
      amount: newPayment,
      paymentMethod: payment || "cash",
    });
    await customer.save();
    
    const customerData = await Deposit.findById(req.params.id).populate("depositedItems.productname");
    res.render("a", { customer: customerData });
  } catch (error) {
    console.error("Failed to process transaction update:", error);
    res.status(500).send("Internal Server Error processing deposit logs");
  }
});

module.exports = router;