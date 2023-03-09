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

const {
	renderWithCats,
	renderIndex,
	renderProductPage,
	renderLoginError,
	renderIndexWithErrorMessage,
	renderCart,
	renderProductsWithSubject,
} = require('./functions/renders');

const { title } = require('process');

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
	renderIndex(req, res, db, req.session);
});

// admin, admin@d0018e.com, p4ssw0rd
app.get('/loginPage', (req, res) => {
	renderWithCats(req, res, db, req.session, undefined, 'loginPage');
});

//Login with email, password and session
app.post('/loginUser', (req, res) => {
	session = req.session;

	db.SSHConnection().then(connection => {
		connection.query(
			'SELECT * FROM user WHERE email=?',
			[req.body.email],
			function (err, row, fields) {
				if (err) renderLoginError(req, res, db, session);
				else if (typeof row[0] === 'undefined')
					renderLoginError(req, res, db, session, 'Wrong username.');
				else {
					if (!bcrypt.compareSync(req.body.pw, row[0].password))
						renderLoginError(req, res, db, session, 'Wrong password.');
					else {
						console.log('password correct');
						console.log('referer', req.body.referer);

						const { user_id, email } = row[0];

						session.uid = user_id;
						session.loggedIn = true;
						session.userMail = email;
						session.message = '';

						console.log('user_id:' + session.uid);
						if (session.uid == 1) {
							session.admin = true;
						}

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
			'select email checked_mail from `user` u where email=?',
			[mail],
			(err, rows, fields) => {
				if (err) renderIndexWithErrorMessage(req, res, db, session);
				else if (typeof rows[0] !== 'undefined') {
					if (rows[0].checked_mail == mail)
						renderLoginError(
							req,
							res,
							db,
							session,
							`User with email ${mail} already exists.`
						);
				}
			}
		);

		connection.query(
			query,
			[name, surname, mail, pw],
			function (err, rows, fields) {
				if (err) renderIndexWithErrorMessage(req, res, db, session);
				else {
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
	renderProductPage(
		req,
		res,
		db,
		req.session,
		req.query.product,
		undefined,
		undefined,
		{ currentUrl: req.originalUrl }
	);
});

app.get('/c', (req, res) => {
	renderProductsWithSubject(req, res, db, req.session, req.query.cat);
});

//Get logged in users shopping cart
app.get('/cart', function (req, res) {
	renderCart(req, res, db, req.session, req.session.uid);
});

app.post('/addComment', function (req, res) {
	session = req.session;
	userId = [[session.uid]];
	productId = [[req.query.product]];
	commentText = [[req.body.ct]];
	rating = [[req.body.rating]];
	var oid;
	let oaid;

	//call d0018e_store.add_comment_to_order_asset(1, 1, 5, "nice item");

	//Get all products from the cart
	db.SSHConnection().then(function (connection) {
		var query1 =
			'select order_id, order_asset_id from `order` o join order_asset oa using (order_id) where user_id=? and asset_id=? order by order_date desc limit 1;';
		connection.query(query1, [userId, productId], (err, rows, fields) => {
			if (err) internalError(res, 500, 'internal server error on q2');
			else {
				if (typeof rows[0] === 'undefined')
					renderIndexWithErrorMessage(
						req,
						res,
						db,
						session,
						`No orders found for product-id: ${productId}`
					);
				else {
					if (
						typeof rows[0].order_id !== 'undefined' &&
						typeof rows[0].order_asset_id !== 'undefined'
					) {
						const { order_id, order_asset_id } = rows[0];
						const query2 =
							'select asset_id from comment c join order_asset oa using (order_asset_id) where order_asset_id=?';

						connection.query(query2, [order_asset_id], (err, rows, fields) => {
							if (err) internalError(res, 500, 'internal server error on q2');
							else if (typeof rows[0] !== 'undefined')
								renderProductPage(
									req,
									res,
									db,
									session,
									productId,
									`You have already rated this product (productID: ${productId})`
								);
							else {
								let query3 =
									'call d0018e_store.add_comment_to_order_asset(?, ?, ?, ?);';
								connection.query(
									query3,
									[productId, order_id, rating, commentText],
									(err, rows, fields) => {
										if (err)
											internalError(res, 500, 'internal server error on q3');
										else {
											res.redirect(`/p?product=${productId}`);
										}
									}
								);
							}
						});
					}
				}
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
				if (err) renderIndexWithErrorMessage(req, res, db, session);
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
			if (err) renderIndexWithErrorMessage(req, res, db, session);
			else {
				connection.query(
					'select @order_id order_id',
					[userId],
					(err, rows, field) => {
						if (err) {
							renderIndexWithErrorMessage(req, res, db, session);
						} else {
							orderId = rows[0].order_id;
						}
						//	res.redirect('orderSuccess');
					}
				);
			}

			connection.query(select_sba_query, [userId], (err, rows, fields) => {
				if (err) renderIndexWithErrorMessage(req, res, db, session);
				else {
					for (let i = 0; i < rows.length; i++) {
						const { asset_id, asset_amount, title, price } = rows[i];

						console.log('order-id: ', orderId);

						connection.query(
							add_order_assets_query,
							[orderId, asset_id, asset_amount],
							(err, rows, fields) => {
								if (err) renderIndexWithErrorMessage(req, res, db, session);
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
							if (err) renderIndexWithErrorMessage(req, res, db, session);
							else {
								totalPrice = rows[0].total_price;
								renderWithCats(
									req,
									res,
									db,
									session,
									undefined,
									'orderSuccess',
									{
										items,
										totalPrice,
										af: session.admin,
										login: session.loggedIn,
										message: session.message,
									}
								);
							}
						}
					);
				}
			});
		});
	});
});

app.get('/adminPage', function (req, res) {
	ses = req.session;
	orderList = [];

	//Wanted data for displaying in page:
	//order_id, user_id, order_date, first_name, last_name, email
	var query =
		'SELECT `order`.order_id, `order`.order_date, user.user_id, user.first_name, user.last_name, user.email FROM `order` JOIN user ON `order`.user_id = user.user_id;';

	db.SSHConnection().then(connection => {
		connection.query(query, function (err, rows, fields) {
			if (err) {
				console.log('Could not get from db in adminPage');
				res.redirect('/');
			} else {
				console.log(rows[0]);
				for (var i = 0; i < rows.length; i++) {
					const {
						order_id,
						user_id,
						order_date,
						first_name,
						last_name,
						email,
					} = rows[i];

					var order = {
						oid: order_id,
						uid: user_id,
						time: order_date,
						fname: first_name,
						lname: last_name,
						mail: email,
					};

					orderList.push(order);
				}
				renderWithCats(req, res, db, session, undefined, 'adminPage', {
					orders: orderList,
					af: session.admin,
					login: session.loggedIn,
					message: session.message,
				});
			}
		});
	});
});

app.get('/orderHistory', function (req, res) {
	ses = req.session;

	orderList = [];

	//Wanted data for displaying in page:
	//order_id, user_id, order_date, first_name, last_name, email
	var query =
		'select order_date, order_id, first_name, last_name, email from `order` o join `user` u using (user_id) where user_id=?';

	db.SSHConnection().then(connection => {
		connection.query(query, [ses.uid], function (err, rows, fields) {
			if (err) {
				console.log('Could not get from db');
				res.redirect('/');
			} else {
				console.log(rows[0]);
				for (var i = 0; i < rows.length; i++) {
					const {
						order_id,
						order_date,
						first_name,
						last_name,
						email,
					} = rows[i];

					var order = {
						oid: order_id,
						time: order_date,
						fname: first_name,
						lname: last_name,
						mail: email,
					};

					orderList.push(order);
				}
				renderWithCats(req, res, db, session, undefined, 'orderHistory', {
					orders: orderList,
					af: session.admin,
					login: session.loggedIn,
					message: session.message,
				});
			}
		});
	});
});

app.get('/users', function (req, res) {
	ses = req.session;
	userList = [];

	//Wanted data for displaying in page:
	//order_id, user_id, order_date, first_name, last_name, email
	var query =
		'SELECT user.user_id, user.first_name, user.last_name, user.email FROM user;';

	db.SSHConnection().then(connection => {
		connection.query(query, function (err, rows, fields) {
			if (err) {
				console.log('Could not get from db in adminPage');
				res.redirect('/');
			} else {
				console.log(rows[0]);
				for (var i = 0; i < rows.length; i++) {
					const {						
						user_id,
						first_name,
						last_name,
						email,
					} = rows[i];

					var users = {
						uid: user_id,
						fname: first_name,
						lname: last_name,
						mail: email,
					};

					userList.push(users);
				}
				renderWithCats(req, res, db, session, undefined, 'users', {
					users: userList,
					af: session.admin,
					login: session.loggedIn,
					message: session.message,
				});
			}
		});
	});
});

app.get('/orderSuccess', function (req, res) {
	renderWithCats(req, res, db, req.session, undefined, 'orderSuccess');
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
