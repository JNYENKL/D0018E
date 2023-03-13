const { renderWithCats, renderIndex } = require('../functions/renders.js');

module.exports = {
	index: (req, res, db, session) => {
		renderIndex(req, res, db, session);
	},
};
