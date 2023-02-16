
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const mysql = require('mysql2');

const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');

//Session 
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

//Import functions for login and user creation
const {loginUser, createUser, getLogin} = require('./routes/login.js');
const{getNP} = require('./routes/newProduct.js');
const{getCart} = require('./routes/shoppingCart.js');

//Set view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//Middleware setup
app.use(express.urlencoded())
app.use('/', router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(errorhandler());
app.use(cookieParser());

//Session setup
var session;
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

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


const execSync = require('child_process').execSync;

const sshCon = execSync('ssh -p 26880 karruc-9@130.240.207.20 -L 33306:localhost:3306', { encoding: 'utf-8' });  // the default is 'buffer'


const db = mysql.createConnection ({
    host: 'localhost',
	port: 33306,
    user: 'root',
    password: '',
    database: 'd0018e_store'
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

	//console.log(req);
	var itemList = [];
	
	//Get all products
	db.query('SELECT * FROM asset', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
	  	} else {
			//console.log(rows);
	  		// Kolla igenom all data i tabellen
			  for (var i = 0; i < rows.length; i++) {
			
				// Skapa ett objekt för datan
				var items = {
					'productName': rows[i].title,
					'link': rows[i].asset_id,
					'price': rows[i].price,
					//'imgSrc': rows[i].imgSrc,
					//'category': rows[i].category
				}
					// Lägg till hämtad data i en array
					itemList.push(items);
			}

	  	// Rendera index.pug med objekten i listan
	  	res.render('index', {itemList: itemList});
	  	}
	});
	

});

//Login with email, password and session
app.post('/loginUser', (req,res)=> {
	db.query('SELECT email, password FROM user WHERE email = '+ req.body.email +'', 
				function(err, row, fields){
					if(err){
						res.status(500).json({"status_code": 500,"status_message": "internal server error"}); //This should be a failed login by username message, not 500
					} else if(res.row.adminFlag){ //If user is admin
							//Login user as admin
					} else{
						if(req.body.pw == res.row.password){
							session=req.session;
							res.render('/');
						}
					}
				}
	)
	res.redirect('/');

});
//New user with email and password
app.post('/createUser', (req,res)=> {
	db.query('This should be something like: if mail does not exist in table users -> insert mail and password'+ req.body.mail, 
				function(err, row, fields){
					if(err){
						res.status(500).json({"status_code": 500,"status_message": "internal server error"}); //This should be a failed login by username message, not 500
					} else{
						//Update table users
						//Login new user with session
					}
				}
	)

	res.redirect('/');

});


app.get('/p', (req, res)=> {
		var items = [];
		//Get all products
		db.query('SELECT * FROM asset WHERE asset_id ='+ req.query.product , function(err, row, fields) {
			if (err) {
				res.status(500).json({"status_code": 500,"status_message": "internal server error"});
			} else {
			  //console.log(rows);
				// Kolla igenom all data i tabellen
				console.log(row);
				var product = {
					'productName': row[0].title,
					'price': row[0].price,
					'stock': row[0].amount,
					'description': row[0].description
				}

				console.log(row[0].title);

				items.push(product);
  
			// Rendera index.pug med objekten i listan
			res.render('productPage.pug', {items: items});
			}
	  });
});

//app.get("/index", (req,res) => { frontPage(req,res)});
app.get("/loginPage", (req,res) => { getLogin(req,res)});
app.get("/cart", (req,res) => { getCart(req,res)});
app.get("/newProduct", (req,res) => { getNP(req,res)});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));


//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');