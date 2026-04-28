const express = require('express');
const router = express.Router();

// Register credits
router.get('/addcredit',(req,res)=>{
res.render('credit_form')   
});

router.post('/thecredit',(req,res)=>{
    console.log(req.body)
    res.redirect('/credit')
});

// Credits
router.get('/credit',(req,res)=>{
res.render('credit')    
});

module.exports = router;