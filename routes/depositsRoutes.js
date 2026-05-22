const express = require("express");
const router = express.Router();
const Deposit = require("../models/Deposit");
const Stock = require("../models/Stock");
//Deposit_form to be filled
router.get("/deposited", async (req, res) => {
  try {
    //Query MongoDb for only 8 products
    const materials = await Stock.find({
      productname: {
        $in: [
          "Cement CEM IIN",
          "Cement CEM IIIN",
          "Iron Bars 10mm",
          "Iron Bars 12mm",
          "Iron Bars 16mm",
          "Iron Sheets Gauge 28 (Red)",
          "Iron Sheets Gauge 28 (Green)",
          "Iron Sheets Gauge 30 (Blue)",
        ],
      },
    });
    res.render("deposit_reg_form", { items: materials });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).render("deposit_reg_form");
  }
});

router.post("/deposit", async (req, res) => {
  try {
    const {
      fullName,
      nin,
      phonenumber,
      productname,
      customeraddress,
      customerdistance,
      quantity,
      amountDeposited,
    } = req.body;

    // Phone number validation
    const phone = "+256" + phonenumber;

    // Fetching product from the stock collection
    const productDetails = await Stock.findById(productname);
    if (!productDetails) {
      throw new Error("Product selected could not be found in available stock");
    }

    //Fetching the selling price from the database
    const currentPrice = productDetails.sellingprice;

    // Deduct quantity sold from stock quantity and save the new quantity to the stock collection
    const orderQty = parseInt(quantity);
    productDetails.quantity -= orderQty;
    await productDetails.save();
    const total = orderQty * parseFloat(currentPrice);
    // Transport
    let transportCost = 0;
    if (customerdistance <= 10 && total >= 500000) {
      transportCost = 0;
    } else {
      transportCost = 30000;
    }
    //Total calculation
    const totalCost = total + transportCost;
    //Balance
    const balance = totalCost - parseFloat(amountDeposited);

    const newDeposit = new Deposit({
      fullName,
      nin,
      phonenumber: phone,
      productname,
      customeraddress,
      customerdistance,
      quantity: orderQty,
      amountDeposited: parseFloat(amountDeposited),
      transportCost,
      total: totalCost,
      outstandingBalance: balance,
    });

    // console.log(newDeposit);
    await newDeposit.save();
    res.render("a", { customer: newDeposit });
    // return res.redirect("/deposits");
  } catch (error) {
    console.error("Submission failed:", error);
    // res.render('deposit_reg_form', {error:error.message});
    return res.status(500).render("deposit_reg_form", { error: error.message });
  }
  // console.log(req.body)
  //   res.redirect("/deposits");
});
//Customer deposits
router.get("/deposits", async (req, res) => {
  try {
    const records = await Deposit.find({}).populate("productname");

    res.render("deposit", { customers: records });
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    // Fallback: send an empty array so the page doesn't crash if the DB fails
    res
      .status(500)
      .render("deposit", { customers: [], error: "Database error" });
  }
  // res.render("deposit");
});

//Record deposits
router.get("/record/:id", async (req, res) => {
  try {
    const customerData = await Deposit.findById(req.params.id);
    if (!customerData) {
      return res.status(404).send("Customer not found");
    }
    res.render("record_deposit", { customer: customerData });
  } catch (error) {
    console.error("Error loading record deposit form:", error);
    res.status(500).send("Server Error loading form");
  }

});
router.post("/records/:id", async (req, res) => {
  try {
    const { amount_deposited, payment } = req.body;
    const newPayment = parseFloat(amount_deposited) || 0;

    const customer = await Deposit.findById(req.params.id);

    if (!customer) {
      return res.status(404).send("Customer profile not found");
    }

    customer.outstandingBalance -= newPayment;
    // Add the money paid to the total record track of historical deposits
    customer.amountDeposited += newPayment;

    customer.paymentHistory.push({
      amount: newPayment,
      paymentMethod: payment || "cash", // Falls back to cash if missing
    });
    await customer.save();
    // res.redirect("/deposits");
    const customerData = await Deposit.findById(req.params.id).populate("productname");
    res.render("a", { customer: customerData });
  } catch (error) {
    console.error("Failed to process transaction update:", error);
    res.status(500).send("Internal Server Error processing deposit");
  }
  // console.log(req.body);
  // res.redirect("/deposits");
});

//

module.exports = router;
