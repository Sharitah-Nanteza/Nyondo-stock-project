const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const {
  isSalesAttendant,
  isAdmin,
  isManager,
  isSalesAttendantOrAdmin,
} = require("../middleware/auth");

//Add sale to the Db
router.get("/addsale", isSalesAttendantOrAdmin, async (req, res) => {
  try {
    const items = await Stock.find({ quantity: { $gt: 0 } });
    console.log(items);
    res.render("new_sale_form", { items });
  } catch (error) {
    res.status(500).send("server error");
    console.error("error", error.message);
  }
});

router.post("/addsale", isSalesAttendantOrAdmin, async (req, res) => {
  // console.log(req.body)
  try {
    const {
      customername,
      customercontact,
      productId,
      qty,
      unit,
      sellingprice,
      customeraddress,
      customerdistance,
      amountpaid
    } = req.body;

    // Phone number validation
    const phone = '+256' + customercontact

    const product = await Stock.findById(productId);
    if (!product) return res.status(404).send("Product not found");
    const parsedQty = parseInt(qty, 10);
    const parsedPrice = parseFloat(sellingprice);
    const parsedDistance = parseFloat(customerdistance) || 0;

    if (product.quantity < parsedQty) {
      const items = await Stock.find({ quantity: { $gt: 0 } });
      return res.render("new_sale_form", { items, error: "Not enough stock available" });
      // return res.status(400).send("Not enough stock available");
    }

    // Deduct quantity sold from stock quantity and save the new quantity to the stock collection
    product.quantity -= parsedQty;
    await product.save();
    //Calculate total without transport
    const total = parsedQty * parsedPrice;
    // Transport
    let transportCost = 0;
    if (parsedDistance <= 10 && total >= 500000) {
      transportCost = 0;
    } else {
      transportCost = 30000;
    }
    
    // Record the sale
    const newSale = new Sale({
      customername,
      customercontact:phone,
      product: productId,
      qty:parsedQty,
      unit,
      sellingprice,
      amountpaid:parseFloat(amountpaid) || 0,
      customeraddress,
      customerdistance:parsedDistance,
      transportCost,
      attendant: req.user._id,
      total: total, //the cost of the items without transport
    });
    console.log(newSale);
    await newSale.save();
    res.redirect(`/receipt/${newSale._id}`);
  } catch (error) {
    console.error(error);
    const items = await Stock.find({ quantity: { $gt: 0 } });
    res.render("new_sale_form", { items, error: error.message });
  }
});
//Get sales from the Db
router.get("/sales-list", async (req, res) => {
  try {
      let stats = {
      salesToday: 0,};
    
        // Calculate total sales
        const salesAgg = await Sale.aggregate([
          { $group: {_id: null, grandTotal: { $sum: "$total" }}},
          ]);
          stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
          
    const dbSales = await Sale.find()
      .populate("product", "productname category")
      .populate("attendant", "fullname")
      .sort({ date: -1 });
    res.render("sales", { dbSales, user: req.user , stats});
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick sales from the db");
  }
});

// Update sale
router.get("/sale/edit/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).send("Sale not found");
    console.log(sale);
    res.render("sale_edit", { sale });
  } catch (error) {
    console.log(error);
    // res.status(400).send("Unable to find sale in the Db");
  }
});

router.post("/sale/edit/:id", async (req, res) => {
  try {
    const { qty, buyingprice, sellingprice, customername, customercontact } =
      req.body;
    const total = parseInt(qty) * parseFloat(sellingprice);
    await Sale.findByIdAndUpdate(req.params.id, {
      total,
      qty,
      buyingprice,
      sellingprice,
      customername,
      customercontact,
    });
    res.redirect("/sales-list");
  } catch (error) {
    console.error(error.message);
    const sale = await Sale.findById(req.params.id);
    res.render("sale_edit", { sale });
  }
});
// Delete route
router.post("/sale/delete/:id", async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.redirect("/sales-list");
  } catch (error) {
    console.error(error);
  }
});

// View and print receipt
router.get("/receipt/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("product", "productname category")
      .populate("attendant", "fullname");
    if (!sale) return res.status(404).send("Receipt not found.");
    res.render("receipt", { sale });
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
