const express = require('express');
const router = express.Router();

//Users register.
router.get('/registration',(req,res)=>{
res.render('user_registration')
});

router.post('/register',(req,res)=>{
    console.log(req.body)
    res.redirect('/signin')
});

//Users login
router.get('/signin',(req,res)=>{
res.render('login')
});


module.exports = router;