const express = require('express');
const router = express.Router();

// Register supplier
router.get('/addsupplier',(req,res)=>{
res.render('supplier_form')    
});

router.post('/supply',(req,res)=>{
    console.log(req.body)
    res.redirect('/supplier')
});

// Supplier form
router.get('/supplier',(req,res)=>{
    res.render(supplier)
});

module.exports = router;