const { internalError } = require('./errors');

const updateProductWithId = (res, db, newTitle, newPrice, newStock, newDesc, newSubject, productId) => {
	return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'UPDATE asset SET title=?, price=?, amount=?, description=?, subject_id=? WHERE asset_id=?',
				[newTitle, newPrice, newStock, newDesc, newSubject, productId],
				(err, rows, fields) => {
					if (err) {
						internalError(res, 500);
						reject('error during fetching of product');
						return;
					} else if (typeof rows[0] !== 'undefined') {
                        console.log("UpdateProductWithId");
                        resolve();
					}
				}
			);
		});
	});
};

const deleteUserById = (res, db, userId) => {
    return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'UPDATE user SET blocked=1 WHERE user_id=?',
				[userId],
				(err, rows, fields) => {
					if (err) {
						internalError(res, 500);
						reject('error during deletion of user');
						return;
					} else if (typeof rows[0] !== 'undefined') {
                        console.log("user " + userId + " was removed");
                        resolve();
					}
				}
			);
		});
	});
};

const confirmOrder = (res, db, orderId) => {
    return new Promise((resolve, reject) => {
		db.SSHConnection().then(connection => {
			connection.query(
				'UPDATE order SET processed=1 WHERE order_id=?',
				[orderId],
				(err, rows, fields) => {
					if (err) {
						internalError(res, 500);
						reject('error during fetching of product');
						return;
					} else if (typeof rows[0] !== 'undefined') {
                        console.log("user " + userId + " was removed");
                        resolve();
					}
				}
			);
		});
	});
};

module.exports = {
	updateProductWithId,
    deleteUserById,
    confirmOrder
};