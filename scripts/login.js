function getUser(){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'me',
    password : 'secret',
    database : 'USERS'
    });
    
    connection.connect();
    
    connection.query('SELECT *', function (error, results, fields) {
        if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    });
    
    connection.end();
}

function login(){

}