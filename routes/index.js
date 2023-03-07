const { renderWithCats } = require('../functions/categories.js');
const db = require('./../db.js');

module.exports = {
	index: (req, res) => {
		var itemList = [];
		var cats = [];
		session = req.session;

		//Get all products
		db.SSHConnection().then(function (connection) {
			connection.query('SELECT * FROM asset', function (err, rows, fields) {
				if (err) {
					session.message = 'Technical issues, check back later.';
					res.render('index', {
						message: session.message,
					});
					//res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
				} else {
					// Kolla igenom all data i tabellen
					for (let i = 0; i < rows.length; i++) {
						// Skapa ett objekt för datan
						let { title, asset_id, price } = rows[i];
						var items = {
							productName: title,
							link: asset_id,
							price,
							//'imgSrc': rows[i].imgSrc,
							//'category': rows[i].category
						};

						itemList.push(items);
					}

					// Rendera index.pug med objekten i listan
					//res.render('index', {itemList: itemList, cat: cats, af: session.admin, login: session.loggedIn, message: ""});
				}

				renderWithCats(req, res, db, session, 'index', {
					itemList,
					cat: cats,
					af: session.admin,
					login: session.loggedIn,
					message: '',
				});
			});
		});
	},
};