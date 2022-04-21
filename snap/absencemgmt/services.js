
console.log('LOAD SERVICES FILE')

/**
 * Not implemented
 */
function generateApiErpToken() {
  throw new Error('generateApiErpToken NOT IMPLEMENTED');
};


/**
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
async function checkApiErpTokenValidity(token) {
  console.log('CALL checkApiErpTokenValidity', token);

    const ret = await getHarbourWhere({ apiErpToken: token });
    console.log('ret', ret, );
    if (!ret[0]) {
      return(false);
    }
    return(true);
};

module.exports = {
  checkApiErpTokenValidity,
  generateApiErpToken,
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
 * @returns 
 */
async function getHarbourWhere(whereOptions) {
  console.log('CALL getHarbourWhere', whereOptions)
	return new Promise(resolve => {
		STORE.db.linkdb.FindById('harbour', whereOptions, null, function (err, data) {
      console.log('data',data)
			if (data)
				resolve(data);
			else
				resolve(err);
		});
	});
};