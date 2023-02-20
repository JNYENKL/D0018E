
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

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
    resave: false,
	admin: false, 
	uid: null
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

//var loggedInUser_id;

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

	console.log(bcrypt.hashSync('p4ssw0rd', saltRounds));

	//console.log(req);
	var itemList = [];
	var adminFlag = false;
	var loggedIn = false;
	
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
					session = req.session;
					if(session.uid != null){
						loggedIn = true;
					}

					if(session.admin == true){
						adminFlag = true;
					}
			}

	  	// Rendera index.pug med objekten i listan
	  	res.render('index', {itemList: itemList, af: adminFlag, login: loggedIn});
	  	}
	});
	

});

// admin, admin@d0018e.com, p4ssw0rd


//Login with email, password and session
app.post('/loginUser', (req, res) => {
	//var hashedInput = bcrypt.hash(req.body.pw);
	console.log("logging in");
	console.log(req.body.email);
	db.query('SELECT * FROM user WHERE email=?', [req.body.email], 
				function(err, row, fields){
					if(err){
						session = req.session;
						session.uid=null;
						res.status(500).json({"status_code": 500,"status_message": "internal server error: db"}); //This should be a failed login by username message, not 500
					} 
					else{
						console.log(row[0]);
						//var plain = toString(req.body.pw);
						console.log(row[0].user_id);
						console.log(row[0].password); 
						//var check = bcrypt.compareSync(plain, row[0].password);

						if(req.body.pw != toString(row[0].password)){
								res.status(500).json({"status_code": 500,"status_message": "internal server error: wrong password"}); //This should be a failed login by username message, not 500
						} else {
							console.log('password correct');
							session = req.session;
							session.uid = row[0].user_id;
							console.log("user_id:"+session.uid);
							if(session.uid == 1){
								session.admin = true;
							}
							console.log("here");
							res.redirect('/');
						}
							
					}
				}
				
			)
			//res.render('/loginPage', {message: "Wrong email or password"})
	});
//New user with email and password
app.post('/createUser', (req,res)=> {
	
	db.query('INSERT INTO user(first_name, last_name, email, password) VALUES('+ req.body.fn +','+ req.body.ln +','+ req.body.email +','+ req.body.pw+')', 
				function(err, row, fields){
					if(err){
						res.status(500).json({"status_code": 500,"status_message": "internal server error"}); //This should be a failed login by username message, not 500
					} else{
						res.redirect('loginPage');
					}
				}
	)

	res.redirect('/');

});

//Lay an order
app.post('/createOrder', (req,res)=> {
	db.query('Call a procedure which moves cart to order', 
				function(err, row, fields){
					if(err){
						res.status(500).json({"status_code": 500,"status_message": "internal server error"}); //This should be a failed login by username message, not 500
					} else{
						//Update table users
						//Login new user with session
						res.redirect('/');
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
					'assId': row[0].asset_id,
					'description': row[0].description
				}

				console.log(row[0].title);

				items.push(product);
  
			// Rendera index.pug med objekten i listan
			res.render('productPage.pug', {items: items});
			}
	  });
});

//Get logged in users shopping cart
app.get('/cart', function(req, res) {

	//console.log(req);
	var itemList = [];
	var totalPrice = 0;
	userID = req.session.uid;
	//Get all products from the cart
	db.query('SELECT * FROM shopping_basket_asset WHERE user_id='+ userID +'', function(err, rows, fields) {
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
					'totalPrice': totalPrice+rows[i].price
					//'imgSrc': rows[i].imgSrc,
					//'category': rows[i].category
				}
					// Lägg till hämtad data i en array
					itemList.push(items);
			}

	  	// Rendera index.pug med objekten i listan
	  	res.render('cart', {shoppingCart: itemList});
	  	}
	});
	

});

//app.get("/index", (req,res) => { frontPage(req,res)});
app.get("/loginUser", (req,res) => { loginUser(req, res)});
app.get("/loginPage", (req,res) => { getLogin(req,res)});
app.get("/cart", (req,res) => { getCart(req,res)});
app.get("/newProduct", (req,res) => { getNP(req,res)});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));


//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');