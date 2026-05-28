const mongoose = require('mongoose');
// * for esm compatibility
const passportLocalMongoose =
    require("passport-local-mongoose").default ||
    require("passport-local-mongoose");
    

const registrationSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required:true
  },
  email: {
    type: String,
    trim: true,
    required:true,
    unique: true
  },
 phonenumber: {
  type: String,
  required:true,
 },
nin: {
  type: String,
  trim: true,
  required: true,
  uppercase: true,
  match: [/^C[MF][A-Z0-9]{12}$/, "Enter a valid Ugandan NIN"]
},
 userrole: {
  type: String,
  required:true,
  enum: ['admin','stockmanager','salesattendant']
 }  
});

registrationSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
});
module.exports = mongoose.model('Registration',registrationSchema);