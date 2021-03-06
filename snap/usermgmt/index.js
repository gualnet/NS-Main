const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');

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
async function getUserById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.FindById(_userCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getUser() {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_userCol, {}, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getUserByHarbourId(_harbour_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_userCol, { harbourid: _harbour_id }, null, function (_err, _data) {
			if (_data) {
				resolve(_data);
			}
			else {
				resolve(_err);
			}
		});
	});
}
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

async function findByColl(_request) {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_userCol, _request, null, function (_err, _data) {
			console.log(_data);
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function delUser(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Delete(_userCol, { id: _id }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function createUser(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Create(_userCol, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

/**
 * @param {TYPES.T_user} _obj 
 * @returns {Promise<Array<TYPES.T_user>>}
 */
async function updateUser(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Update(_userCol, { id: _obj.id }, _obj, function (_err, _data) {
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

async function getUserById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.FindById(_userCol, _id, null, function (_err, _data) {
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
	if (req.post.prefix) {
		req.post.prefix = completePhonePrefix(req.post.prefix);
	}
	if (verifyPostReq(req, res, false)) {
		var user = req.post;

		var userByEmail = await findByColl({ email: user.email });
		let userByPhone = [];
		if (user.phone) {
			user.prefixed_phone = user.prefix + user.phone.replace(/^0/, '');
			userByPhone = await findByColl({ phone: user.phone });
		}
		if (userByEmail[0] || userByPhone[0]) {
			UTILS.httpUtil.dataError(req, res, "Error", "Email ou téléphone déjà enregistré", "1.0");
			return;
		} else {
			delete user.password_confirm;
			user.id = UTILS.UID.generate();
			user.password = UTILS.Crypto.createSHA512(user.id + user.password);
			user.created_at = Date.now();
			user.token = UTILS.Crypto.createSHA512(user.id + user.created_at + user.first_name);
			const rawUser = {
				boat_id: null,
				category: null,
				contract_number: null,
				created_at: null,
				email: null,
				enabled: true,
				first_name: null,
				harbour_id: null,
				id: null,
				last_name: null,
				onesignal_userid: null,
				password: null,
				phone: null,
				prefix: null,
				prefixed_phone: null,
				resetPwdToken: null,
				roleMobileApp: null,
				show_communication_module: true,
				show_reporting_module: true,
				show_security_module: true,
				token: null,
				updated_at: null,
				username: null,
			};
			const newUser = { ...rawUser, ...user };
			const createdUser = await createUser(newUser);
			if (createdUser) {
				UTILS.httpUtil.dataSuccess(req, res, "success, user registered", { id: createdUser.id, harbour_id: createdUser.harbour_id, token: createdUser.token }, "1.0");
				return;
			}
			else {
				UTILS.httpUtil.dataError(req, res, "Error", "utilisateur non enregistré", "1.0");
				return;
			}
		}
	}
}

async function getUserInfos(_req, _res) {
	if (_req.post.token) {
		var user = await findByColl({ "token": _req.post.token })
		if (user[0]) {
			delete user[0].password;
			delete user[0].resetPwdToken;
			UTILS.httpUtil.dataSuccess(_req, _res, "User", user[0], "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(_req, _res, "User not found", null, "1.0");
			return;
		}
	}
}

async function loginHandler(req, res) {
	var user = await findByColl({ "email": req.post.email });

	if (user[0]) {
		user = user[0];
		var password = UTILS.Crypto.createSHA512(user.id + req.post.password);
		if (user.password == password) {
			user.token = UTILS.Crypto.createSHA512(user.id + new Date() + user.first_name);
			await updateUser(user);
			UTILS.httpUtil.dataSuccess(req, res, "success, user logged", { id: user.id, harbour_id: user.harbour_id, token: user.token }, "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(req, res, "Erreur", "Identifiants incorrects", null, "1.0");
			return;
		}
	} else {
		UTILS.httpUtil.dataError(req, res, "Erreur", "Identifiants incorrects", null, "1.0");
		return;
	}
}

async function userSessionHandler(_req, _res) {
	if (_req.post.token) {
		var user = await findByColl({ "token": _req.post.token })
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
		var user = await findByColl({ "token": _req.post.token })
		if (user[0]) {
			user = user[0];
			var update = _req.post;
			update.prefixed_phone = user.prefix + user.phone.replace(/^0/, '');
			update.id = user.id;
			const updatedUsers = await updateUser(update);
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

/**
 * 
 * @param {*} whereOpt 
 * @returns {Promise<Array<TYPES.T_user>>}
 */
const getUserWhere = async (whereOpt) => {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Find(_userCol, whereOpt, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
}


const resetPasswordRequestHandler = async (req, res) => {
	try {
		// GET USER INFO
		const [user] = await getUserWhere({ email: req.get.email });
		if (!user) { // no user found
			res.writeHead(404);
			res.end(JSON.stringify({
				message: 'Ressource not found',
				description: 'This user doesn\'t exists'
			}));
			return;
		}

		// GENERATE A RESET TOKEN
		const tokenLength = 24;
		const resetToken = crypto.randomBytes(tokenLength).toString('hex');
		user.resetPwdToken = resetToken;
		user.updated_at = Date.now();
		const userUpdated = await updateUser(user);
		console.log('userUpdated',userUpdated);

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

		res.end(JSON.stringify({ message: 'success' }));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({ success: false }));
	}
};

const setNewPasswordHandler = async (req, res) => {
	try {
		const token = req.post.recoveryToken;
		const password = req.post.newPassword;

		const [user] = await getUserWhere({resetPwdToken: token});
		if(!user) {
			res.writeHead(404);
			res.end(JSON.stringify({
				success: false,
				message: 'Ressource not found',
				description: 'This token is invalid',
			}));
			return;
		}
		const newPasswordHash = UTILS.Crypto.createSHA512(user.id + password);

		user.password = newPasswordHash;
		user.resetPwdToken = null;
		const updatedUser = await updateUser(user);

		res.end(JSON.stringify({
			success: true,
			message: 'success',
		}))
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end(JSON.stringify({ success: false }));
	}
};

const autoDeleteUserAccount = async (req, res) => {
	try {
		const authToken = req.headers['token'];

		/** @type {Array<TYPES.T_user>} */
		const [user] = await STORE.API_NEXT.getElements('user', { token: authToken });
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
		const deletedAbsences = await STORE.API_NEXT.deleteElement('absences', { user_id: user.id });
		/** @type {Array<TYPES.T_user>} */
		const deletedUser = await STORE.API_NEXT.deleteElement('user', { id: user.id });

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			deletedUser,
			deletedAbsences,
			deletedBoats,
		}));
	} catch (error) {
		console.error('[ERROR]', error)
		res.writeHead(500, 'Internal Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ success: false }));
	}
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
		}
	];


exports.handler = async (req, res) => {
	var _user = await getUser();
	res.end(JSON.stringify(_user));
	return;
}

exports.plugin =
{
	title: "Gestion des utilisateurs",
	desc: "",
	handler: async (req, res) => {
		var admin = await getAdminById(req.userCookie.data.id);
		var _type = admin.data.type;
		var _role = admin.role;
		var _entity_id = admin.data.entity_id;
		var _harbour_id = admin.data.harbour_id;

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('No access rights');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.user_id) {
				await delUser(req.get.user_id);
			} else if (req.get.mode && req.get.mode == "delete" && req.get.mail_id) {
				await delMail(req.get.mail_id);
			}
			else if (req.get.user_id) {
				await getUserById(req.get.user_id);
			}
			else if (req.get.userlist) {
				var userlist = await getUser();
				UTILS.httpUtil.dataSuccess(req, res, userlist, "1.0");
				return;
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				if (typeof (await updateUser(req.post)) != "string") {
					UTILS.httpUtil.dataSuccess(req, res, "Mail mis à jour", "1.0");
					return;
				}
			} else if (req.post.type = 'mail') {
				if (_type == 'harbour_manager') {
					req.post.harbour_id = _harbour_id;
				}

				var mailsArray = req.post.csvmails.replace(/\n/g, '').split('\r');
				console.log(mailsArray);
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
			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_users = _users.concat(await STORE.API_NEXT.getElements('user', { harbour_id: _harbour_id[i]}));
				}
			}
			else if (_role == "admin") {
				_users = await getUser();
			}
			const roleOptions = generateRoleOptions(_role);

			var _userGen = "";
			for (var i = 0; i < _users.length; i++) {
				let optionsStr = roleOptions.join('');
				if (_users[i]?.roleMobileApp) {
					optionsStr = optionsStr.replace(`<option value="${_users[i].roleMobileApp.toUpperCase()}">`, `<option value="${_users[i].roleMobileApp.toUpperCase()}" selected>`);
				} else {
					optionsStr = '<option value="" selected> - - </option>' + optionsStr;
				}

				if (_users[i]?.category !== "visitor") {
					var currentHarbour = await STORE.harbourmgmt.getHarbourById(_users[i]?.harbour_id);

					let formatedDate = '-';
					if (_users[i].created_at) {
						const dateObj = new Date(_users[i].created_at)
						const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
						const date = splited[0];
						const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
						formatedDate = `${date} à ${heure}`;
					}
					_userGen += _userHtml.replace(/__ID__/g, _users[i].id)
					.replace(/__FORMID__/g, _users[i].id.replace(/\./g, "_"))
					.replace(/__CATEGORY__/g, _users[i].category)
					.replace(/__ROLE_OPTIONS__/g, optionsStr)
					.replace(/__FIRST_NAME__/g, _users[i].first_name)
					.replace(/__LAST_NAME__/g, _users[i].last_name)
					.replace(/__EMAIL__/g, _users[i].email)
					.replace(/__PHONE__/g, _users[i].prefixed_phone)
					.replace(/__DATETIMEORDER__/g, _users[i].created_at)
					.replace(/__DATE__/g, formatedDate)
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour.id)
					.replace(/__CONTRACT_NUMBER__/g, _users[i].contract_number)
					.replace(/__IS_RESIDENT__/g, _users[i].is_resident)
				}
			}
			var _mails = [];

			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_mails = _mails.concat(await getUserByHarbourId(_harbour_id[i]));
				}
			}
			else if (_role == "admin")
				_mails = await getMail();

			var _mailGen = "";
			for (var i = 0; i < _mails.length; i++) {
				var currentHarbour = await STORE.harbourmgmt.getHarbourById(_mails[i].harbour_id);
				_mailGen += _mailHtml.replace(/__ID__/g, _mails[i].id)
					.replace(/__FORMID__/g, _mails[i].id.replace(/\./g, "_"))
					.replace(/__EMAIL__/g, _mails[i].email)
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour.id)
			}

			_indexHtml = _indexHtml.replace("__USERS__", _userGen);
			_indexHtml = _indexHtml.replace("__MAILS__", _mailGen).replace(/undefined/g, '');

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				for (var i = 0; i < _harbour_id.length; i++) {
					userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
					harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				userHarbours = await STORE.harbourmgmt.getHarbour();
				for (var i = 0; i < userHarbours.length; i++) {
					harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			}
			_indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);


			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}
exports.store =
{
	getUserById: getUserById,
	getUserByToken: getUserByToken,
}
