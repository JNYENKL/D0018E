const errorMessage = (res, session, err) => {
	console.log(err);
	session.message = 'Technical issues, check back later.';
	res.render('index', {
		message: session.message,
	});
};

module.exports = {
	errorMessage,
};
