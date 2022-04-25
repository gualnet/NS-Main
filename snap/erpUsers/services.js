require('../../types');
const crypto = require('crypto');

const ERP_USER_TABLE = 'erp-users';

/**
 * Not shared yet
 * @param {number} tokenLength - token length in bits
 * @returns {string} token
 */
function generateApiErpToken(tokenLength = 32) {
	const token = crypto.randomBytes(tokenLength).toString('hex');
	console.log('New token', token)
	return (token);
};



/**
 * 
 * @param {T_erpUser} whereOptions 
 * @returns {Promise<Array<T_erpUser>}
 */
async function getErpUserWhere(whereOptions) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Find(ERP_USER_TABLE, whereOptions, null, function (err, data) {
			if (data)
				resolve(data);
			else
				reject(err);
		});
	});
};

/**
 * 
 * @param {T_erpUser} erpUser 
 * @returns {Promise<Array<T_erpUser>>}
 */
async function createErpUser(erpUser) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Create(ERP_USER_TABLE, erpUser, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
};

/**
 * 
 * @param {T_erpUser} updateFields 
 * @param {T_erpUser} whereOptions 
 * @returns {Promise<Array<T_erpUser>>}
 */
async function updateErpUserWhere(updateFields, whereOptions) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Update(ERP_USER_TABLE, whereOptions, updateFields, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
};

/**
 * 
 * @param {T_erpUser} whereOptions 
 * @returns {Promise<Array<T_erpUser>>}
 */
async function deleteErpUserWhere(whereOptions) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Delete(ERP_USER_TABLE, whereOptions, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
}

module.exports = {
	getErpUserWhere,
	createErpUser,
	updateErpUserWhere,
	deleteErpUserWhere,
	generateApiErpToken,
}
