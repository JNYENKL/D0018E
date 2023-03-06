class productTest {
	constructor(_pn, _price, _imgSrc, _cat) {
		this.pn = _pn;
		this.price = _price;
		this.imgSrc = _imgSrc;
		this.category = _cat;
	}
}

const product1 = new productTest(
	'Calculus',
	'99kr',
	'./img/Calculus.png',
	'Math'
);
shoppingCart = [product1];
module.exports = {
	addAssetToCart: (req, res, db, errorMessage, path, amount = 1) => {
		session = req.session;

		var user = [[session.uid]];
		var productId = [[req.query.product]];
		//var amount = [[req.body.item.stock]];
		var email = [[session.userMail]];

		var query = 'CALL d0018e_store.add_item_to_shopping_basket(?, ?, ?)';

		db.SSHConnection().then(connection => {
			connection.query(
				query,
				[productId, amount, email],
				(err, rows, fields) => {
					if (err) errorMessage(res, err);
					else res.redirect(path);
				}
			);
		});
	},

	//Render cart page
	getCart: (req, res) => {
		res.render('cart.pug', { shoppingCart: shoppingCart });
	} /*,

    getUserCart: (req, res) =>{
        const db = mysql.createConnection ({
            host: '127.0.0.1',
            port: 33306,
            user: 'root',
            password: '',
            database: 'D0018E'
        });
        
        db.connect();
        
        db.query('SELECT * FROM USERS WHERE Uname '+ " userName "+'', function (error, rows, fields) {
            if (error) throw error;

            for (var i = 0; i < rows.length; i++) {
			
				// Skapa ett objekt för datan
				var items = {
					'productName': rows[i].productName,
					'price': rows[i].price,
					'imgSrc': rows[i].imgSrc,
					'category': rows[i].category
				}
					// Lägg till hämtad data i en array
					itemList.push(items);
			}
            });
        
            db.end();
    },*/,
};