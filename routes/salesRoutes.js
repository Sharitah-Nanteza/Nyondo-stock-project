// const express = require("express");
// const router = express.Router();
// const Sale = require("../models/Sale");
// const Stock = require("../models/Stock");
// const {
//   isSalesAttendant,
//   isAdmin,
//   isManager,
//   isSalesAttendantOrAdmin,
// } = require("../middleware/auth");

// //Add sale to the Db
// router.get("/addsale", isSalesAttendantOrAdmin, async (req, res) => {
//   try {
//     const items = await Stock.find({ quantity: { $gt: 0 } });
//     console.log(items);
//     res.render("new_sale_form", { items });
//   } catch (error) {
//     res.status(500).send("server error");
//     console.error("error", error.message);
//   }
// });

// router.post("/addsale", isSalesAttendantOrAdmin, async (req, res) => {
//   // console.log(req.body)
//   try {
//     const {
//       customername,
//       customercontact,
//       customeraddress,
//       customerdistance,
//       deliverymethod,
//       productId,
//       qty,
//       unit,
//       sellingprice,
//       // amountpaid
//     } = req.body;

//     // Phone number validation
//     const phone = "+256" + customercontact;
//     const parsedDistance = parseFloat(customerdistance) || 0;

//     const productIds = Array.isArray(productId) ? productId : [productId];
//     const quantities = Array.isArray(qty) ? qty : [qty];
//     const units = Array.isArray(unit) ? unit : [unit];
//     const sellingPrices = Array.isArray(sellingprice)
//       ? sellingprice
//       : [sellingprice];

//     let grandTotalItemsPrice = 0;
//     const processedItems = [];

//     //2. Loop through each item in the order to check inventory and process stock
//     for (let i = 0; i < productIds.length; i++) {
//       // Skip incomplete or empty rows in the form
//       if (!productIds[i]) continue;

//       const currentProduct = await Stock.findById(productIds[i]);
//       if (!currentProduct) {
//         const items = await Stock.find({ quantity: { $gt: 0 } });
//         return res.render("new_sale_form", {
//           items,
//           error: "One of the selected products was not found.",
//         });
//       }

//       const itemQty = parseInt(quantities[i], 10);
//       const itemPrice = parseFloat(sellingPrices[i]);

//       // Check stock availability
//       if (currentProduct.quantity < itemQty) {
//         const items = await Stock.find({ quantity: { $gt: 0 } });
//         return res.render("new_sale_form", {
//           items,
//           error: `Not enough stock for ${currentProduct.productname}. Available: ${currentProduct.quantity}`,
//         });
//       }

//       // Deduct inventory from the database
//       currentProduct.quantity -= itemQty;
//       await currentProduct.save();

//       // Track item calculations
//       grandTotalItemsPrice += itemQty * itemPrice;

//       // Build our item array object matching the model
//       processedItems.push({
//         product: productIds[i],
//         qty: itemQty,
//         unit: units[i],
//         sellingprice: itemPrice,
//       });
//     }

//     // let transportCost = 0;
//     // if (parsedDistance <= 10 && grandTotalItemsPrice >= 500000) {
//     //   transportCost = 0;
//     // } else {
//     //   transportCost = 30000;
//     // }
// let transportCost = 0;

//     if (deliverymethod === 'pickup') {
//       transportCost = 0;
//     } else {
//       // It's a hardware delivery, execute pricing rules
//       if (parsedDistance <= 10 && grandTotalItemsPrice >= 500000) {
//         transportCost = 0;
//       } else {
//         transportCost = 30000;
//       }
//     }
//    // 4. Save everything as a single unified transaction record
//     const newSale = new Sale({
//       customername,
//       customercontact: phone,
//       customeraddress,
//       customerdistance: parsedDistance,
//       deliverymethod,
//       transportCost,
//       attendant: req.user._id,
//       total: grandTotalItemsPrice,
//       items: processedItems, // Saving the subdocuments array
//     });

//     await newSale.save();
//     res.redirect(`/receipt/${newSale._id}`);
//   } catch (error) {
//     console.error(error);
//     const items = await Stock.find({ quantity: { $gt: 0 } });
//     res.render("new_sale_form", { items, error: error.message });
//   }
// });
// //Get sales from the Db
// router.get("/sales-list", async (req, res) => {
//   try {
//     let stats = {
//       salesToday: 0,
//     };

//     // Calculate total sales
//     const salesAgg = await Sale.aggregate([
//       { $group: { _id: null, grandTotal: { $sum: "$total" } } },
//     ]);
//     stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;

//     const dbSales = await Sale.find()
//       .populate("items.product", "productname category")
//       .populate("attendant", "fullname")
//       .sort({ date: -1 });
//     res.render("sales", { dbSales, user: req.user, stats });
//   } catch (error) {
//     console.error(error.message);
//     res.status(400).send("Unable to pick sales from the db");
//   }
// });

// // Update sale
// router.get("/sale/edit/:id", async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id);
//     if (!sale) return res.status(404).send("Sale not found");
//     console.log(sale);
//     res.render("sale_edit", { sale });
//   } catch (error) {
//     console.log(error);
//     // res.status(400).send("Unable to find sale in the Db");
//   }
// });


// router.post("/sale/edit/:id", async (req, res) => {
//   try {
//     const { qty, sellingprice, customername, customercontact } = req.body;
    
//     // Calculate new total based on updated quantities
//     const total = parseInt(qty, 10) * parseFloat(sellingprice);
    
//     // Guard: Ensure it starts with 256 even if the user types a standard local 07... number
//     // let formattedContact = customercontact.trim();
//     // if (formattedContact.startsWith("0")) {
//     //   formattedContact = "256" + formattedContact.substring(1);
//     // } else if (!formattedContact.startsWith("256")) {
//     //   formattedContact = "256" + formattedContact;
//     // }

//     await Sale.findByIdAndUpdate(req.params.id, {
//       total,
//       customername,
//       // customercontact: formattedContact,
//       // Target the first item index inside the subdocument array
//       "items.0.qty": parseInt(qty, 10),
//       "items.0.sellingprice": parseFloat(sellingprice)
//     });
    
//     res.redirect("/sales-list");
//   } catch (error) {
//     console.error(error.message);
//     const sale = await Sale.findById(req.params.id);
//     res.render("sale_edit", { sale });
//   }
// });
// // Delete route
// // router.post("/sale/delete/:id", async (req, res) => {
// //   try {
// //     await Sale.findByIdAndDelete(req.params.id);
// //     res.redirect("/sales-list");
// //   } catch (error) {
// //     console.error(error);
// //   }
// // });

// // View and print receipt
// router.get("/receipt/:id", async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id)
//       .populate("items.product", "productname category")
//       .populate("attendant", "fullname");
//     if (!sale) return res.status(404).send("Receipt not found.");
//     res.render("receipt", { sale });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server error generating receipt");
//   }
// });



// module.exports = router;

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

// Add sale to the Db
router.get("/addsale", isSalesAttendantOrAdmin, async (req, res) => {
  try {
    const items = await Stock.find({ quantity: { $gt: 0 } });
    res.render("new_sale_form", { items });
  } catch (error) {
    res.status(500).send("server error");
    console.error("error", error.message);
  }
});

router.post("/addsale", isSalesAttendantOrAdmin, async (req, res) => {
  try {
    const {
      customername,
      customercontact,
      customeraddress,
      customerdistance,
      deliverymethod,
      productId,
      qty,
      unit,
      sellingprice,
    } = req.body;

    // Phone number validation
    const phone = "+256" + customercontact;
    
    // If deliverymethod is pickup, force distance to 0 regardless of user input
    const parsedDistance = deliverymethod === "pickup" ? 0 : (parseFloat(customerdistance) || 0);

    const productIds = Array.isArray(productId) ? productId : [productId];
    const quantities = Array.isArray(qty) ? qty : [qty];
    const units = Array.isArray(unit) ? unit : [unit];
    const sellingPrices = Array.isArray(sellingprice) ? sellingprice : [sellingprice];

    let grandTotalItemsPrice = 0;
    const processedItems = [];

    // Loop through each item in the order to check inventory and process stock
    for (let i = 0; i < productIds.length; i++) {
      if (!productIds[i]) continue;

      const currentProduct = await Stock.findById(productIds[i]);
      if (!currentProduct) {
        const items = await Stock.find({ quantity: { $gt: 0 } });
        return res.render("new_sale_form", {
          items,
          error: "One of the selected products was not found.",
        });
      }

      const itemQty = parseInt(quantities[i], 10);
      const itemPrice = parseFloat(sellingPrices[i]);

      // Check stock availability
      if (currentProduct.quantity < itemQty) {
        const items = await Stock.find({ quantity: { $gt: 0 } });
        return res.render("new_sale_form", {
          items,
          error: `Not enough stock for ${currentProduct.productname}. Available: ${currentProduct.quantity}`,
        });
      }

      // Deduct inventory from the database
      currentProduct.quantity -= itemQty;
      await currentProduct.save();

      // Track item calculations
      grandTotalItemsPrice += itemQty * itemPrice;

      // Build our item array object matching the model
      processedItems.push({
        product: productIds[i],
        qty: itemQty,
        unit: units[i],
        sellingprice: itemPrice,
      });
    }

    // Transport cost calculation rules based on pickup vs delivery method
    let transportCost = 0;
    if (deliverymethod === "pickup") {
      transportCost = 0;
    } else {
      // It's a hardware delivery, execute pricing rules
      if (parsedDistance <= 10 && grandTotalItemsPrice >= 500000) {
        transportCost = 0;
      } else {
        transportCost = 30000;
      }
    }

    // Save everything as a single unified transaction record
    const newSale = new Sale({
      customername,
      customercontact: phone,
      customeraddress,
      customerdistance: parsedDistance,
      deliverymethod,
      transportCost,
      attendant: req.user._id,
      total: grandTotalItemsPrice,
      items: processedItems,
    });

    await newSale.save();
    res.redirect(`/receipt/${newSale._id}`);
  } catch (error) {
    console.error(error);
    const items = await Stock.find({ quantity: { $gt: 0 } });
    res.render("new_sale_form", { items, error: error.message });
  }
});

// Get sales from the Db
router.get("/sales-list", async (req, res) => {
  try {
    let stats = { salesToday: 0 };

    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, grandTotal: { $sum: "$total" } } },
    ]);
    stats.salesToday = salesAgg.length > 0 ? salesAgg[0].grandTotal : 0;

    const dbSales = await Sale.find()
      .populate("items.product", "productname category")
      .populate("attendant", "fullname")
      .sort({ date: -1 });
    res.render("sales", { dbSales, user: req.user, stats });
  } catch (error) {
    console.error(error.message);
    res.status(400).send("Unable to pick sales from the db");
  }
});

// Update sale view
router.get("/sale/edit/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).send("Sale not found");
    res.render("sale_edit", { sale });
  } catch (error) {
    console.log(error);
  }
});

// Post update sale route
router.post("/sale/edit/:id", async (req, res) => {
  try {
    const { qty, sellingprice, customername } = req.body;
    const total = parseInt(qty, 10) * parseFloat(sellingprice);

    await Sale.findByIdAndUpdate(req.params.id, {
      total,
      customername,
      "items.0.qty": parseInt(qty, 10),
      "items.0.sellingprice": parseFloat(sellingprice)
    });
    
    res.redirect("/sales-list");
  } catch (error) {
    console.error(error.message);
    const sale = await Sale.findById(req.params.id);
    res.render("sale_edit", { sale });
  }
});

// View and print receipt
router.get("/receipt/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.product", "productname category")
      .populate("attendant", "fullname");
    if (!sale) return res.status(404).send("Receipt not found.");
    res.render("receipt", { sale });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error generating receipt");
  }
});

module.exports = router;
