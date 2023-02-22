
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

//const bcrypt = require('bcrypt');
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
const fiveMinutes = 1000 * 60 * 5;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: fiveMinutes },
    resave: false,
	admin: false, 
	uid: null,
	loggedIn: false,
	userMail: null,
	message: ""
}));

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
;
	var itemList = [];
	var cats = [];
	session = req.session;
	
	//Get all products
	db.query('SELECT * FROM asset', function(err, rows, fields) {
	  	if (err) {
			session.message = "Technical issues, check back later.";
			res.render('index', {message: session.message});
	  		//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
	  	} else {

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

				itemList.push(items);
			}

			// Rendera index.pug med objekten i listan
			//res.render('index', {itemList: itemList, cat: cats, af: session.admin, login: session.loggedIn, message: ""});
	  	}
	});

	db.query('SELECT * FROM subject', function(err, row, fields) {
		if (err) {
			session.message = "Technical issues, check back later.";
			res.render('index', {message: session.message});
			//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
		} else {

			// Kolla igenom all data i tabellen
			for (var i = 0; i < row.length; i++) {
			
				var category = {
					subjectId: row[i].subject_id,
					catName: row[i].name
				}
				//console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
				cats.push(category);
			}
			
			// Rendera index.pug med objekten i listan
			res.render('index', {itemList: itemList, cat: cats, af: session.admin, login: session.loggedIn, message: ""});
		}
	  });
	

});

// admin, admin@d0018e.com, p4ssw0rd
app.get('/loginPage', (req, res) =>{
	var cats = [];
	session = req.session;

	db.query('SELECT * FROM subject', function(err, row, fields) {
		if (err) {
			session.message = "Technical issues, check back later.";
			res.render('index', {message: session.message});
			//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
		} else {

			// Kolla igenom all data i tabellen
			for (var i = 0; i < row.length; i++) {
			
				var category = {
					subjectId: row[i].subject_id,
					catName: row[i].name
				}
				//console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
				cats.push(category);
			}
			
			// Rendera index.pug med objekten i listan
			res.render('loginPage', {cat: cats});
		}
	  });

});

//Login with email, password and session
app.post('/loginUser', (req, res) => {

	console.log("Entering login");

	session = req.session;
	var cats = []

	db.query('SELECT * FROM subject', function(err, row, fields) {
		if (err) {
			session.message = "Technical issues, check back later.";
			res.render('index', {message: session.message});
			//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
		} else {

			// Kolla igenom all data i tabellen
			for (var i = 0; i < row.length; i++) {
			
				var category = {
					subjectId: row[i].subject_id,
					catName: row[i].name
				}
				//console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
				cats.push(category);
			}
			
			// Rendera index.pug med objekten i listan
			//res.render('index', {itemList: itemList, cat: cats, af: session.admin, login: session.loggedIn, message: ""});
		}
	  });

	db.query('SELECT * FROM user WHERE email=?', [req.body.email], 
				function(err, row, fields){
					if(err) {
						session.uid=null;
						session.message = "Something went wrong.";
						res.render('loginPage', {cat: cats, message: session.message});

					} else if(typeof row[0] == 'undefined'){
						session.uid=null;
						session.message = "Wrong username.";
						res.render('loginPage', {cat: cats, message: session.message});
					}
					else{

						if(toString(req.body.pw) != toString(row[0].password)){
								console.log(toString(req.body.pw) +'!='+ row[0].password);
								session.message = "Wrong password";
								res.render('loginPage', {cat: cats, message: session.message});
								//res.status(500).json({"status_code": 500,"status_message": "internal server error: wrong password"}); //This should be a failed login by username message, not 500
						} else {

							console.log('password correct');

							session.uid = row[0].user_id;
							session.loggedIn = true;
							session.userMail = row[0].email;
							session.message = "";

							console.log("user_id:"+session.uid);
							if(session.uid == 1){
								session.admin = true;
							}
							console.log("here");
							res.redirect('/');
						}
							
					}
				});


			//res.render('/loginPage', {message: "Wrong email or password"})
	});

//New user with first name, last name, email and password
app.post('/createUser', (req,res)=> {

	var name = [[req.body.Cfn]];
	var surname = [[req.body.Cln]];
	var mail = [[req.body.Cemail]];
	var pw = [[req.body.Cpw]];

	let query = 'CALL d0018e_store.add_user(?, ?, ?, ?)';

	db.query(query, [name, surname, mail, pw], function(err, row, fields){
					if(err){
						console.log('db error in create user:'+ err);
						session.message = "User with email " + mail + " already exists.";
						res.render('loginPage', {message: session.message})
						//res.status(500).json({"status_code": 500,"status_message": "internal server error"}); //This should be a failed login by username message, not 500
					} else{
						console.log('Created user.');
						session.message = "";
						res.redirect('/');
					}
				}
	)
});

//Destroy the session
app.get('/logout',(req,res) => {
    req.session.destroy();
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

		session = req.session;
		var items = [];
		var cats = [];
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
					'price': row[0].price + "kr",
					'stock': row[0].amount + " in stock",
					'assId': row[0].asset_id,
					'description': row[0].description
				}

				console.log(row[0].title);

				items.push(product);
  
			// Rendera index.pug med objekten i listan
			//res.render('productPage.pug', {items: items, login: session.loggedIn});
			}
	  });

	  db.query('SELECT * FROM subject', function(err, row, fields) {
		if (err) {
			session.message = "Technical issues, check back later.";
			res.render('index', {message: session.message});
			//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
		} else {

			// Kolla igenom all data i tabellen
			for (var i = 0; i < row.length; i++) {
			
				var category = {
					subjectId: row[i].subject_id,
					catName: row[i].name
				}
				console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
				cats.push(category);
			}
			
			// Rendera index.pug med objekten i listan
			res.render('productPage', {items: items, cat: cats, af: session.admin, login: session.loggedIn, message: ""});
		}
	  });
});

app.get('/c', (req, res)=> {

	session = req.session;
	var itemList = [];
	var cats = [];
	//Get all products
	db.query('SELECT * FROM asset WHERE subject_id ='+ req.query.cat , function(err, row, fields) {
		if (err) {
			res.status(500).json({"status_code": 500,"status_message": "internal server error"});
		} else {
		  //console.log(rows);
	  		// Kolla igenom all data i tabellen
			for (var i = 0; i < row.length; i++) {
			
				// Skapa ett objekt för datan
				var items = {
					'productName': row[i].title,
					'link': row[i].asset_id,
					'price': row[i].price,
					//'imgSrc': rows[i].imgSrc,
					//'category': rows[i].category
				}

				itemList.push(items);
			}

		// Rendera index.pug med objekten i listan
		//res.render('productPage.pug', {items: items, login: session.loggedIn});
		}
  });

  db.query('SELECT * FROM subject', function(err, row, fields) {
	if (err) {
		session.message = "Technical issues, check back later.";
		res.render('index', {message: session.message});
		//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
	} else {

		// Kolla igenom all data i tabellen
		for (var i = 0; i < row.length; i++) {
		
			var category = {
				subjectId: row[i].subject_id,
				catName: row[i].name
			}
			//console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
			cats.push(category);
		}
		session.message = "";
		// Rendera index.pug med objekten i listan
		res.render('index', {itemList: itemList, cat: cats, af: session.admin, login: session.loggedIn, message: session.message});
	}
  });
});

//Get logged in users shopping cart
app.get('/cart', function(req, res) {

	//console.log(req);
	var itemList = [];
	var totalPrice = 0;
	var cats =[];

	session = req.session;
	userID = session.uid;

	console.log('uid:'+userID);
	//Get all products from the cart
	db.query('SELECT * FROM shopping_basket WHERE user_id=?', [[userID]], function(err, rows, fields) {
	  	if (err) {
			console.log('Error in cart')
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
	  	} else {

			console.log(rows);
	  		// Kolla igenom all data i tabellen
			  for (var i = 0; i < rows.length; i++) {
			
				// Skapa ett objekt för datan
				var items = {
					'productName': rows[i].title,
					'link': rows[i].asset_id,
					'price': rows[i].price,
					//'totalPrice': totalPrice+rows[i].price
					//'imgSrc': rows[i].imgSrc,
					//'category': rows[i].category
				}
					// Lägg till hämtad data i en array
					itemList.push(items);
			}

	  		// Rendera index.pug med objekten i listan
	  		//res.render('cart', {shoppingCart: [], login: session.loggedIn});
	  	}
	});

	db.query('SELECT * FROM subject', function(err, row, fields) {
		if (err) {
			session.message = "Technical issues, check back later.";
			res.render('index', {message: session.message});
			//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
		} else {
	
			// Kolla igenom all data i tabellen
			for (var i = 0; i < row.length; i++) {
			
				var category = {
					subjectId: row[i].subject_id,
					catName: row[i].name
				}
				//console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
				cats.push(category);
			}
			
			// Rendera index.pug med objekten i listan
			res.render('cart', {shoppingCart: [], login: session.loggedIn, cat: cats, af: session.admin, login: session.loggedIn, message: ""});
		}
	  });
	

});

//IN PROGRESS
//Add an item to the cart of the logged in user
app.get('/addToCart', function(req, res) {

	ses = req.session;

	var user = [[ses.uid]];
	var productId = [[req.body.item.assId]];
	//var amount = [[req.body.item.stock]];
	var email = [[session.userMail]]; 

	var query = 'CALL d0018e_store.add_item_to_shopping_basket(?, ?, ?)';

	db.query(query, [productId, 1, email], function(err, rows, fields) {
	  	if (err) {
			console.log('Error in addToCart');
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
	  	} else {
			var path = '/p?product='+ toString(productId);
			res.redirect(path);
	  	}
	});
	

});

//IN PROGRESS
//Get logged in users shopping cart
app.get('/removeFromCart', function(req, res) {

	ses = req.session;

	var user = ses.uid;
	var productId = req.body.item.assId;

	var query = 'INSERT INTO shopping_basket '

	db.query(query, values, function(err, rows, fields) {
	  	if (err) {
			console.log('Error in addToCart');
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
	  	} else {
			var path = '/p?product='+ toString(productId);
			res.redirect(path);
	  	}
	});
	

});



//app.get("/index", (req,res) => { frontPage(req,res)});
app.get("/loginUser", (req,res) => { loginUser(req, res)});
//app.get("/loginPage", (req,res) => { getLogin(req,res)});
app.get("/cart", (req,res) => { getCart(req,res)});
app.get("/newProduct", (req,res) => { getNP(req,res)});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));


//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');