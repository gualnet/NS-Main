const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');
const {errorHandler} = require('../lib-js/errorHandler');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

var _userCol = "user";
var _mailCol = "mail";
var _userFpCol = "user";

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
	const re = /^\d{10}$|^\d{9}$/;
	return re.test(String(phone).toLowerCase());
}

function validateGpsCoord(coord) {
	const re = /^\d{1,2}\.\d{1,}$/;
	return re.test(String(coord).toLowerCase());
}


function completePhonePrefix(prefix) {
	var patternPrefix = new RegExp(/^\+/)
	if (patternPrefix.test(prefix)) {
		return prefix
	} else {
		return '+' + prefix;
	}
}

function verifyPhonePrefix(prefix) {
	var pattern = new RegExp(/^\+?[0-9]*/);
	if (pattern.test(prefix))
		return false;
	else
		return true;
}


function verifyPostReq(_req, _res, isUpdate) {
	if (!_req.post.first_name || _req.post.first_name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Prénom requis", "100", "1.0");
		return false;
	}
	if (!_req.post.last_name || _req.post.last_name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de famille requis", "100", "1.0");
		return false;
	}
	if (!_req.post.email || _req.post.email.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Email requis", "100", "1.0");
		return false;
	}
	if (!validateEmail(_req.post.email)) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Email incorrect", "100", "1.0");
		return false;
	}
	// if (!_req.post.phone || _req.post.phone.length < 1) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
	// 	return false;
	// }
	// if (!_req.post.prefix || _req.post.prefix.length < 1) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
	// 	return false;
	// }
	if (_req.post.prefix && verifyPhonePrefix(_req.post.prefix)) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone invalide", "100", "1.0");
		return false;
	}
	// if (!validatePhone(_req.post.phone)) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "téléphone incorrect", "100", "1.0");
	// 	return false;
	// }
	if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "aucun port séléctionné", "100", "1.0");
		return false;
	}
	if (isUpdate == false) {
		if (!_req.post.password || _req.post.password.length < 1) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "aucun mot de passe", "100", "1.0");
			return false;
		}
		if (!_req.post.password_confirm || _req.post.password_confirm.length < 1) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "aucun mot de passe de confirmation", "100", "1.0");
			return false;
		}
		if (_req.post.password != _req.post.password_confirm) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "mot de passe non identiques", "100", "1.0");
			return false;
		}
	}
	// if (!validatePhone(_req.post.phone)) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
	// 	return false;
	// }
	return true;
}

//bdd requests

async function getUserByToken(_token) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_userCol, { token: _token }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function verifyIfExistInUsers(_email, _phone) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_userCol, { email: _email, phone: _phone }, null, function (_err, _data) {
			console.log(_data);
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}


async function createMail(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Create(_mailCol, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getMail() {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_mailCol, {}, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getMailByHarbourAndMail(_harbour_id, _email) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_mailCol, { harbour_id: _harbour_id, email: _email }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getMailByHarbour(_harbour_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_mailCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getAdminById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.FindById(_userFpCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function delMail(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Delete(_mailCol, { id: _id }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

//routes handlers
async function addUserHandler(req, res) {
	try {
		console.log('addUserHandler')
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		console.log('req.post', req.post);
		if (req.post.prefix) {
			req.post.prefix = completePhonePrefix(req.post.prefix);
		}
		if (verifyPostReq(req, res, false)) {
			var user = req.post;
			// const resp = await DB_NS.user.find({ email: user.email }, { raw: 1 });
			const users = await getUsersV2({ email: user.email });
			if (users.length > 0) {
				UTILS.httpUtil.dataError(req, res, "Error", "Email déjà enregistré", "1.0");
				return;
			}
			let userByPhone = [];
			if (user.phone) {
				user.prefixed_phone = user.prefix + user.phone.replace(/^0/, '');
				// const resp = await DB_NS.user.find({ phone: user.phone }, { raw: 1 });
				const users = await getUsersV2({ phone: user.phone });
				if (users.length > 0) {
					UTILS.httpUtil.dataError(req, res, "Error", "Téléphone déjà enregistré", "1.0");
					return;
				}
			}
			delete user.password_confirm;
			user.id = UTILS.UID.generate();
			user.password = UTILS.Crypto.createSHA512(user.id + user.password);
			user.created_at = Date.now();
			user.token = UTILS.Crypto.createSHA512(user.id + user.created_at + user.first_name);
			const createdUser = await createUserV2(user);
			console.log('createdUser',createdUser);
			if (createdUser) {
				UTILS.httpUtil.dataSuccess(req, res, "success, user registered", { id: createdUser.id, harbour_id: createdUser.harbour_id, token: createdUser.token }, "1.0");
				return;
			} else {
				UTILS.httpUtil.dataError(req, res, "Error", "utilisateur non enregistré", "1.0");
				return;
			}
		}
	} catch (error) {
		console.error(error);
		if (error?.cause?.message) {
			UTILS.httpUtil.dataError(req, res, "Error", error.cause.message, "1.0");
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "Internal server error", "1.0");
		}
		
	}
}

async function getUserInfos(_req, _res) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;
	try {
		const { userId, token } = _req.post;

		if (userId || token) {
			const query = {};
			if (userId) {
				query.id = userId;
			} else if (token) {
				query.token = token;
			} else {
				throw new Error('Wrong parameter, please provide a \'user id\' or a \'user token\'.');
			}
			const findUserResp = await DB_NS.user.find(query, { raw: 0 });
			if (findUserResp.error) {
				throw new Error('User not found', { cause: { httpCode: 404 }});
			}
			const users = findUserResp.data;
			if (users[0]) {
				delete users[0].password;
				delete users[0].resetPwdToken;
				UTILS.httpUtil.dataSuccess(_req, _res, "User", users[0], "1.0");
				return;
			}
		}
		UTILS.httpUtil.dataError(_req, _res, "User not found", null, "1.0");
		return;
	} catch (error) {
		errorHandler(_res, error);
	}
}

async function loginHandler(req, res) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	try {
		console.log(`[INFO] User login attempt mail: [${req.post.email}] START`);

		const findUserResp = await DB_NS.user.find({ email: req.post.email }, { raw: 0 });
		if(findUserResp.error) {
			throw new Error(findUserResp.error, { cause: { httpCode: 500 }});
		} else if (findUserResp.data.length < 1) {
			throw new Error('Email ou mot de pass invalide - 1', { cause: { httpCode: 404 }});
		}
		/**@type {TYPES.T_user} */
		const user = findUserResp.data[0];
		const passHash = UTILS.Crypto.createSHA512(user.id + req.post.password);
		if (user.password !== passHash) {
			throw new Error('Email ou mot de pass invalide - 2', { cause: { httpCode: 404 }});
		}

		user.token = UTILS.Crypto.createSHA512(user.id + new Date() + user.first_name);

		const userId = user.id;
		delete user.password_confirm;
		delete user.id;
		delete user.email;

		const updatedUserResp = await DB_NS.user.update({ id: userId }, user, { raw: true });
		if(updatedUserResp.error) {
			throw new Error(updatedUserResp.message, { cause: { httpCode: 500 }});
		} else if (updatedUserResp.data.length < 1) {
			throw new Error('Failed to update reset token', { cause: { httpCode: 404 }});
		}
		const updatedUser = updatedUserResp.data[0];
		console.log(`[INFO] User login attempt mail: [${req.post.email}] SUCCEEDED`);
		res.end(JSON.stringify({
			success: true,
			message: 'success TOTO',
			data: {
				id: updatedUser.id,
				harbour_id: updatedUser.harbour_id,
				token: updatedUser.token
			}
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'usermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

async function userSessionHandler(_req, _res) {
	if (_req.post.token) {
		const user = await getUsersV2({ token: _req.post.token })
		if (user[0]) {
			UTILS.httpUtil.dataSuccess(_req, _res, "Success", "User authentified", null, "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(_req, _res, "Error", "User not authentified", null, "1.0");
			return;
		}
	} else {
		UTILS.httpUtil.dataError(_req, _res, "Error", "User not authentified", null, "1.0");
		return;
	}
}

async function updateUserHandler(_req, _res) {
	console.log(_req.post);
	if (_req.post.prefix) {
		_req.post.prefix = completePhonePrefix(_req.post.prefix);
	}
	if (_req.post.token) {
		const user = await getUsersV2({ token: _req.post.token });
		if (user[0]) {
			user = user[0];
			var update = _req.post;
			update.prefixed_phone = user.prefix || '';
			if (user.phone) {
				update.prefixed_phone += user.phone.replace(/^0/, '');
			}
			update.id = user.id;
			const updatedUsers = await updateUsersV2({ id: update.id }, update);
			UTILS.httpUtil.dataSuccess(_req, _res, "User authentified", null, "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(_req, _res, 'error', "Vous devez créer un compte pour paramétrer votre profil.", null, "1.0");
			return;
		}
	} else {
		UTILS.httpUtil.dataError(_req, _res, "error", "Vous devez créer un compte pour paramétrer votre profil.", null, "1.0");
		return;
	}
}


async function createMailHandler(_req, _res) {
	console.log(_req);
	var admin = await getAdminById(_req.userCookie.data.id);
	var _type = admin.data.split('|')[0];
	var _entity_id = admin.data.split('|')[1];
	var _harbour_id = admin.data.split('|')[2];

	if (_type == 'harbour_manager') {
		_req.post.harbour_id = _harbour_id;
	}

	var mailsArray = _req.post.csvmails.replace(/\n/g, '').split('\r');
	console.log(mailsArray);
	var mailsJson = {};
	for (var i = 1; i < mailsArray.length; i++) {
		STORE.db.linkdb.Create(_mailCol, { email: mailsArray[i], harbour_id: _req.post.harbour_id }, function (_err, _data) {
			if (!_data) {
				UTILS.httpUtil.dataError(_req, _res, "error", _err, null, "1.0");
				return;
			}
		})
	}
	UTILS.httpUtil.dataSuccess(_req, _res, "success", "mails added", null, '1.0');
	return;
}


async function verifyMailHandler(_req, _res) {
	var mails = await getMailByHarbour(_req.post.harbour_id);
	console.log(mails);
	if (mails.length > 0) {
		var mail = await getMailByHarbourAndMail(_req.post.harbour_id, _req.post.email);
		console.log(mail);
		if (mail[0]) {
			UTILS.httpUtil.dataSuccess(_req, _res, "success", "No mail in base required", null, '1.0');
			return;
		} else {
			UTILS.httpUtil.dataError(_req, _res, "error", "Vous n'êtes pas dans la base mail du port.", null, "1.0");
			return;
		}
	} else {
		UTILS.httpUtil.dataSuccess(_req, _res, "success", "No mail in base required", null, '1.0');
		return;
	}
}


async function updateMailHandler(_req, _res) {
	if (typeof (await updateMail(req.post)) != "string") {
		UTILS.httpUtil.dataSuccess(req, res, "Utilisateur mis à jour", "1.0");
		return;
	} else {
		UTILS.httpUtil.dataError(_req, _res, "error", "error while insterting in database", null, "1.0");
		return;
	}
}

async function verifyUserFormHandler(_req, _res) {
	if (verifyPostReq(_req.data)) {
		UTILS.httpUtil.dataSuccess(_req, _res, 'success', 'no error in form data', '1.0');
		return;
	}
}

/**
 * 
 * @param {string} role 
 * @returns {Array<string>} 
 */
const generateRoleOptions = (role) => {
	const options = []
	const ROLES_APP = ENUM.rolesMobileApp;
	const ROLES_BACK = ENUM.rolesBackOffice;
	if (role === ROLES_BACK.VISITEUR) { // not supposed to access to the module
		options.push(`<option value="VISITEUR">${ROLES_APP.VISITEUR}</option>`);
	} else if (role === ROLES_BACK.PLAISANCIER) {// not supposed to access to the module
		options.push(`<option value="PLAISANCIER">${ROLES_APP.PLAISANCIER}</option>`);
	} else if (role === ROLES_BACK.AGENT_CAPITAINERIE) {
		options.push(`<option value="VISITEUR">${ROLES_APP.VISITEUR}</option>`);
		options.push(`<option value="PLAISANCIER">${ROLES_APP.PLAISANCIER}</option>`);
	} else if (role === ROLES_BACK.AGENT_ADMINISTRATEUR) {
		options.push(`<option value="VISITEUR">${ROLES_APP.VISITEUR}</option>`);
		options.push(`<option value="PLAISANCIER">${ROLES_APP.PLAISANCIER}</option>`);
		options.push(`<option value="AGENT_CAPITAINERIE">${ROLES_APP.CAPITAINERIE}</option>`);
		options.push(`<option value="AGENT_ADMINISTRATEUR">${ROLES_APP.AGENT_SECURITE}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.SUPERVISEUR}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.PROFESSIONNEL}</option>`);
	} else if (role === ROLES_BACK.AGENT_SUPERVISEUR) {
		options.push(`<option value="VISITEUR">${ROLES_APP.VISITEUR}</option>`);
		options.push(`<option value="PLAISANCIER">${ROLES_APP.PLAISANCIER}</option>`);
		options.push(`<option value="AGENT_CAPITAINERIE">${ROLES_APP.CAPITAINERIE}</option>`);
		options.push(`<option value="AGENT_ADMINISTRATEUR">${ROLES_APP.AGENT_SECURITE}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.SUPERVISEUR}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.PROFESSIONNEL}</option>`);
		options.push(`<option value="SUPER_ADMIN">${ROLES_APP.ADMINISTRATEUR}</option>`);
	} else if (role === ROLES_BACK.ADMIN_MULTIPORTS) {
		options.push(`<option value="VISITEUR">${ROLES_APP.VISITEUR}</option>`);
		options.push(`<option value="PLAISANCIER">${ROLES_APP.PLAISANCIER}</option>`);
		options.push(`<option value="AGENT_CAPITAINERIE">${ROLES_APP.CAPITAINERIE}</option>`);
		options.push(`<option value="AGENT_ADMINISTRATEUR">${ROLES_APP.AGENT_SECURITE}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.SUPERVISEUR}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.PROFESSIONNEL}</option>`);
		options.push(`<option value="SUPER_ADMIN">${ROLES_APP.ADMINISTRATEUR}</option>`);
	} else if (role === ROLES_BACK.SUPER_ADMIN) {
		options.push(`<option value="VISITEUR">${ROLES_APP.VISITEUR}</option>`);
		options.push(`<option value="PLAISANCIER">${ROLES_APP.PLAISANCIER}</option>`);
		options.push(`<option value="AGENT_CAPITAINERIE">${ROLES_APP.CAPITAINERIE}</option>`);
		options.push(`<option value="AGENT_ADMINISTRATEUR">${ROLES_APP.AGENT_SECURITE}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.SUPERVISEUR}</option>`);
		options.push(`<option value="AGENT_SUPERVISEUR">${ROLES_APP.PROFESSIONNEL}</option>`);
		options.push(`<option value="SUPER_ADMIN">${ROLES_APP.ADMINISTRATEUR}</option>`);
		options.push(`<option value="SUPER_ADMIN">${ROLES_APP.SUPER_ADMIN}</option>`);
	}
	else if (role === 'admin') { // old role
		options.push(`<option value="VISITEUR">${ROLES.VISITEUR}</option>`)
		options.push(`<option value="PLAISANCIER">${ROLES.PLAISANCIER}</option>`)
		options.push(`<option value="AGENT_ADMINISTRATEUR">${ROLES.AGENT_ADMINISTRATEUR}</option>`)
	}
	return (options);
}


const resetPasswordRequestHandler = async (req, res) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	try {
		console.log(`[INFO] Reset password request for email [${req.get.email}]`);
		// GET USER INFO
		const findUserResp = await DB_NS.user.find({ email: req.get.email }, { raw: 1 });
		if (findUserResp.error || findUserResp.data.length < 1) {
			throw new Error('No User Found !', {
				cause: {
					request: req.get,
					httpCode: 404,
					message: 'Ressource not found',
					description: 'This user doesn\'t exists'
				}
			});
		}
		/**@type {TYPES.T_user} */
		const user = findUserResp.data[0];

		// GENERATE A RESET TOKEN
		const tokenLength = 24;
		const resetToken = crypto.randomBytes(tokenLength).toString('hex');
		user.resetPwdToken = resetToken;
		user.updated_at = Date.now();

		const userId = user.id;
		delete user.id;
		const updateUserResp = await DB_NS.user.update({ id: userId }, user, { raw: 1 });
		if (updateUserResp.error || updateUserResp.data.length < 1) {
			console.error('[ERROR]', updateUserResp);
			throw new Error('Failed to update user !', {
				cause: {
					request: req.get,
					httpCode: 404,
					message: 'User not updated',
					description: 'This user doesn\'t exists'
				}
			});
		}

		// SEND RESET E-MAIL
		let emailTemplate = fs.readFileSync(path.join(__dirname, "resetPasswordEmail.html")).toString();
		emailTemplate = emailTemplate
			.replace('__USER_FIRST_NAME__', `${user.last_name} ${user.first_name}`)
			.replace('__HREF_LINK__', `${OPTION.HOST_BASE_URL}/pwd-recover/?token=${user.resetPwdToken}`)
		const mailerResponse = STORE.mailjet.sendMailRaw(
			{ email: OPTION.MAILJET_SENDER_EMAIL, name: 'Nauticspot' },
			{ email: user.email, name: user.first_name },
			{ subject: 'Récupération du mot de passe', HTMLPart: emailTemplate }
		);

		console.log(`[INFO] Reset password request SUCCEED for email [${req.get.email}]`);
		res.end(JSON.stringify({ message: 'success' }));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'usermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const setNewPasswordHandler = async (req, res) => {
	console.log(`[INFO] Set new password request for reset token [${req.post.recoveryToken}] STARTED`);
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const token = req.post.recoveryToken;
		const password = req.post.newPassword;

		const findUserResp = await DB_NS.user.find({ resetPwdToken: token }, { raw: true });
		if(findUserResp.error) {
			throw new Error(findUserResp.error, { cause: { httpCode: 500 }});
		} else if (findUserResp.data.length < 1) {
			throw new Error('Invalid token', { cause: { httpCode: 404 }});
		}
		const user = findUserResp.data[0];
		const newPasswordHash = UTILS.Crypto.createSHA512(user.id + password);

		user.password = newPasswordHash;
		user.resetPwdToken = null;
		const userId = user.id;
		delete user.id;
		const updatedUser = await DB_NS.user.update({ id: userId}, user, { raw: true });
		if(updatedUser.error) {
			throw new Error(updatedUser.error, { cause: { httpCode: 500 }});
		} else if (updatedUser.data.length < 1) {
			throw new Error('No user updated', { cause: { httpCode: 404 }});
		}
		console.log(`[INFO] Set new password request for reset token [${req.post.recoveryToken}] SUCEEDED`);
		res.end(JSON.stringify({
			success: true,
			message: 'success',
		}))
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'usermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const autoDeleteUserAccount = async (req, res) => {
	try {
		const authToken = req.headers['token'];

		/** @type {Array<TYPES.T_user>} */
		// const [user] = await STORE.API_NEXT.getElements('user', { token: authToken });
		const [user] = await getUsersV2({ token: authToken });
		if (!user) {
			res.writeHead(401, 'Unauthorized', { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				success: false,
				message: 'Invalid user token'
			}));
			return;
		}

		/** @type {Array<TYPES.T_boat>} */
		const deletedBoats = await STORE.API_NEXT.deleteElement('boat', { user_id: user.id });
		/** @type {Array<TYPES.T_absence>} */
		const deletedAbsences = await STORE.absencemgmt.deleteAbsence({ user_id: user.id });
		/** @type {Array<TYPES.T_user>} */
		const deletedUser = await deleteUserV2({ id: user.id });

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			deletedUser,
			deletedAbsences,
			deletedBoats,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'usermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const getUserSecure = async (req, res) => {
	console.log('====getUserSecure====')
	try {
		const userToken = req.headers.authorization;
		console.log('userToken', userToken);
		const harbourId = req.get.harbour_id
		console.log('harbourId', harbourId);
		
		const users = await getUsersV2({ harbour_id: harbourId });
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: users.length,
			users: users,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'usermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

async function getUserById(_id) {
	return getUsersV2({ id: _id });
}

/**
 * 
 * @param {Pick<TYPES.T_user, "id"|"boat_id"|"harbour_id"|"email"|"roleMobileApp"|"username"|"token">} where 
 * @returns {Promise<TYPES.T_user[]>}
 */
const getUsersV2 = async (where = {}) => {
	console.log('====getUsersV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Search users where: ', where);
	const findUsersResp = await DB_NS.user.find(where, { raw: 0 });
	if (findUsersResp.error) {
		throw new Error(findUsersResp.message, { cause: findUsersResp });
	}
	const users = findUsersResp.data;
	console.log(`Found ${users.length} user(s) items`);
	return users;
};

/**
 * 
 * @param {TYPES.T_user} user 
 * @returns {}
 */
const createUserV2 = async (user = {}) => {
	console.log('====createUserV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createUserResp = await DB_NS.user.create(user);
	if (createUserResp.error) {
		throw new Error(createUserResp.message, { cause: createUserResp });
	}
	const users = createUserResp.data;
	console.log(`Created ${users.length} user:\n`. users);
	return users;
};

/**
 * 
 * @param {Pick<TYPES.T_user, "id"|"boat_id"|"harbour_id"|"email"|"roleMobileApp"|"username">} where 
 * @param {Partial<TYPES.T_user>} updates 
 * @returns {Promise<TYPES.T_user[]>}
 */
const updateUsersV2 = async (where, updates) => {
	console.log('====updateUsersV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update users where: ', where);
	console.log('Update users with: ', updates);
	const updateUsersResp = await DB_NS.user.update(where, updates);
	if (updateUsersResp.error) {
		throw new Error(updateUsersResp.message, { cause: updateUsersResp });
	}
	const users = updateUsersResp.data;
	console.log(`${users.length} user(s) Updated`);
	return users;
};

/**
 * 
 * @param {Pick<TYPES.T_user, "id">} where 
 * @returns {Promise<TYPES.T_user[]>}
 */
const deleteUserV2 = async (where = {}) => {
	console.log('====deleteUserV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte user where: ', where);
	const deleteUsersResp = await DB_NS.user.delete(where, { raw: 0 });
	console.log('deleteUsersResp',deleteUsersResp)
	if (deleteUsersResp.error) {
		throw new Error(deleteUsersResp.message, { cause: deleteUsersResp });
	}
	const users = deleteUsersResp.data;
	console.log(`Deleted ${users.length} user(s) items`, users);
	return users;
};



exports.router =
	[
		{
			on: true,
			route: "/api/adduser",
			handler: addUserHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/updateuser",
			handler: updateUserHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/login",
			handler: loginHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/user/session",
			handler: userSessionHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/getuser",
			handler: getUserInfos,
			method: "POST",
		},
		{
			on: true,
			route: "/api/verify/user/form",
			handler: verifyUserFormHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/create/mail",
			handler: createMailHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/verify/mail",
			handler: verifyMailHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/update/mail",
			handler: updateMailHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/user/reset-pwd",
			handler: resetPasswordRequestHandler,
			method: "GET",
		},
		{
			on: true,
			route: "/api/user/reset-pwd",
			handler: setNewPasswordHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/users/delete-my-account",
			handler: autoDeleteUserAccount,
			method: "DELETE",
		},
		{
			on: true,
			route: "/api/users/",
			handler: getUserSecure,
			method: "GET",
		}
	];


exports.handler = async (req, res) => {
	var _user = await getUsersV2();
	res.end(JSON.stringify(_user));
	return;
}

exports.plugin =
{
	title: "Gestion des utilisateurs",
	desc: "",
	handler: async (req, res) => {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;


		console.log('==== usermgmt handler ====')
		console.log('req.get', req.get)
		console.log('req.post', req.post)
		const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: true });
		if (findAdminResp.error) {
			console.error(findAdminResp.error);
			res.writeHead(500);
			res.end('Internal Error');
			return;
		} else if (findAdminResp.data.length < 1) {
			console.error('No dashboard user found');
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}
		const admin = findAdminResp.data[0];
		var _type = admin.data.type;
		var _role = admin.role;
		var _entity_id = admin.data.entity_id;
		var _harbour_id = admin.data.harbour_id;

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}
		if (_entity_id === 'SlEgXL3EGoi') { // No Access for Marigot users
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.user_id) {
				await deleteUserV2({ id: req.get.user_id });
			} else if (req.get.mode && req.get.mode == "delete" && req.get.mail_id) {
				//! unused ?
				await delMail(req.get.mail_id);
			}

		}
		if (req.method == "POST") {
			if (req.post.id) {
				if (req.post.password) {
					// handle password change
					req.post.password = UTILS.Crypto.createSHA512(req.post.id + req.post.password);
				}
				try {
					const userUpdates = { ...req.post };
					delete userUpdates.id;
					const updatedUser = await updateUsersV2({ id: req.post.id }, userUpdates);
					console.log('updatedUser',updatedUser);
					UTILS.httpUtil.dataSuccess(req, res, "Mail mis à jour", "1.0");
					return;
				} catch (error) {
					console.log('Error', error)
					UTILS.httpUtil.dataError(req, res, error, 'Erreur lors de la mise a jour de l\'utilisateur', "1.0");
				}
			} else if (req.post.type === 'mail') {
				if (_type == 'harbour_manager') {
					req.post.harbour_id = _harbour_id;
				}

				var mailsArray = req.post.csvmails?.replace(/\n/g, '')?.split('\r');
				var mailsJson = {};
				for (var i = 1; i < mailsArray.length; i++) {
					STORE.db.linkdb.Create(_mailCol, { email: mailsArray[i], harbour_id: req.post.harbour_id }, function (_err, _data) {
						if (!_data) {
							UTILS.httpUtil.dataError(req, res, "error", _err, null, "1.0");
							return;
						}
					})
				}
				UTILS.httpUtil.dataSuccess(req, res, "success", "mails added", null, '1.0');
				return;
			}
		}
		else {
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _userHtml = fs.readFileSync(path.join(__dirname, "user.html")).toString();
			var _mailHtml = fs.readFileSync(path.join(__dirname, "mail.html")).toString();
			/**@type {Array<TYPES.T_user>} */
			var _users = [];
			/**@type {Array<TYPES.T_harbour>} */
			let adminAllHarbours = [];
			if (_role === 'user') {
					const pendingPromises = [];
					_harbour_id.map(harbourId => {
						pendingPromises.push(getUsersV2({ harbour_id: harbourId }));
					});
					const usersArrays = await Promise.all(pendingPromises);
					usersArrays.map(userList => _users.push(...userList));
			} else if (_role === 'admin') {
				const findHarbourResp = await DB_NS.harbour.find({}, { raw: 0 });
				if (findHarbourResp.error) {
					console.error(findUserResp.error);
					res.writeHead(500);
					res.end('Internal Error');
					return;
				}
				adminAllHarbours = findHarbourResp.data;
				const users = await getUsersV2({ harbour_id: adminAllHarbours[0].id });
				_users = users;
				_users = _users.splice(0, 500);
			}
			const roleOptions = generateRoleOptions(admin.data.roleBackOffice);

			var _userGen = "";
			let harboursMapById = await STORE.harbourmgmt.getAllHarboursMappedById();
			for (var i = 0; i < _users.length; i++) {
				let optionsStr = roleOptions.join('');
				if (_users[i]?.roleMobileApp) {
					optionsStr = optionsStr.replace(`<option value="${_users[i].roleMobileApp.toUpperCase()}">`, `<option value="${_users[i].roleMobileApp.toUpperCase()}" selected>`);
				} else {
					optionsStr = '<option value="" selected> - - </option>' + optionsStr;
				}

				if (_users[i]?.category !== "visitor") {
					const userHarbourId = _users[i]?.harbour_id;
					const currentHarbour = userHarbourId ? harboursMapById[userHarbourId] : undefined;
					let formatedDate = '-';
					if (_users[i].created_at) {
						const dateObj = new Date(_users[i].created_at)
						const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
						const date = splited[0];
						const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
						formatedDate = `${date} à ${heure}`;
					}
					_userGen += _userHtml.replace(/__ID__/g, _users[i]?.id)
					.replace(/__FORMID__/g, _users[i]?.id.replace(/\./g, "_"))
					.replace(/__CATEGORY__/g, _users[i]?.category)
					.replace(/__ROLE_OPTIONS__/g, optionsStr)
					.replace(/__FIRST_NAME__/g, _users[i]?.first_name)
					.replace(/__LAST_NAME__/g, _users[i]?.last_name)
					.replace(/__EMAIL__/g, _users[i]?.email)
					.replace(/__PASSWORD__/g, '')
					.replace(/__PHONE__/g, _users[i]?.prefixed_phone)
					.replace(/__DATETIMEORDER__/g, _users[i]?.created_at)
					.replace(/__DATE__/g, formatedDate)
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id)
					.replace(/__CONTRACT_NUMBER__/g, _users[i]?.contract_number)
					.replace(/__IS_RESIDENT__/g, _users[i]?.is_resident)
				}
			}
			var _mails = [];

			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_mails = _mails.concat(await getUsersV2({ harbour_id: _harbour_id[i] }));
				}
			}
			else if (_role == "admin") {
				// don't know what it is used for ?
				// place holder for functionality, but not really used by anyone
				_mails = await getMail();
			}

			var _mailGen = "";
			for (var i = 0; i < _mails.length; i++) {
				const mailHarbourId = _mails[i]?.harbour_id;
				const currentHarbour = (mailHarbourId) ? harboursMapById[mailHarbourId] : undefined;
				_mailGen += _mailHtml.replace(/__ID__/g, _mails[i]?.id)
					.replace(/__FORMID__/g, _mails[i]?.id.replace(/\./g, "_"))
					.replace(/__EMAIL__/g, _mails[i]?.email)
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id)
			}

			_indexHtml = _indexHtml.replace("__USERS__", _userGen);
			_indexHtml = _indexHtml.replace("__MAILS__", _mailGen).replace(/undefined/g, '');

			var userHarbours = [];
			var harbour_select;
			console.log('_harbour_id',_harbour_id)
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				for (var i = 0; i < _harbour_id.length; i++) {
					const currentHarbour = (_harbour_id[i]) ? harboursMapById[_harbour_id[i]] : undefined;
					console.log('currentHarbour',currentHarbour)
					harbour_select += '<option value="' + currentHarbour?.id + '">' + currentHarbour?.name + '</option>';
				}
				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id" id="selectHarbour">';
				for (var i = 0; i < adminAllHarbours.length; i++) {
					harbour_select += '<option value="' + adminAllHarbours[i].id + '">' + adminAllHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			}
			_indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);
			_indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT_1__', harbour_select.replace('selectHarbour', 'selectHarbourUser'));


			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}
exports.store =
{
	getUsers: getUsersV2,
	getUserById: getUserById, // wrapper for getUsersV2
	getUserByToken: getUserByToken,
}
