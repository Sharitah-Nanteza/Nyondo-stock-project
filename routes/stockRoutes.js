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
    const phone = '+256'+suppliercontact
    // Selling price validation
    if (parseFloat(sellingprice) < parseFloat(unitcost)) {
      return res
        .status(400)
        .send("Selling price is less than the unitcost!");
    }
    const total = parseInt(quantity) * parseFloat(unitcost);
    const newProduct = new Stock({
      productname,
      category,
      image: req.file.path,
      quantity,
      unit,
      unitcost,
      sellingprice,
      factoryname,
      suppliername,
      suppliercontact:phone,
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
//Get stock from the Db
router.get("/stock", async (req, res) => {
  try {
    let stats = {
      stockValue: 0,
    };
    //Calculate total stock value
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;
    const dbStock = await Stock.find()
      .populate("productname category")
      .sort({ date: -1 });
    console.log("dbStock:", dbStock);
    res.render("stock", { dbStock, stats });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick product from the db");
  }
});


router.get("/supplier", async (req, res) => {
  try {
    let stats = {
      stockValue: 0,
    };
    //Calculate total stock value
    const stockAgg = await Stock.aggregate([
      { $group: { _id: null, grandStock: { $sum: "$total" } } },
    ]);
    stats.stockValue = stockAgg.length > 0 ? stockAgg[0].grandStock : 0;
    const dbStock = await Stock.find()
      .populate("productname category")
      .sort({ date: -1 });
    console.log("dbStock:", dbStock);
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
router.post("/delete/:id", async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.redirect("/stock");
  } catch (error) {
    console.error(error);
  }
});

// Supplier


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
    const { paymentstatus } = req.body;
    await Stock.findByIdAndUpdate(req.params.id, {
   paymentstatus
    });
    res.redirect("/supplier");
  } catch (error) {
    console.error(error.message);
    const stock = await Stock.findById(req.params.id);
    res.render("supplier_edit", { stock });
  }
});

module.exports = router;
