const express = require('express');
const router = express.Router();

//Deposit_form to be filled 
router.get('/deposited',(req,res)=>{
res.render('deposit_form')
});

router.post('/deposit',(req,res)=>{
    console.log(req.body)
    res.redirect('/deposits')
});
//Customer deposits
router.get('/deposits',(req,res)=>{
res.render('customers')
});

module.exports = router;