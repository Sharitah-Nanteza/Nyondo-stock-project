const express = require("express");
const router = express.Router();
const multer = require("multer");

const Stock = require("../models/Stock");
const {
  isSalesAttendant,
  isAdmin,
  isManager,
  isManagerOrAdmin,
} = require("../middleware/auth");

// Image configurations
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
//initializing multer
let upload = multer({ storage: storage });

//Add stock to the Db
router.get("/add_stock", (req, res) => {
  res.render("stock_reg_form");
});
router.post("/add_stock", upload.single("image"), async (req, res) => {
  try {
    const {
      productname,
      category,
      quantity,
      unit,
      unitcost,
      sellingprice,
      factoryname,
      suppliername,
      suppliercontact,
      paymentstatus,
      image,
    } = req.body;

    // Phone number validation
    const phone = "+256" + suppliercontact;
    // Selling price validation
    if (parseFloat(sellingprice) < parseFloat(unitcost)) {
      return res.status(400).send("Selling price is less than the unitcost!");
    }
    const total = parseInt(quantity) * parseFloat(unitcost);
    const newProduct = new Stock({
      productname,
      category,
      image: req.file.path,
      originalQuantity: parseInt(quantity),
      quantity: parseInt(quantity),
      unit,
      unitcost,
      sellingprice,
      factoryname,
      suppliername,
      suppliercontact: phone,
      paymentstatus,
      total,
    });
    await newProduct.save();
    res.redirect("/stock");
  } catch (error) {
    console.error(error);
    res.render("stock_reg_form", { error: error.message });
  }
});
//Getting stock from the Db
router.get("/stock", async (req, res) => {
  try {
    //Calculating statistics (aggregation pipeline)
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
    //Safe guarding the data(I used ternary operators so that in case of an empty array, no fatal error is thrown)
    let stats = {
      stockValue: stockAgg.length > 0 ? stockAgg[0].grandStock : 0,
      outOfStockCount: stockAgg.length > 0 ? stockAgg[0].outOfStockCount : 0,
      lowStockCount: stockAgg.length > 0 ? stockAgg[0].lowStockCount : 0,
    };
    //Fetching the full product list .
    const dbStock = await Stock.find()
      // .populate("productname category")
      .sort({ date: -1 });
    stats.totalProducts = dbStock.length;
    // console.log("dbStock:", dbStock);
    //And finally am good to render the UI, empty if no logging in
    res.render("stock", { dbStock, stats, user: req.user || {} });

    //Error handling!
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick product from the db");
  }
});
//Supplier information
router.get("/supplier", async (req, res) => {
  try {
    let stats = {
      stockValue: 0,
      totalSupplierDues: 0, // 1. Added a parking spot for our dues
    };

    // Calculate total stock value
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;

    // Fetch the raw stock data
    const dbStock = await Stock.find()
      // .populate("productname category")
      .sort({ date: -1 });

    //Calculate the total dues from the dbStock array we just fetched
    stats.totalSupplierDues = dbStock
      .filter(product => product.paymentstatus && product.paymentstatus.toLowerCase() === 'credit')
      .reduce((sum, product) => sum + (Number(product.total) || 0), 0);

    console.log("dbStock fetched. Total credit dues calculated:", stats.totalSupplierDues);
    
    // Send it off to the Pug view! (stats now includes totalSupplierDues)
    res.render("supplier", { dbStock, stats });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick product from the db");
  }
});

// Update stock
router.get("/stock/edit/:id", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).send("Product not found");
    console.log(stock);
    res.render("stock_edit", { stock });
  } catch (error) {
    console.log(error);
  }
});
router.post("/stock/edit/:id", async (req, res) => {
  try {
    const { unitcost, sellingprice, quantity, suppliername } = req.body;
    await Stock.findByIdAndUpdate(req.params.id, {
      unitcost,
      sellingprice,
      quantity,
      suppliername,
    });
    res.redirect("/stock");
  } catch (error) {
    console.error(error.message);
    const stock = await Stock.findById(req.params.id);
    res.render("stock_edit", { stock });
  }
});
// Delete route
// router.post("/delete/:id", async (req, res) => {
//   try {
//     await Stock.findByIdAndDelete(req.params.id);
//     res.redirect("/stock");
//   } catch (error) {
//     console.error(error);
//   }
// });

// Supplier edit
router.get("/supplier/edit/:id", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).send("Product not found");
    console.log(stock);
    res.render("supplier_edit", { stock });
  } catch (error) {
    console.log(error);
  }
});
router.post("/supplier/edit/:id", async (req, res) => {
  try {
    const { factoryname, suppliername, suppliercontact, paymentstatus } = req.body;
    
    // Formatting phone string safely back into database layout
    let phone = suppliercontact.trim();
    if (!phone.startsWith("+256")) {
      phone = "+256" + phone;
    }

    await Stock.findByIdAndUpdate(req.params.id, {
      factoryname,
      suppliername,
      suppliercontact: phone,
      paymentstatus,
    });
    
    res.redirect("/supplier");
  } catch (error) {
    console.error(error.message);
    const stock = await Stock.findById(req.params.id);
    res.render("supplier_edit", { stock, error: error.message });
  }
});

module.exports = router;
