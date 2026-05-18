const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const Registration = require("../models/Registration");
const {
  isSalesAttendant,
  isAdmin,
  isManager,
  isSalesAttendantOrAdmin,
} = require("../middleware/auth");

//Get index page
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

router.get("/admin-dashboard", async (req, res) => {
  try {
    let stats = {
      stockValue: 0,
      salesToday: 0,
      deposits: 0,
      supplierCredits: 0,
    };
    //Calculate total stock value
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;

    // Calculate total sales
    const salesAgg = await Sale.aggregate([
      { $group: {_id: null, grandTotal: { $sum: "$total" }}},
      ]);
      stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
    
    res.render("admin", { stats });
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Oops! Stats not found");
  }
});

router.get("/sales-dashboard", (req, res) => {
  res.render("sales_dashboard");
});
router.get("/manager-dashboard", async (req, res) => {
    try {
    let stats = {
      stockValue: 0,
      // salesToday: 0,
      // deposits: 0,
      // supplierCredits: 0,
    };
    //Calculate total stock value
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;
  res.render("store_dashboard", { stats });
    } catch (error) {
    console.log(error.message);
    res.status(400).send("Oops! Stats not found");
  }
});

module.exports = router;
