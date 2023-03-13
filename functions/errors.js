const internalError = (
	res,
	statusCode = 500,
	message = 'internal server error'
) => {
	res.status(statusCode).json({
		status_code: statusCode,
		status_message: message,
	});
};

module.exports = {
	internalError,
};
