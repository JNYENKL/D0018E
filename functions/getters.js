const { internalError } = require('./errors');

const getAllProducts = (res, db) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'select title, asset_id, price from asset',
				(err, rows, fields) => {
					const products = [];
					if (err) {
						internalError(res, 500);
						reject('error during fetching of products');
						return;
					} else if (typeof rows !== 'undefined') {
						for (let i = 0; i < rows.length; i++) {
							const { title, asset_id, price } = rows[i];
							products.push({
								productName: title,
								link: asset_id,
								price,
							});
						}
					}
					resolve(products);
				}
			);
		});
	});
};

const getAllProductsWithSubjectId = (res, db, subjectId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'select title, asset_id, price, name subject_name from asset a join subject using (subject_id) where subject_id=?',
				[subjectId],
				(err, rows, fields) => {
					const products = [];
					if (err) {
						internalError(res, 500);
						reject('error during fetching of products');
						return;
					} else if (typeof rows !== 'undefined') {
						for (let i = 0; i < rows.length; i++) {
							const { title, asset_id, price } = rows[i];
							products.push({
								productName: title,
								link: asset_id,
								price,
							});
						}
					}
					resolve(products);
				}
			);
		});
	});
};

const getProductsInCart = (res, db, userId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'SELECT title, asset_id, asset_amount, amount, price from shopping_basket sb join shopping_basket_asset sba using (shopping_basket_id) join asset a using (asset_id) where user_id=?',
				[userId],
				(err, rows, fields) => {
					const products = [];
					if (err) {
						internalError(res, 500);
						reject('error during fetching of products');
						return;
					} else if (typeof rows !== 'undefined') {
						for (let i = 0; i < rows.length; i++) {
							const { title, asset_id, price, asset_amount, amount } = rows[i];
							products.push({
								productName: title,
								link: asset_id,
								price,
								amount_in_cart: asset_amount,
								amount_in_store: amount,
							});
						}
					}
					resolve(products);
				}
			);
		});
	});
};

const getTotalPriceInCart = (res, db, userId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'SELECT total_price from shopping_basket where user_id=?',
				[userId],
				(err, rows, fields) => {
					let totalPrice = 0;
					if (err) {
						internalError(res, 500);
						reject('error during fetching of products');
						return;
					} else if (typeof rows[0] !== 'undefined') {
						totalPrice = rows[0].total_price;
					}
					resolve(totalPrice);
				}
			);
		});
	});
};

const getProductWithId = (res, db, productId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'select title, price, amount, description from asset where asset_id=?',
				[productId],
				(err, rows, fields) => {
					if (err) {
						internalError(res, 500);
						reject('error during fetching of product');
						return;
					} else if (typeof rows[0] !== 'undefined') {
						const { title, price, amount, description } = rows[0];
						resolve({
							productName: title,
							price,
							stock: amount,
							assId: productId,
							description,
						});
					}
				}
			);
		});
	});
};

const getCommentsForProduct = (res, db, productId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				"select rating, comment_text, concat(first_name, ' ', last_name) uname from comment join `user` u using (user_id) join order_asset oa using (order_asset_id) where asset_id=?",
				[productId],
				(err, rows, fields) => {
					const comments = [];
					if (err) {
						internalError(res, 500);
						reject('error during fetching of comments');
						return;
					} else if (typeof rows !== 'undefined') {
						for (let i = 0; i < rows.length; i++) {
							const { uname, comment_text, rating } = rows[i];
							comments.push({
								uname,
								rating,
								text: comment_text,
							});
						}
					}
					resolve(comments);
				}
			);
		});
	});
};

const getAllCats = (res, db) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'SELECT subject_id, name FROM subject',
				(err, rows, fields) => {
					const cats = [];
					if (err) {
						internalError(res, 500);
						reject('error during fetching of categories');
						return;
					} else if (typeof rows !== 'undefined') {
						for (let i = 0; i < rows.length; i++) {
							const { subject_id, name } = rows[i];
							cats.push({
								subjectId: subject_id,
								catName: name,
							});
						}
					}
					resolve(cats);
				}
			);
		});
	});
};

const getAmountInBasket = (res, db, userId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'select sum(asset_amount) amount_in_cart from shopping_basket sb join shopping_basket_asset sba using (shopping_basket_id) group by user_id having user_id=?',
				[userId],
				(err, rows, fields) => {
					let amount = 0;
					if (err) {
						internalError(res, 500);
						reject('error during fetching of comments');
						return;
					} else if (typeof rows[0] !== 'undefined')
						amount = rows[0].amount_in_cart;

					resolve(amount);
				}
			);
		});
	});
};

const hasOrdered = (res, db, userId, productId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'select count(order_id) times_ordered from `order` o join order_asset using (order_id) where user_id=? and asset_id=?',
				[userId, productId],
				(err, rows, fields) => {
					let ordered = false;
					if (err) {
						internalError(res, 500);
						reject('error during fetching of comments');
						return;
					} else if (typeof rows[0] !== 'undefined') {
						if (rows[0].times_ordered > 0) ordered = true;
					}
					resolve(ordered);
				}
			);
		});
	});
};

const hasCommented = (res, db, userId, productId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'select count(comment_id) times_commented from comment c join order_asset using (order_asset_id) where user_id=? and asset_id=?',
				[userId, productId],
				(err, rows, fields) => {
					let commented = false;
					if (err) {
						internalError(res, 500);
						reject('error during fetching of comments');
						return;
					} else if (typeof rows[0] !== 'undefined') {
						if (rows[0].times_commented > 0) commented = true;
					}
					resolve(commented);
				}
			);
		});
	});
};

module.exports = {
	getAllProducts,
	getAllProductsWithSubjectId,
	getProductWithId,
	getCommentsForProduct,
	getAllCats,
	getAmountInBasket,
	getProductsInCart,
	getTotalPriceInCart,
	hasOrdered,
	hasCommented,
};
