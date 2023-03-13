const fs = require('fs');

module.exports = {
	//Rendera sidan där objekt läggs in i databasen
	getNP: (req, res) => {
		res.render('newProduct.pug');
	},

	//Metod för att lägga in i databasen
	postProduct: (req, res) => {
		//
		console.log('Connecting to database for postGift method');
		let productName = req.body.pn;
		let price = req.body.pr;
		let imgSrc = req.body.imgSrc;
		let description = req.body.descri;
		let category = req.body.category;

		let query =
			"INSERT INTO `items` (`name`, `image`, `link`, `descrip`) VALUES ('" +
			productName +
			"', '" +
			price +
			"', '" +
			imgSrc +
			"', '" +
			descrip +
			"','" +
			cat +
			"')";
		db.query(query, (err, result) => {
			if (err) {
				console.log('An error occured');
				return res.status(500).send(err);
			}

			res.redirect('/');
		});
	},
};
