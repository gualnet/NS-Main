
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


module.exports = {
	getHarbourWhere,
};