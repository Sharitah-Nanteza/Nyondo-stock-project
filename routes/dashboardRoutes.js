const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Stock = require("../models/Stock");
const Registration = require("../models/Registration");
const Deposit = require("../models/Deposit");
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
//ADMIN DASHBOARD
router.get("/admin-dashboard", async (req, res) => {
  try {
    //Calculate total stock value
    const stockAgg = await Stock.aggregate([
      {
        $group: {
          _id: null,
          grandStock: { $sum: "$total" },
          // Count products where quantity is exactly 0
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
          },
          // Count products where quantity is greater than 0 AND less than or equal to 20
          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$quantity", 0] },
                    { $lte: ["$quantity", 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    let stats = {
      stockValue: stockAgg.length > 0 ? stockAgg[0].grandStock : 0,
      outOfStockCount: stockAgg.length > 0 ? stockAgg[0].outOfStockCount : 0,
      salesToday: 0,
      deposits: 0,
      supplierCredits: 0,
      lowStockCount: stockAgg.length > 0 ? stockAgg[0].lowStockCount : 0,
    };
        const dbStock = await Stock.find()
      .sort({ date: -1 });
    stats.totalProducts = dbStock.length;
    
    // Calculate total sales
    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, grandTotal: { $sum: "$total" } } },
    ]);
    stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
    // Count products where quantity is greater than 0 AND less than or equal to 20
    lowStockCount: {
      $sum: {
        $cond: [
          {
            $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", 20] }],
          },
          1,
          0,
        ];
      }
    }

    const customers = await Deposit.find();
    const recentUsers = await Registration.find().sort({ _id: -1 }).limit(5);
    res.render("admin", { stats, customers, recentUsers });
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Oops! Stats not found");
  }
});
//SALES DASHBOARD
router.get("/sales-dashboard", async (req, res) => {
  try {
    let stats = {
      stockValue: 0,
      salesToday: 0,
    };
    // Calculate total stock value
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;

    // Calculate total sales
    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, grandTotal: { $sum: "$total" } } },
    ]);
    stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
    res.render("sales_dashboard", { stats });
    // });
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Oops! Stats not found");
  }
});

//STORE MANAGER DASHBOARD
router.get("/manager-dashboard", async (req, res) => {
  try {
    const stockAgg = await Stock.aggregate([
      {
        $group: {
          _id: null,
          grandStock: { $sum: "$total" },
          // Count products where quantity is exactly 0
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
          },
          // Count products where quantity is greater than 0 AND less than or equal to 20
          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$quantity", 0] },
                    { $lte: ["$quantity", 20] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    // 2. Format the stats object safely (with defaults if the database is empty)
    let stats = {
      stockValue: stockAgg.length > 0 ? stockAgg[0].grandStock : 0,
      outOfStockCount: stockAgg.length > 0 ? stockAgg[0].outOfStockCount : 0,
      lowStockCount: stockAgg.length > 0 ? stockAgg[0].lowStockCount : 0,
    };
    const dbStock = await Stock.find()
      // .populate("productname category")
      .sort({ date: -1 });
    stats.totalProducts = dbStock.length;
    console.log("dbStock:", dbStock);
    res.render("store_dashboard", { dbStock, stats, user: req.user || {} });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick product from the db");
  }
});

module.exports = router;
