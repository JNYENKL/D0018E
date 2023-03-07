const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const db = require('./db.js');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');

//Session
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

//Import all JS functions
const { loginUser, createUser, getLogin } = require('./routes/login.js');
const { index } = require('./routes/index.js');
const { getCart, addAssetToCart } = require('./routes/shoppingCart.js');
const { renderWithCats } = require('./functions/categories.js');
const { errorMessage } = require('./functions/errors.js');

//Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware setup
app.use(express.urlencoded());
app.use('/', router);
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(errorhandler());
app.use(cookieParser());
app.use('/css', express.static('css'));

//Session setup
var session;
const fifteenMinutes = 1000 * 60 * 15;
app.use(
	sessions({
		secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
		saveUninitialized: true,
		cookie: {
			maxAge: fifteenMinutes,
		},
		resave: false,
		admin: false,
		uid: null,
		loggedIn: false,
		userMail: null,
		message: '',
	})
);

//Hämta Index-sidan
app.get('/', function (req, res) {
	index(req, res);
});

// admin, admin@d0018e.com, p4ssw0rd
app.get('/loginPage', (req, res) => {
	session = req.session;
	renderWithCats(req, res, db, req.session, 'loginPage', {
		af: session.admin,
		login: session.loggedIn,
		message: '',
		referer: req.headers.referer,
	});
});

//Login with email, password and session
app.post('/loginUser', (req, res) => {
	session = req.session;

	db.SSHConnection().then(connection => {
		connection.query(
			'SELECT * FROM user WHERE email=?',
			[req.body.email],
			function (err, row, fields) {
				if (err) {
					session.uid = null;
					session.message = 'Something went wrong.';
					renderWithCats(req, res, db, session, 'loginPage', {
						message: session.message,
					});
				} else if (typeof row[0] == 'undefined') {
					session.uid = null;
					session.message = 'Wrong username.';
					renderWithCats(req, res, db, session, 'loginPage', {
						message: session.message,
					});
				} else {
					if (!bcrypt.compareSync(req.body.pw, row[0].password)) {
						console.log(toString(req.body.pw) + '!=' + row[0].password);
						session.message = 'Wrong password';
						renderWithCats(req, res, db, session, 'loginPage', {
							message: session.message,
						});
						//res.status(500).json({"status_code": 500,"status_message": "internal server error: wrong password"}); //This should be a failed login by username message, not 500
					} else {
						console.log('password correct');

						session.uid = row[0].user_id;
						session.loggedIn = true;
						session.userMail = row[0].email;
						session.message = '';

						console.log('user_id:' + session.uid);
						if (session.uid == 1) {
							session.admin = true;
						}
						console.log('REFERER: ', req.body.referer);
						res.redirect(req.body.referer || '/');
					}
				}
			}
		);
	});

	//res.render('/loginPage', {message: "Wrong email or password"})
});

//New user with first name, last name, email and password
app.post('/createUser', (req, res) => {
	var name = [[req.body.Cfn]];
	var surname = [[req.body.Cln]];
	var mail = [[req.body.Cemail]];
	var session = req.session;
	var pw = bcrypt.hashSync(req.body.Cpw, saltRounds);
	var cats = [];

	let query = 'CALL d0018e_store.add_user(?, ?, ?, ?)';

	db.SSHConnection().then(function (connection) {
		connection.query(
			query,
			[name, surname, mail, pw],
			function (err, row, fields) {
				if (err) {
					console.log('db error in create user:' + err);
					session.message = 'User with email ' + mail + ' already exists.';
					renderWithCats(req, res, db, session, "loginPage", { message: session.message });
					//res.status(500).json({"status_code": 500,"status_message": "internal server error"}); //This should be a failed login by username message, not 500
				} else {
					console.log('Created user.');
					//session.message = "";
					res.redirect('/loginPage');
				}
			}
		);
	});
});

//Destroy the session
app.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

//Lay an order
app.post('/createOrder', (req, res) => {
	db.SSHConnection().then(function (connection) {
		connection.query(
			'Call a procedure which moves cart to order',
			function (err, row, fields) {
				if (err) {
					res.status(500).json({
						status_code: 500,
						status_message: 'internal server error',
					}); //This should be a failed login by username message, not 500
				} else {
					//Update table users
					//Login new user with session
					res.redirect('/');
				}
			}
		);
		res.redirect('/');
	});
});

app.get('/p', (req, res) => {
	session = req.session;
	var items = [];
	var comments = [];
	var ordered = false;

	//Get all products
	db.SSHConnection().then(function (connection) {
		connection.query(
			'SELECT * FROM asset WHERE asset_id =' + req.query.product,
			function (err, row, fields) {
				if (err) {
					res.status(500).json({
						status_code: 500,
						status_message: 'internal server error',
					});
				} else {
					//console.log(rows);
					// Kolla igenom all data i tabellen
					console.log(row);
					var product = {
						productName: row[0].title,
						price: row[0].price + ' kr',
						stock: row[0].amount + ' in stock',
						assId: row[0].asset_id,
						description: row[0].description,
					};

					items.push(product);

					// Rendera index.pug med objekten i listan
					//res.render('productPage.pug', {items: items, login: session.loggedIn});
				}
			}
		);
		if(session.uid != null){
			connection.query(
				'SELECT * FROM `order` WHERE user_id=' + session.uid,
				function (err, row, fields) {
					if (err) {
						res.status(500).json({
							status_code: 500,
							status_message: 'internal server error in ordered check'
						});
					} else {
						console.log(row);
						if(row[0] != []){
							ordered = true;
						}
					
					}
				}
	
			);
		}

		//SELECT user_id, order_asset_id, rating, comment_text FROM comment cm JOIN user u USING (user_id) user u
		connection.query(
			"select rating, comment_text, concat(first_name, ' ', last_name) uname from comment join `user` u using (user_id) join order_asset oa using (order_asset_id) where asset_id=?;",
			req.query.product,
			function (err, row, fields) {
				if (err) errorMessage(res, session, err);
				//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
				else {
					// Kolla igenom all data i tabellen
					for (var i = 0; i < row.length; i++) {
						const { uname, rating, comment_text } = row[i];

						var comment = {
							uname,
							rating,
							text: comment_text,
						};
						comments.push(comment);
					}

					// Rendera index.pug med objekten i listan
					//res.render('productPage', {items: items, cat: cats, af: session.admin, login: session.loggedIn, message: ""});

					renderWithCats(req, res, db, session, 'productPage', {
						items,
						af: session.admin,
						login: session.loggedIn,
						message: '',
						comments,
						currentUrl: req.originalUrl,
						ordered
					});
				}
			}
		);
	});
});

app.get('/c', (req, res) => {
	session = req.session;

	var itemList = [];
	//Get all products
	db.SSHConnection().then(function (connection) {
		const query =
			'select title, asset_id, price, name subject_name from asset a join subject using (subject_id) where subject_id=?';

		connection.query(query, [req.query.cat], (err, row, fields) => {
			if (err) {
				res.status(500).json({
					status_code: 500,
					status_message: 'internal server error',
				});
			} else {
				//console.log(rows);
				// Kolla igenom all data i tabellen
				for (var i = 0; i < row.length; i++) {
					const { name, title, asset_id, price, subject_name } = row[i];

					// Skapa ett objekt för datan
					var items = {
						productName: title,
						link: asset_id,
						price,
						subject_name,
						//'imgSrc': rows[i].imgSrc,
						//'category': rows[i].category
					};

					itemList.push(items);
				}

				// Rendera index.pug med objekten i listan
				//res.render('productPage.pug', {items: items, login: session.loggedIn});

				let message;
				if (typeof session.message === 'undefined') message = '';
				else message = session.message;

				renderWithCats(req, res, db, session, 'index', {
					itemList,
					af: session.admin,
					login: session.loggedIn,
					message,
				});
			}
		});
	});
});

//Get logged in users shopping cart
app.get('/cart', function (req, res) {
	//console.log(req);
	var itemList = [];
	var totalPrice = 0;
	var cats = [];

	session = req.session;
	userID = session.uid;

	console.log('uid:' + userID);

	var query =
		'SELECT title, asset_id, asset_amount, amount, price, total_price from shopping_basket sb join shopping_basket_asset sba using (shopping_basket_id) join asset a using (asset_id) where user_id=?';
	//Get all products from the cart
	db.SSHConnection().then(function (connection) {
		connection.query(query, [[userID]], function (err, rows, fields) {
			if (err) errorMessage(res, session, err);
			else {
				console.log(rows);
				let totalPrice = 0;
				// Kolla igenom all data i tabellen
				for (let i = 0; i < rows.length; i++) {
					// Skapa ett objekt för datan
					const { title, asset_id, price, asset_amount, amount } = rows[i];

					var items = {
						productName: title,
						link: asset_id,
						price,
						amount_in_cart: asset_amount,
						amount_in_store: amount,
						//'totalPrice': totalPrice+rows[i].price
						//'imgSrc': rows[i].imgSrc,
						//'category': rows[i].category
					};

					totalPrice
						? totalPrice.length > 0
						: (totalPrice = rows[0].total_price);

					// Lägg till hämtad data i en array
					itemList.push(items);
				}

				// Rendera index.pug med objekten i listan
				//res.render('cart', {shoppingCart: [], login: session.loggedIn});

				renderWithCats(req, res, db, session, 'cart', {
					shoppingCart: itemList,
					login: session.loggedIn,
					af: session.admin,
					message: '',
					total: totalPrice,
				});
			}
		});
	});
});

app.post('/addComment', function (req, res) {

	session = req.session;
	userId = [[session.uid]];
	productId = [[req.query.product]];
	commentText = [[req.body.ct]];
	rating = [[req.body.rating]];
	var oid;

	//call d0018e_store.add_comment_to_order_asset(1, 1, 5, "nice item");
	
	//Get all products from the cart
	db.SSHConnection().then(function (connection) {
		
		var query1 = "select distinct(order_id) from comment join order_asset oa using (order_asset_id) join `order` o using (order_id) where o.user_id=? and asset_id=?"
		//var query1 = 'SELECT order_id FROM order WHERE user_id=?';
		connection.query(query1, [userId, productId], function (err, rows, fields) {
			if (err) {
				res.status(500).json({
					status_code: 500,
					status_message: 'internal server error in q1 comment'
				});
			} else {
				oid = [[rows]];
				console.log(oid);
			}
		});

		var query2 = 'CALL d0018e_store.add_comment_to_order_asset(?, ?, ?, ?)';
		
		connection.query(query2, [productId, oid, rating, commentText], function (err, rows, fields) {
			if (err) {
				res.status(500).json({
					status_code: 500,
					status_message: 'internal server error in q2 comment'
				});
			} else {
				console.log(rows);
				var path = '/p?product=' + productId;
				res.redirect(path);
			}
		});
	});
});

//IN PROGRESS
//Add an item to the cart of the logged in user
app.get('/addToCart', function (req, res) {
	addAssetToCart(req, res, db, '/p?product=' + req.query.product);
});

app.get('/increaseAmount', function (req, res) {
	addAssetToCart(req, res, db, 'cart');
});

//IN PROGRESS
//Get logged in users shopping cart
app.get('/removeFromCart', function (req, res) {
	session = req.session;

	const email = [[session.userMail]];
	var productId = [[req.query.product]];

	const delete_sba_query = 'call d0018e_store.restore_sba_to_store(?, ?, ?)';

	db.SSHConnection().then(connection => {
		connection.query(
			delete_sba_query,
			[email, parseInt(productId), 1],
			(err, rows, fields) => {
				if (err) errorMessage(res, session, err);
				else res.redirect('cart');
			}
		);
	});
});

app.get('/createOrder', function (req, res) {
	session = req.session;

	const userId = [[session.uid]];
	const email = [[session.userMail]];
	const items = [];

	let orderId;

	const add_order_query = 'call d0018e_store.create_order(?, @order_id)';
	const select_sba_query =
		'select asset_id, asset_amount, title, price from shopping_basket_asset sba join shopping_basket sb using (shopping_basket_id) join asset using (asset_id) where user_id=?';
	const add_order_assets_query = 'call d0018e_store.add_order_asset(?, ?, ?)';
	const select_order_total_price_query =
		'select total_price from `order` where order_id=?';

	db.SSHConnection().then(connection => {
		connection.query(add_order_query, [email], (err, rows, fields) => {
			if (err) errorMessage(res, session, err);
			else {
				connection.query(
					'select @order_id order_id',
					[userId],
					(err, rows, field) => {
						if (err) {
							errorMessage(res, session, err);
						} else {
							orderId = rows[0].order_id;
						}
						//	res.redirect('orderSuccess');
					}
				);
			}

			connection.query(select_sba_query, [userId], (err, rows, fields) => {
				if (err) errorMessage(res, session, err);
				else {
					for (let i = 0; i < rows.length; i++) {
						const { asset_id, asset_amount, title, price } = rows[i];

						console.log('order-id: ', orderId);

						connection.query(
							add_order_assets_query,
							[orderId, asset_id, asset_amount],
							(err, rows, fields) => {
								if (err) errorMessage(res, session, err);
							}
						);

						items.push({
							productName: title,
							asset_id,
							asset_amount,
							price,
						});
					}

					let totalPrice;

					connection.query(
						select_order_total_price_query,
						[orderId],
						(err, rows, fields) => {
							if (err) errorMessage(res, session, err);
							else {
								totalPrice = rows[0].total_price;
								renderWithCats(req, res, db, session, 'orderSuccess', {
									items,
									totalPrice,
									af: session.admin,
									login: session.loggedIn,
									message: session.message,
								});
							}
						}
					);
				}
			});
		});
	});
});


app.get('/adminPage', function(req,res){

	ses = req.session;
	orderList = [];

		//Wanted data for displaying in page:
		//order_id, user_id, order_date, first_name, last_name, email
		var query = 'SELECT `order`.order_id, `order`.order_date, user.user_id, user.first_name, user.last_name, user.email FROM `order` JOIN user ON `order`.user_id = user.user_id;';

		db.SSHConnection().then(connection => {
			connection.query(query, function(err, rows, fields){
			if(err){
				console.log('Could not get from db in adminPage');
				res.redirect('/');
			} else{
				console.log(rows[0]);
				for(var i = 0; i< rows.length; i++){

					const { order_id, user_id, order_date, first_name, last_name, email} = rows[i];

					var order = {
						oid : order_id,
						uid : user_id,
						time : order_date,
						fname: first_name,
						lname : last_name,
						mail : email
					}
					
					orderList.push(order);
				}
				renderWithCats(req, res, db, session, 'adminPage', {
					orders: orderList,
					af: session.admin,
					login: session.loggedIn,
					message: session.message,
				});
				
			}
			
		});


		});

});

app.get('/orderSuccess', function (req, res) {
	renderWithCats(req, res, db, req.session, 'orderSuccess');
});

//app.get("/index", (req,res) => { frontPage(req,res)});
app.get('/loginUser', (req, res) => {
	loginUser(req, res);
});
//app.get("/loginPage", (req,res) => { getLogin(req,res)});
app.get('/cart', (req, res) => {
	getCart(req, res);
});
app.get('/newProduct', (req, res) => {
	getNP(req, res);
});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));

//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');
