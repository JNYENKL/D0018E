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
const formidable = require('formidable');

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
	renderUpdateProducts,
	renderLoginPage
} = require('./functions/renders');

const { updateProductWithId,
		updateOrderWithId,
		deleteUserById,
		confirmOrder,
		newAsset
} = require('./functions/setters');

const { internalError } = require('./functions/errors');

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
app.use('/js', express.static('js'));

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
	renderLoginPage(req, res, db, req.session, undefined, undefined, {
		referer: req.headers.referer,
	});
});

app.post('/loginUser', (req, res) => {
	session = req.session;

	const loginError = (message = '') => {
		session.uid = null;
		session.loggedIn = false;
		renderLoginError(req, res, db, session, message);
	};

	db.SSHConnection().then(connection => {
		connection.query(
			'SELECT * FROM user WHERE email=?',
			[req.body.email],
			function (err, row, fields) {
				if (err) loginError();
				else if (typeof row[0] === 'undefined') loginError('Wrong username.');
				else if (row[0].blocked) loginError('Blocked user');
				else if (!bcrypt.compareSync(req.body.pw, row[0].password))
					loginError('Wrong password.');
				else {
					const { user_id, email } = row[0];

					session.uid = user_id;
					session.loggedIn = true;
					session.userMail = email;
					session.message = '';

					if (session.uid == 1) session.admin = true;

					res.redirect(req.body.referer || '/');
				}
			}
		);
	});

});

app.post('/createUser', (req, res) => {
	session = req.session;

	const pw = bcrypt.hashSync(req.body.Cpw, saltRounds);
	const { Cfn: name, Cln: surname, Cemail: mail } = req.body;

	const loginError = (message = '') => {
		session.uid = null;
		session.loggedIn = false;
		renderLoginError(req, res, db, session, message);
	};

	const checkForEmptyValues = values => {
		for (let key in values)
			if (!values[key].trim()) loginError(`Invalid ${key}`);
	};

	const validateEmail = email => {
		return String(email)
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			);
	};

	checkForEmptyValues({
		name: name,
		surname: surname,
		mail: mail,
		pw,
	});

	if (!validateEmail(mail)) loginError('Invalid email');

	db.SSHConnection().then(function (connection) {
		connection.query(
			'select email checked_mail from `user` u where email=?',
			[mail],
			(err, rows, fields) => {
				if (err) renderIndexWithErrorMessage(req, res, db, session);
				else if (typeof rows[0] !== 'undefined') {
					if (rows[0].checked_mail == mail)
						loginError(`Användaren med e-post adressen: ${mail} finns redan.`);
				}
			}
		);

		connection.query(
			'CALL d0018e_store.add_user(?, ?, ?, ?)',
			[name, surname, mail, pw],
			function (err, rows, fields) {
				if (err) renderIndexWithErrorMessage(req, res, db, session);
				else renderLoginPage(req, res, db, session, 'Användaren har skapats.');
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
							'select count(comment_id) times_commented from comment c join order_asset using (order_asset_id) where user_id=? and asset_id=?';

						connection.query(
							query2,
							[userId, productId],
							(err, rows, fields) => {
								if (err) internalError(res, 500, 'internal server error on q2');
								else if (typeof rows[0] !== 'undefined') {
									if (rows[0].times_commented !== 'undefined') {
										if (rows[0].times_commented > 0) {
											renderProductPage(
												req,
												res,
												db,
												session,
												productId,
												`You have already rated this product (productID: ${productId})`
											);
										} else {
											let query3 =
												'call d0018e_store.add_comment_to_order_asset(?, ?, ?, ?);';
											connection.query(
												query3,
												[productId, order_id, rating, commentText],
												(err, rows, fields) => {
													if (err)
														internalError(
															res,
															500,
															'internal server error on q3'
														);
													else {
														res.redirect(`/p?product=${productId}`);
													}
												}
											);
										}
									}
								}
							}
						);
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
	session = req.session;
	orderList = [];

	//Wanted data for displaying in page:
	//order_id, user_id, order_date, first_name, last_name, email
	var query =
		'select order_id, order_date, user_id, first_name, last_name, email, total_price, processed from `order` join `user` using (user_id)';

	db.SSHConnection().then(connection => {
		connection.query(query, function (err, rows, fields) {
			if (err) {
				internalError(res);
			} else {
				for (var i = 0; i < rows.length; i++) {
					const {
						order_id,
						order_date,
						user_id,
						first_name,
						last_name,
						email,
						total_price,
						processed
					} = rows[i];

					var order = {
						oid: order_id,
						uid: user_id,
						status: processed,
						time: order_date,
						fname: first_name,
						lname: last_name,
						mail: email,
						total_price,
						
					};

					orderList.push(order);
				}
				renderWithCats(req, res, db, session, undefined, 'adminPage', {
					orders: orderList,
				});
			}
		});
	});
});

app.get('/productManager', function(req, res){
	session = req.session;

	productList = [];

	var query = 'SELECT * FROM asset';

	db.SSHConnection().then(connection => {
		connection.query(query, function (err, rows, fields) {
			if (err) {
				internalError(res);
			} else {

				for (var i = 0; i < rows.length; i++) {
					const {
						asset_id,
						subject_id,
						title,
						price,
						amount,
						description,
					} = rows[i];

					var product = {
						id : asset_id,
						sid : subject_id,
						ti : title,
						pr : price,
						am : amount,
						desc : description,
					};

					productList.push(product);
				}

				renderWithCats(req, res, db, session, undefined, 'productManager', {
					allProducts: productList,
				});
			}
			
				
		}
	)});
});

app.get('/updateProduct', function(req, res){
	renderUpdateProducts(req, res, db, req.session);
});

app.post('/updateProduct', function(req, res){
	session = req.session;
	productId = req.query.product;
	
	newTitle = req.body.pn;
	newPrice = req.body.pr;
	newStock = req.body.am;
	newDesc = req.body.desc;
	newSubject = req.body.sub;

	updateProductWithId(req, db, newTitle, newPrice, newStock, newDesc, newSubject, productId);

	res.redirect('/productManager');
});

app.get('/deleteProduct', function(req, res){
	session = req.session;
	prodctId = [[req.query.product]];
	

	var query = 'DELETE FROM asset WHERE asset_id=?';

	db.SSHConnection().then(connection => {
		connection.query(query, [productId], function (err, rows, fields) {
			if (err) {
				internalError(res);
			} 
			console.log("Deleted product");
			res.redirect('/productManager');
				
		}
	)});
});

app.post('/newProduct', function(req, res){
	session = req.session;	
	newTitle = req.body.pn;
	newPrice = req.body.pr;
	newStock = req.body.am;
	newDesc = req.body.desc;
	newSubject = req.body.sub;

	newAsset(req, db, newSubject, newTitle, newPrice, newStock, newDesc);

	res.redirect('/productManager');
});


app.get('/orderHistory', function (req, res) {
	session = req.session;

	orderList = [];

	//Wanted data for displaying in page:
	//order_id, user_id, order_date, first_name, last_name, email
	var query =
		'select order_date, order_id, first_name, processed, last_name, email, total_price from `order` o join `user` u using (user_id) where user_id=?';

	db.SSHConnection().then(connection => {
		connection.query(query, [session.uid], function (err, rows, fields) {
			if (err) {
				res.redirect('/');
			} else {
				for (var i = 0; i < rows.length; i++) {
					const {
						order_id,
						order_date,
						first_name,
						last_name,
						email,
						total_price,
						processed
					} = rows[i];

					orderList.push({
						oid: order_id,
						time: order_date,
						fname: first_name,
						lname: last_name,
						mail: email,
						total_price,
						status: processed
					});
				}
				renderWithCats(req, res, db, session, undefined, 'orderHistory', {
					orders: orderList,
					message: session.message,
				});
			}
		});
	});
});

app.post('/updateOrder', function(req, res){
	session = req.session;
	var orderId = req.query.oid;	
	newStatus = req.body.selOrd;

	updateOrderWithId(req, db, newStatus, orderId);

	res.redirect('/adminPage');
});

app.get('/users', function (req, res) {
	session = req.session;
	userList = [];

	//Wanted data for displaying in page:
	//order_id, user_id, order_date, first_name, last_name, email
	var query =
		'SELECT user.user_id, user.first_name, user.last_name, user.email, user.blocked FROM user;';

	db.SSHConnection().then(connection => {
		connection.query(query, function (err, rows, fields) {
			if (err) {
				res.redirect('/');
			} else {
				for (var i = 0; i < rows.length; i++) {
					const { user_id, first_name, last_name, email, blocked } = rows[i];

					var users = {
						uid: user_id,
						fname: first_name,
						lname: last_name,
						mail: email,
						block: blocked
					};

					console.log(users.block);

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

app.get('/removeUser', function (req, res) {
	//console.log(req.query.uid);
	deleteUserById(res, db, req.query.uid);
	res.redirect('/users');
});

app.get('/processOrder', function (req, res) {
	confirmOrder(res, db, req.query.oid);
	res.redirect('/adminPage')
});

app.get('/orderSuccess', function (req, res) {
	renderWithCats(req, res, db, req.session, undefined, 'orderSuccess');
});

//Sätt views som default-mapp för rendering
app.use(express.static(__dirname + '/views'));

//Lyssna på localhost:3000
app.listen(3000);

console.log('Running at Port 3000');
