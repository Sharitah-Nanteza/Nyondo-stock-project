//1.Dependencies
const express = require('express');
const expressSession = require('express-session')
const path =require('path')

//2.Instantiations
const app = express();
const port = 3000;
//3.Configurations
//Set templating engine to pug
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({ extended: false }));
app.use(expressSession({
  secret:'secret',
  resave: false,
  saveUninitialized: false
}))
app.use(express.static(path.join(__dirname,'public')));

//5.Routes
app.use('/',require('./routes/signRoutes'))
app.use('/',require('./routes/stockRoutes'))
app.use('/',require('./routes/salesRoutes'))
app.use('/',require('./routes/depositsRoutes'))
app.use('/',require('./routes/dashboardRoutes'))
app.use('/',require('./routes/creditRoutes'))
app.use('/',require('./routes/supplierRoutes'))




// USER REGISTRATION FORM
app.get('/registration',(req,res)=>{
  res.sendFile(__dirname + '/html/user_registration_form.html')
});

app.post('/registration',(req,res)=>{
   console.log(req.body)
});

 // STOCK REGISTRATION FORM
app.get('/stock',(req,res)=>{
  res.sendFile(__dirname + '/html/stock_reg_form.html')
});

app.post('/stock',(req,res)=>{
   console.log(req.body)
});
// NEW SALE FORM
app.get('/sale',(req,res)=>{
  res.sendFile(__dirname + '/html/new_sale_form.html')
});

app.post('/sale',(req,res)=>{
   console.log(req.body)
});
// DEPOSIT FORM
app.get('/deposit',(req,res)=>{
  res.sendFile(__dirname + '/html/deposit_form.html')
});

app.post('/deposit',(req,res)=>{
   console.log(req.body)
});



// This is the second last chunk of code
// Handling non-existent route
app.use((req,res)=>{
  res.status(404).send('oops!Route not found.');
});

//6.Bootstrapping Server
// This must be the last line of code in this file!
app.listen(port, () => console.log(`listening on port ${port}`)); // new