//Checks if a user is logged in
const isAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin')
}
//Checks if the logged user is a manager
const isManager = (req,res,next) => {
    if(req.isAuthenticated() && req.user.userrole === "stockmanager") {
        return next();
    }
    res.status(403).send('Access denied:You are not a manager!')
}
//Checks if the logged user is an admin
const isAdmin = (req,res,next) => {
    if(req.isAuthenticated() && req.user.userrole === "admin") {
        return next();
    }
    res.status(403).send('Access denied:You are not an admin!')
}

//Checks if the logged user is a salesattendant
const isSalesAttendant = (req,res,next) => {
    if(req.isAuthenticated() && req.user.userrole === "salesattendant") {
        return next();
    }
    res.status(403).send('Access denied:You are not a salesattendant!')
}
// Checking if two users are logged in
const isManagerOrAdmin = (req,res,next) => {
    if(req.isAuthenticated() && (req.user.userrole === "stockmanager" || req.user.userrole === "admin")) {
        return next();
    }
    res.status(403).send('Access denied you stranger ')
}

const isSalesAttendantOrAdmin = (req,res,next) => {
    if(req.isAuthenticated() && (req.user.userrole === "salesattendant" || req.user.userrole === "admin")) {
        return next();
    }
    res.status(403).send('Access denied, you are neither an admin nor a salesattendant! Bye')
}

module.exports = {isAuthenticated,isManager,isAdmin,isSalesAttendant,isManagerOrAdmin,isSalesAttendantOrAdmin}