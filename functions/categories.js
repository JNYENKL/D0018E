const { errorMessage } = require('./errors');

const renderWithCats = (req, res, db, session, viewName, toRender = {}) => {
	const cats = [];

	db.SSHConnection().then(function (connection) {
		connection.query(
			'SELECT subject_id, name FROM subject',
			(err, row, fields) => {
				if (err) errorMessage(res, err);
				else {
					// Kolla igenom all data i tabellen
					for (var i = 0; i < row.length; i++) {
						const { subject_id, name } = row[i];

						var category = {
							subjectId: subject_id,
							catName: name,
						};
						//console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
						cats.push(category);
					}

					connection.query(
						'select sum(asset_amount) amount_in_cart from shopping_basket sb join shopping_basket_asset sba using (shopping_basket_id) group by user_id having user_id=?',
						[session.uid],
						(err, rows, fields) => {
							if (err) errorMessage(res, err);
							else {
								if (session.loggedIn && typeof rows[0] !== 'undefined') {
									if (rows[0].amount_in_cart !== 'undefined') {
										const { amount_in_cart } = rows[0];
										toRender = { ...toRender, amount_in_cart };
									}
								}

								res.render(viewName, {
									cat: cats,
									...toRender,
								});
							}
						}
					);
				}
			}
		);
	});
};

module.exports = {
	renderWithCats,
};
