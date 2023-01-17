const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const mysql = require('mysql');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');

//databsen testJul har kolumnerna "id", "name", "image_name" och "link"
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testJul'
});
//Load each item to be displayed into an object
class Item{
    constructor(_id, _productName, _imgSrc, _price, _category ){
        this.id = _id;
        this.productName = _productName;
        this.imgSrc = _imgSrc;
        this.price = _price;

    }

}

//Get every Item in product data base
function getItems(){
    const products = [];
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'me',
    password : 'secret',
    database : 'ITEMS'
    });
    
    connection.connect();
    
    connection.query('SELECT *', function (error, results, fields) {
        if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    });
    
    connection.end();
}

function appendItems(productList){
    for (product in productList){

    }
}