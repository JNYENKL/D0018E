
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const mysql = require('mysql');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');

//Import functions for ligon and user creation
const {loginUser, createUser} = require('./login.js');

/*
//Database
const db = mysql.createConnection ({
    host: '',
    user: 'root',
    password: '',
    database: 'D0018E'
});

//Connect to db
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

*/



//Set view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//Middleware setup
app.use(express.urlencoded())
app.use('/', router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(errorhandler());

//Manually create products for testing without DB
class productTest {
	constructor(_pn, _price, _imgSrc, _cat ){
		this.pn = _pn;
		this.price = _price;
		this.imgSrc= _imgSrc;
		this.category = _cat;
	}
}

const product1 = new productTest("Calculus", "99kr", "./img/Calculus.png", "Math" );
const product2 = new productTest("D0015E", "149kr", "./img/D0015E.png", "compsci" );
const product3 = new productTest("Derivator, integraler och sånt...", "399kr", "./img/DIOS.png", "Math" );
const product4 = new productTest("D0012E", "49kr", "./img/D0012E.png", "compsci" );
const product5 = new productTest("Mekanik", "59kr", "./img/F0060T.png", "Physics" );
const product6 = new productTest("FYSIKA formelblad", "79kr", "./img/FYSIKA.png", "Math" );

//Hämta Index-sidan
app.get('/', function(req, res) {
	const arr = [product1, product2, product3, product4, product5, product6];
	var itemList = [];
	for (var i = 0; i < arr.length; i++) {

		// Skapa ett objekt för datan
		var items = {
			'productName': arr[i].pn,
		  	'price': arr[i].price,
			'imgSrc': arr[i].imgSrc,
		  	'category': arr[i].category
		}
		// Lägg till hämtad data i en array
		itemList.push(items);
}
	res.render('index', {itemList: itemList});
	/*
	db.query('SELECT * FROM items', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {

	  		// Kolla igenom all data i tabellen
	  		for (var i = 0; i < rows.length; i++) {

	  			// Skapa ett objekt för datan
		  		var items = {
		  			'productName':rows[i].productName,
					'price':rows[i].price,
		  			'imgSrc':rows[i].imgSrc,
					'category':rows[i].category
		  		}
		  		// Lägg till hämtad data i en array
		  		itemList.push(items);
	  	}

	  	// Rendera index.pug med objekten i listan
	  	res.render('index', {itemList: itemList});
	  	}
	});

	// Stäng MySQL
	db.end();
	*/
});


app.get("/index", (req,res) => { frontPage(req,res)});
app.get("/login", (req,res) => { loginPage(req,res)});
app.post("/cart", (req,res) => { shoppingCart(req,res)});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));


//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');