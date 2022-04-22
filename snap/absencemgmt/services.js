
const crypto = require('crypto')

/**
 * Not shared yet
 * @param {number} tokenLength - token length in bits
 */
function generateApiErpToken(tokenLength = 32) {
	console.log('CALL generateApiErpToken');
	const token = crypto.randomBytes(tokenLength).toString('hex');
	console.log('New token', token)
};

module.exports = {
	getHarbourWhere,
};


/* -------- */
/* SERVICES */
/* -------- */

/**
 * @typedef T_harbourWhereOptions
 * @property {string} [apiErpToken]
 * @property {string} [erp_link]
 * @property {string} [id]
 * @property {string} [id_entity]
 * @property {string} [name]
 * @property {string} [erp_link]
 */
/**
 * 
 * @param {T_harbourWhereOptions} whereOptions 
 * @returns {Promise<Array<T_harbour>>}
 */
async function getHarbourWhere(whereOptions) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find('harbour', whereOptions, null, function (err, data) {
			if (data)
				resolve(data);
			else
				resolve(err);
		});
	});
};