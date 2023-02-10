
module.exports = {


    getLogin: (req, res) => {
        res.render('loginPage.pug');
    },

    loginUser: (req, res) =>{
        const db = mysql.createConnection ({
            host: '127.0.0.1',
            port: 33306,
            user: 'root',
            password: '',
            database: 'D0018E'
        });
        
        connection.connect();
        
        connection.query('SELECT * FROM USERS WHERE Uname '+ " userName "+'', function (error, results, fields) {
            if (error) throw error;
        console.log('The solution is: ', results[0].solution);
        });
        
        connection.end();
    },

    createUser: (req, res) =>{
        var mysql      = require('mysql');
        const db = mysql.createConnection ({
            host: '127.0.0.1',
            port: 33306,
            user: 'root',
            password: '',
            database: 'D0018E'
        });
        
        connection.connect();
        
        connection.query('SELECT * FROM USERS', function (error, results, fields) {
            if (error) throw error;
        console.log('The solution is: ', results[0].solution);
        });
        
        connection.end();
    }


}