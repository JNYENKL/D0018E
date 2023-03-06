const errorMessage = (res, err) => {
	res.status(500).json({
		status_code: 500,
		status_message: 'internal server error' + err,
	});
};

module.exports = {
	errorMessage,
};