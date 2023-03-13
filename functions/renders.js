const {
	getAllCats,
	getAmountInBasket,
	getAllProducts,
	getProductWithId,
	getCommentsForProduct,
	getProductsInCart,
	getTotalPriceInCart,
	hasOrdered,
	hasCommented,
	getAllProductsWithSubjectId,
} = require('./getters');

const renderWithProps = async (
	req,
	res,
	session,
	message = '',
	viewName,
	toRender = {}
) => {
	session.message = message;
	res.render(viewName, {
		af: session.admin,
		login: session.loggedIn,
		message,
		...toRender,
	});
};

const renderLoginPage = async (
	req,
	res,
	db,
	session,
	message = '',
	viewName = 'loginPage',
	toRender = {}
) => {
	renderWithCats(req, res, db, session, message, viewName, {
		...toRender,
	});
};

const renderWithCats = async (
	req,
	res,
	db,
	session,
	message = '',
	viewName,
	toRender = {}
) => {
	let cats = await getAllCats(res, db);
	let amountInBasket = 0;

	if (session.loggedIn)
		amountInBasket = await getAmountInBasket(res, db, session.uid);

	if (typeof cats === 'undefined') cats = [];
	if (typeof amountInBasket === 'undefined') amountInBasket = 0;

	renderWithProps(req, res, session, message, viewName, {
		cat: cats,
		amount_in_cart: amountInBasket,
		...toRender,
	});
};

const renderIndex = async (
	req,
	res,
	db,
	session,
	message = '',
	viewName = 'index',
	toRender = {}
) => {
	const itemList = await getAllProducts(res, db);
	renderWithCats(req, res, db, session, message, viewName, {
		itemList,
		...toRender,
	});
};

const renderIndexWithErrorMessage = (
	req,
	res,
	db,
	session,
	message = 'something went wrong'
) => {
	renderIndex(req, res, db, session, message);
};

const renderProductPage = async (
	req,
	res,
	db,
	session,
	productId,
	message = '',
	viewName = 'productPage',
	toRender = {}
) => {
	const item = await getProductWithId(res, db, productId);
	const comments = await getCommentsForProduct(res, db, productId);
	const ordered = await hasOrdered(res, db, session.uid, productId);
	const commented = await hasCommented(res, db, session.uid, productId);
	renderWithCats(req, res, db, session, message, viewName, {
		item,
		comments,
		ordered,
		commented,
		...toRender,
	});
};

const renderCart = async (
	req,
	res,
	db,
	session,
	userId,
	message = '',
	viewName = 'cart',
	toRender = {}
) => {
	const products = await getProductsInCart(res, db, userId);
	const totalPrice = await getTotalPriceInCart(res, db, userId);
	renderWithCats(req, res, db, session, message, viewName, {
		shoppingCart: products,
		total: totalPrice,
		...toRender,
	});
};

const renderProductsWithSubject = async (
	req,
	res,
	db,
	session,
	subject_id,
	message = '',
	viewName = 'index',
	toRender = {}
) => {
	const itemList = await getAllProductsWithSubjectId(res, db, subject_id);
	renderWithCats(req, res, db, session, message, viewName, {
		itemList,
		...toRender,
	});
};

const renderLoginError = (
	req,
	res,
	db,
	session,
	message = 'Something went wrong.',
	viewName = 'loginPage',
	toRender = {}
) => {
	session.uid = null;
	session.loggedIn = false;
	renderWithCats(req, res, db, session, message, viewName, toRender);
};

const renderUpdateProducts = async (
	req,
	res,
	db,
	session,
	message = '',
	viewName = 'updateProduct',
	toRender = {}
) => {
	const item = await getProductWithId(res, db, req.query.product);
	renderWithCats(req, res, db, session, message, viewName, {
		item,
		...toRender,
	});
}

module.exports = {
	renderWithProps,
	renderWithCats,
	renderIndex,
	renderIndexWithErrorMessage,
	renderProductsWithSubject,
	renderProductPage,
	renderLoginError,
	renderCart,
	renderUpdateProducts,
	renderLoginPage
};
