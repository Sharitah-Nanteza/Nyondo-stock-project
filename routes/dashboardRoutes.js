// const express = require("express");
// const router = express.Router();
// const Sale = require("../models/Sale");
// const Stock = require("../models/Stock");
// const Registration = require("../models/Registration");
// const Deposit = require("../models/Deposit");
// const {
//   isSalesAttendant,
//   isAdmin,
//   isManager,
//   isSalesAttendantOrAdmin,
// } = require("../middleware/auth");

// //Get index page
// router.get("/dashboard", (req, res) => {
//   res.render("dashboard");
// });
// //ADMIN DASHBOARD
// router.get("/admin-dashboard", async (req, res) => {
//   try {
//     //Calculate total stock value
//     const stockAgg = await Stock.aggregate([
//       {
//         $group: {
//           _id: null,
//           grandStock: { $sum: "$total" },
//           // Count products where quantity is exactly 0
//           outOfStockCount: {
//             $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
//           },
//           // Count products where quantity is greater than 0 AND less than or equal to 20
//           lowStockCount: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $gt: ["$quantity", 0] },
//                     { $lte: ["$quantity", 20] },
//                   ],
//                 },
//                 1,
//                 0,
//               ],
//             },
//           },
//         },
//       },
//     ]);

//     let stats = {
//       stockValue: stockAgg.length > 0 ? stockAgg[0].grandStock : 0,
//       outOfStockCount: stockAgg.length > 0 ? stockAgg[0].outOfStockCount : 0,
//       salesToday: 0,
//       deposits: 0,
//       supplierCredits: 0,
//       lowStockCount: stockAgg.length > 0 ? stockAgg[0].lowStockCount : 0,
//     };
//         const dbStock = await Stock.find()
//       .sort({ date: -1 });
//     stats.totalProducts = dbStock.length;
    
//     // Calculate total sales
//     const salesAgg = await Sale.aggregate([
//       { $group: { _id: null, grandTotal: { $sum: "$total" } } },
//     ]);
//     stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
//     // Count products where quantity is greater than 0 AND less than or equal to 20
//     lowStockCount: {
//       $sum: {
//         $cond: [
//           {
//             $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", 20] }],
//           },
//           1,
//           0,
//         ];
//       }
//     }

//     const customers = await Deposit.find();
//     const recentUsers = await Registration.find().sort({ _id: -1 }).limit(5);
//     res.render("admin", { stats, customers, recentUsers });
//   } catch (error) {
//     console.log(error.message);
//     res.status(400).send("Oops! Stats not found");
//   }
// });
// //SALES DASHBOARD
// router.get("/sales-dashboard", async (req, res) => {
//   try {
//     let stats = {
//       stockValue: 0,
//       salesToday: 0,
//     };
//     // Calculate total stock value
//     const stockAgg = await Stock.aggregate([
//       { $group: { _id: null, grandStock: { $sum: "$total" } } },
//     ]);
//     stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;

//     // Calculate total sales
//     const salesAgg = await Sale.aggregate([
//       { $group: { _id: null, grandTotal: { $sum: "$total" } } },
//     ]);
//     stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
//     res.render("sales_dashboard", { stats });
//     // });
//   } catch (error) {
//     console.log(error.message);
//     res.status(400).send("Oops! Stats not found");
//   }
// });

// //STORE MANAGER DASHBOARD
// router.get("/manager-dashboard", async (req, res) => {
//   try {
//     const stockAgg = await Stock.aggregate([
//       {
//         $group: {
//           _id: null,
//           grandStock: { $sum: "$total" },
//           // Count products where quantity is exactly 0
//           outOfStockCount: {
//             $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
//           },
//           // Count products where quantity is greater than 0 AND less than or equal to 20
//           lowStockCount: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $gt: ["$quantity", 0] },
//                     { $lte: ["$quantity", 20] },
//                   ],
//                 },
//                 1,
//                 0,
//               ],
//             },
//           },
//         },
//       },
//     ]);
//     // 2. Format the stats object safely (with defaults if the database is empty)
//     let stats = {
//       stockValue: stockAgg.length > 0 ? stockAgg[0].grandStock : 0,
//       outOfStockCount: stockAgg.length > 0 ? stockAgg[0].outOfStockCount : 0,
//       lowStockCount: stockAgg.length > 0 ? stockAgg[0].lowStockCount : 0,
//     };
//     const dbStock = await Stock.find()
//       // .populate("productname category")
//       .sort({ date: -1 });
//     stats.totalProducts = dbStock.length;
//     console.log("dbStock:", dbStock);
//     res.render("store_dashboard", { dbStock, stats, user: req.user || {} });
//   } catch (error) {
//     console.error(error.message);
//     res.status(400).send("Unable to pick product from the db");
//   }
// });

// //REports
// // MASTER BUSINESS SUMMARY AUDIT REPORT ROUTE (WITH MONTHLY FILTERING)
// router.get('/reports', async (req, res) => {
//     try {
//         // 1. Capture the selected month from query params (Format: YYYY-MM), default to current month if blank
//         let selectedMonth = req.query.month; 
//         if (!selectedMonth) {
//             const now = new Date();
//             const year = now.getFullYear();
//             const month = String(now.getMonth() + 1).padStart(2, '0');
//             selectedMonth = `${year}-${month}`;
//         }

//         // 2. Compute the exact Start and End date bounds for that specific month
//         const [yearStr, monthStr] = selectedMonth.split('-');
//         const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1, 0, 0, 0, 0);
//         const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);

//         // 3. Construct the query object targeting the 'date' field
//         const dateFilter = {
//             date: {
//                 $gte: startDate,
//                 $lte: endDate
//             }
//         };

//         // 4. Run the queries against your collections concurrently using the date filter
//         const [inventoryItems, vendorRecords, salesRecords, schemeCustomers] = await Promise.all([
//             Stock.find(dateFilter).sort({ date: -1 }), // Filters products added/updated this month
//             Stock.find(dateFilter).sort({ date: -1 }), // Filters supplier items received this month
//             Sale.find(dateFilter)
//                 .populate('attendant')
//                 .populate({
//                     path: 'items.product',
//                     model: 'Stock'
//                 })
//                 .sort({ date: -1 }),                   // Filters sales recorded this month
//             Deposit.find(dateFilter).sort({ _id: -1 }) // Filters custom layaways initialized this month
//         ]);

//         // 5. Render the page layout passing the active month string back to the client view
//         res.render('reports', {
//             title: 'Nyondo Master Summary Report',
//             user: req.user || req.session?.user || { userrole: 'admin' },
//             dbStock: inventoryItems,
//             dbSupplierStock: vendorRecords,
//             dbSales: salesRecords,
//             customers: schemeCustomers,
//             currentFilterMonth: selectedMonth // Sent back to lock the dropdown indicator
//         });

//     } catch (error) {
//         console.error("Critical Report Data Query Error:", error.message);
//         res.status(500).send("An error occurred while pulling your master system listings.");
//     }
// });
// module.exports = router;




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

// Get index page
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// ADMIN DASHBOARD
router.get("/admin-dashboard", async (req, res) => {
  try {
    const stockAgg = await Stock.aggregate([
      {
        $group: {
          _id: null,
          grandStock: { $sum: "$total" },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
          },
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
    
    const dbStock = await Stock.find().sort({ date: -1 });
    stats.totalProducts = dbStock.length;
    
    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, grandTotal: { $sum: "$total" } } },
    ]);
    stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;

    const customers = await Deposit.find();
    const recentUsers = await Registration.find().sort({ _id: -1 }).limit(5);
    res.render("admin", { stats, customers, recentUsers });
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Oops! Stats not found");
  }
});

// SALES DASHBOARD
router.get("/sales-dashboard", async (req, res) => {
  try {
    let stats = {
      stockValue: 0,
      salesToday: 0,
    };
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;

    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, grandTotal: { $sum: "$total" } } },
    ]);
    stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;
    res.render("sales_dashboard", { stats });
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Oops! Stats not found");
  }
});

// STORE MANAGER DASHBOARD
router.get("/manager-dashboard", async (req, res) => {
  try {
    const stockAgg = await Stock.aggregate([
      {
        $group: {
          _id: null,
          grandStock: { $sum: "$total" },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
          },
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
      lowStockCount: stockAgg.length > 0 ? stockAgg[0].lowStockCount : 0,
    };
    const dbStock = await Stock.find().sort({ date: -1 });
    stats.totalProducts = dbStock.length;
    res.render("store_dashboard", { dbStock, stats, user: req.user || {} });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick product from the db");
  }
});

// MASTER BUSINESS SUMMARY AUDIT REPORT ROUTE
router.get('/reports', async (req, res) => {
    try {
        let selectedMonth = req.query.month; 
        if (!selectedMonth) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            selectedMonth = `${year}-${month}`;
        }

        const [yearStr, monthStr] = selectedMonth.split('-');
        const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);

        const dateFilter = {
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };

        const [inventoryItems, vendorRecords, salesRecords, schemeCustomers] = await Promise.all([
            Stock.find(dateFilter).sort({ date: -1 }), 
            Stock.find(dateFilter).sort({ date: -1 }), 
            Sale.find(dateFilter)
                .populate('attendant')
                .populate({
                    path: 'items.product',
                    model: 'Stock'
                })
                .sort({ date: -1 }),                   
            
            // Fixed population pattern deep targeting your precise array path
            Deposit.find(dateFilter)
                .populate({
                    path: 'depositedItems.productname',
                    model: 'Stock'
                })
                .sort({ _id: -1 }) 
        ]);

        res.render('reports', {
            title: 'Nyondo Master Summary Report',
            user: req.user || req.session?.user || { userrole: 'admin' },
            dbStock: inventoryItems,
            dbSupplierStock: vendorRecords,
            dbSales: salesRecords,
            customers: schemeCustomers,
            currentFilterMonth: selectedMonth 
        });

    } catch (error) {
        console.error("Critical Report Data Query Error:", error.message);
        res.status(500).send("An error occurred while pulling your master system listings.");
    }
});

module.exports = router;
