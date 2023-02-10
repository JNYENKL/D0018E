class productTest {
	constructor(_pn, _price, _imgSrc, _cat ){
		this.pn = _pn;
		this.price = _price;
		this.imgSrc= _imgSrc;
		this.category = _cat;
	}
}

const product1 = new productTest("Calculus", "99kr", "./img/Calculus.png", "Math" );
shoppingCart = [product1];
module.exports = {



  //Render cart page
  getCart: (req, res) => {
    res.render('cart.pug', {shoppingCart: shoppingCart});
  }/*,

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
    },*/
}