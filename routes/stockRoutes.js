const express = require('express');
const router = express.Router();

//List of available stock
router.get('/stock-list',(req,res)=>{
res.render('stock')
});

//Add stock to the Db
router.get('/addstock',(req,res)=>{
    res.render('stock_reg_form')
});
router.post('/stock',(req,res)=>{
    console.log(req.body)
    res.redirect('/stock-list')
});


module.exports = router;