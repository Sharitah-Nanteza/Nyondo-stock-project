const express = require('express');
const router = express.Router();

// Add sale to the Db
router.get('/addsale',(req,res)=>{
res.render('sales_form')
});
router.post('/sale',(req,res)=>{
    console.log(req.body)
    res.redirect('/sales-list')
});
//Select sales from the Db
router.get('/sales-list',(req,res)=>{
res.render('sales')
});


module.exports = router;