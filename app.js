
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const mysql = require('mysql');
//const sshCon = require('./routes/sshConnector.js');

const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');

//Import functions for login and user creation
const {loginUser, createUser} = require('./login.js');
const{getNP} = require('./routes/newProduct.js');

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
//const myDBConnectionClient = require('./SSHDBConfig');

/*
const dbCall = () => {
   	sshCon.then((conn) => {
        conn.query(`SELECT * FROM product`, (err, result, fields) => {
            if (err) throw err;
            console.log("SQL Query Result-- ", result);
            if (result.length !== 0) {  //considering SQL Select statement
                result = result[0];
                //perform your required work on result
				
				for (var i = 0; i < result.length; i++) {
			
					// Skapa ett objekt för datan
					var items = {
						'productName': result[i].productName,
						'price': result[i].price,
						'imgSrc': result[i].imgSrc,
						'category': result[i].category
					}
						// Lägg till hämtad data i en array
						itemList.push(items);
				}
            }

        });
    })

}
*/
const execSync = require('child_process').execSync;
// import { execSync } from 'child_process';  // replace ^ if using ES modules

const sshCon = execSync('ssh -p 26880 karruc-9@130.240.207.20 -L 33306:localhost:3306', { encoding: 'utf-8' });  // the default is 'buffer'

//const pwd = execSync('BucOpPwcgHSsiVso', { encoding: 'utf-8' });

const db = mysql.createConnection ({
    host: 'localhost',
	port: 33306,
    user: 'root',
    password: '',
    database: 'D0018E'
});


// Koppla till db
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

//Hämta Index-sidan
app.get('/', function(req, res) {
	var itemList = [];
	


	// Hämta alla julklappar och rendera på index-sidan
	db.query('SELECT * FROM product', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
			//console.log(rows);
	  		// Kolla igenom all data i tabellen
			  for (var i = 0; i < rows.length; i++) {
			
				// Skapa ett objekt för datan
				var items = {
					'productName': rows[i].productName,
					'price': rows[i].price,
					'imgSrc': rows[i].imgSrc,
					'category': rows[i].category
				}
					// Lägg till hämtad data i en array
					itemList.push(items);
			}

	  	// Rendera index.pug med objekten i listan
	  	res.render('index', {itemList: itemList});
	  	}
	});
	
	/*
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
	
	dbServer.query('SELECT * FROM items', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {

			var itemList = [];
			for (var i = 0; i < arr.length; i++) {
		
				// Skapa ett objekt för datan
				var items = {
					'productName': res[i].productName,
					'price': res[i].price,
					'imgSrc': res[i].imgSrc,
					'category': res[i].category
				}
		  		// Lägg till hämtad data i en array
		  		itemList.push(items);
	  	}

	  	// Rendera index.pug med objekten i listan
	  	
	  	}
	});

	// Stäng MySQL
	dbServer.end();
	*/
	//SSHDBConnection.close();
});


//app.get("/index", (req,res) => { frontPage(req,res)});
//app.get("/login", (req,res) => { loginPage(req,res)});
//app.get("/cart", (req,res) => { shoppingCart(req,res)});
app.get("/newProduct", (req,res) => { getNP(req,res)});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));


//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');