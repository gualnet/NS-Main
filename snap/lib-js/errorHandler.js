const myLogger = require('./myLogger');

/**
 * 
 * @param {*} res 
 * @param {{cause: {httpCode: number, publicMsg: string}}} error 
 */
const errorHandler = (res, error) => {
	console.error('[ERROR]', error);
	const errorHttpCode = error.cause?.httpCode || 500;
	const publicError = error.cause?.publicMsg || 'Internal Server Error';
	myLogger.logError(error, { module: 'usermgmt' })
	res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({
		success: false,
		error: publicError || error.toString(),
	}));
};

module.exports = {
  errorHandler,
};