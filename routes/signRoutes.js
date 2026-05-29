const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const passport = require("passport");
const {
  isSalesAttendant,
  isAdmin,
  isManager,
  isSalesAttendantOrAdmin,
} = require("../middleware/auth");
//Users register.
router.get("/registration", async (req, res) => {
  res.render("user_registration");
});

router.post("/register", async (req, res) => {
  try {
    const { fullname, email, phonenumber, nin, userrole, password } = req.body;

    // Phone number validation
    // const phone = "+256" + phonenumber;
    let rawPhone = phonenumber.trim();
    if (rawPhone.startsWith("0")) {
      rawPhone = rawPhone.substring(1);
    }
    const phone = "+256" + rawPhone;

    // NIN validation
    const ninRegex = /^C[MF][0-9]{2}[0-9A-Z]{10}$/;

    if (!ninRegex.test(nin.trim().toUpperCase())) {
      return res.render("user_registration", {
        error: "Enter a valid Ugandan NIN",
      });
    }

    // Check if user already exists
    let existingUser = await Registration.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.render("user_registration", {
        error: "Email is already registered",
      });
    }
    // Create a new email
    const newUser = new Registration({
      fullname,
      email: email.toLowerCase(),
      phonenumber: phone,
      nin: nin.toUpperCase(),
      userrole,
    });
    console.log(newUser);
    Registration.register(newUser, req.body.password, (err) => {
      if (err) {
        return res.redirect("/registration");
      }
    });
    res.redirect("/admin-dashboard");
  } catch (error) {
    console.error(error);
    res.render("user_registration", { error: error.message });
  }
});

//Users login
router.get("/signin", (req, res) => {
  res.render("login");
});

router.post(
  "/signin",
  passport.authenticate("local", { failureRedirect: "/signin" }),
  (req, res) => {
    if (req.user.userrole === "admin") {
      res.redirect("/admin-dashboard");
    } else if (req.user.userrole === "salesattendant") {
      res.redirect("/sales-dashboard");
    } else if (req.user.userrole === "stockmanager") {
      res.redirect("/manager-dashboard");
    } else {
      res.redirect("/");
    }
  },
);

//Logout route
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
