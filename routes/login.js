const sessions = require('express-session');

module.exports = {

    getLogin: (req, res) => {
        res.render('loginPage.pug');
    },

    loginUser:(req,res) =>{
        console.log("loginsession:"+ req.session);
        //var session = req.session;
        res.render('loginPage.pug');
    },

}