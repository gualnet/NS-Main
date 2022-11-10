const fs = require('fs');

/**
 * 
 * @param {*} error 
 * @param {logErrorOptions} options 
 */
function logError(error, options) {

	const FILE_NAME = `log_error_${new Date().toLocaleDateString()}.txt`;
	// console.log('FILE_NAME', FILE_NAME);
	const dir = __dirname.split('/').slice(0,-1).join('/');
	const FILE_PATH = `${dir}/${FILE_NAME}`;
	// console.log('FILE_PATH', FILE_PATH);


	const msg = `- ERROR [${new Date().toLocaleString('fr-FR')}] [${options.module}]\n => [${error.stack || error}]\n\n`;
	// fs.appendFileSync(FILE_PATH, msg);
	fs.appendFileSync(FILE_PATH, msg, { flag: 'as'});
};

module.exports = {
	logError,
}

/**
 * @typedef logErrorOptions
 * @property {string} module - origin snap name
 * 
 */