const TYPES = require('../../types');
const TYPES_ADMIN = require('./adminmgmt.types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

//gestion des admin gestionnaire de ports

//set datatable cols
var _userCol = "user";
var _harbourCol = "harbour";
var _entityCol = "entity";

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
	const re = /^\d{10}$|^\d{9}$/;
	return re.test(String(phone).toLowerCase());
}

function verifyPostReq(_req, _res) {
	if (!_req.post.name || _req.post.name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de l'entité", "100", "1.0");
		return false;
	}
	return true;
}

//db functions <
/**
 * 
 * @param {TYPES.T_userFP['id']} _id 
 * @returns {Promise<TYPES.T_userFP>}
 */
async function getAdminById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.FindById(_userCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

/**
 * Return users with the role 'user' from FP database 
 * @returns {Promise<Array<TYPES.T_userFP>>}
 */
async function getAdmin() {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Find(_userCol, { role: "user" }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function getAdminByLogin(_login) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Find(_userCol, { login: _login }, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function delAdmin(_id) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Delete(_userCol, { id: _id }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function createAdmin(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Create(_userCol, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function updateAdmin(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Update(_userCol, { id: _obj.id }, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function updateAdminData(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Update(_userCol, { id: _obj.id }, { data: _obj.data }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function getEntity() {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_entityCol, {}, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function getEntityById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.FindById(_entityCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function getHarbour() {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_harbourCol, {}, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
async function getHarbourById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.FindById(_harbourCol, _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
// >


async function getAdminByIdHandler(_req, _res) {
	var admin = await getAdminById(_req.param.admin_id);
	console.log(admin);
	if (admin.id) {
		UTILS.httpUtil.dataSuccess(_req, _res, "success", admin, "1.0");
		return;
	} else {
		UTILS.httpUtil.dataError(_req, _res, "error", "admin not found", "1.0");
		return;
	}
}

// NEXT
/**
 * 
 * @param {string} role 
 */
function generateRoleOptions(role) {
	if (!role) throw (new Error('Role not defined...'));

	const ROLES = ENUM.rolesBackOffice;

	const options = [];
	if (role === ROLES.VISITEUR) {
		options.push(`<option value="${ROLES.VISITEUR}">${ROLES.VISITEUR}</option>`);
	} else if (role === ROLES.PLAISANCIER) {
		options.push(`<option value="${ROLES.PLAISANCIER}">${ROLES.PLAISANCIER}</option>`);
	} else if (role === ROLES.AGENT_CAPITAINERIE) {
		options.push(`<option value="${ROLES.VISITEUR}">${ROLES.VISITEUR}</option>`);
		options.push(`<option value="${ROLES.PLAISANCIER}">${ROLES.PLAISANCIER}</option>`);
	} else if (role === ROLES.AGENT_ADMINISTRATEUR) {
		options.push(`<option value="${ROLES.VISITEUR}">${ROLES.VISITEUR}</option>`);
		options.push(`<option value="${ROLES.PLAISANCIER}">${ROLES.PLAISANCIER}</option>`);
		options.push(`<option value="${ROLES.AGENT_CAPITAINERIE}">${ROLES.AGENT_CAPITAINERIE}</option>`);
		options.push(`<option value="${ROLES.AGENT_ADMINISTRATEUR}">${ROLES.AGENT_ADMINISTRATEUR}</option>`);
	} else if (role === ROLES.AGENT_SUPERVISEUR) {
		options.push(`<option value="${ROLES.VISITEUR}">${ROLES.VISITEUR}</option>`);
		options.push(`<option value="${ROLES.PLAISANCIER}">${ROLES.PLAISANCIER}</option>`);
		options.push(`<option value="${ROLES.AGENT_CAPITAINERIE}">${ROLES.AGENT_CAPITAINERIE}</option>`);
		options.push(`<option value="${ROLES.AGENT_ADMINISTRATEUR}">${ROLES.AGENT_ADMINISTRATEUR}</option>`);
		options.push(`<option value="${ROLES.AGENT_SUPERVISEUR}">${ROLES.AGENT_SUPERVISEUR}</option>`);
	} else if (role === ROLES.ADMIN_MULTIPORTS) {
		options.push(`<option value="${ROLES.VISITEUR}">${ROLES.VISITEUR}</option>`);
		options.push(`<option value="${ROLES.PLAISANCIER}">${ROLES.PLAISANCIER}</option>`);
		options.push(`<option value="${ROLES.AGENT_CAPITAINERIE}">${ROLES.AGENT_CAPITAINERIE}</option>`);
		options.push(`<option value="${ROLES.AGENT_ADMINISTRATEUR}">${ROLES.AGENT_ADMINISTRATEUR}</option>`);
		options.push(`<option value="${ROLES.AGENT_SUPERVISEUR}">${ROLES.AGENT_SUPERVISEUR}</option>`);
		options.push(`<option value="${ROLES.ADMIN_MULTIPORTS}">${ROLES.ADMIN_MULTIPORTS}</option>`);
	} else if (role === ROLES.SUPER_ADMIN) {
		options.push(`<option value="${ROLES.VISITEUR}">${ROLES.VISITEUR}</option>`);
		options.push(`<option value="${ROLES.PLAISANCIER}">${ROLES.PLAISANCIER}</option>`);
		options.push(`<option value="${ROLES.AGENT_CAPITAINERIE}">${ROLES.AGENT_CAPITAINERIE}</option>`);
		options.push(`<option value="${ROLES.AGENT_ADMINISTRATEUR}">${ROLES.AGENT_ADMINISTRATEUR}</option>`);
		options.push(`<option value="${ROLES.AGENT_SUPERVISEUR}">${ROLES.AGENT_SUPERVISEUR}</option>`);
		options.push(`<option value="${ROLES.ADMIN_MULTIPORTS}">${ROLES.ADMIN_MULTIPORTS}</option>`);
		options.push(`<option value="${ROLES.SUPER_ADMIN}">${ROLES.SUPER_ADMIN}</option>`);
	}
	return(options);
}


function notImplementedHandler(req, res) {
	res.writeHead(501);
	res.end();
}

/**
 * @param {TYPES_ADMIN.T_getFPUsersOptions} whereOpt - allowed: ['id']
 * @returns {Promise<Array<TYPES.T_userFP>>}
 */
async function getFPUsersWhere(whereOpt) {
	return (new Promise((resolve, reject) => {
		STORE.db.linkdbfp.Find(_userCol, whereOpt, null, (err, data) => {
			if (data)
				resolve(data);
			else
				reject(err);
		})
	}))
};

/**
 * Returns FP users without sensitive data
 * @param {*} req 
 * @param {*} res 
 */
async function getFPUsersSafeHandler(req, res) {
	/**@type {TYPES_ADMIN.T_getFPUsersOptions} */
	const getOptions = {};
	if (req.get.id) getOptions.id = req.get.id;

	try {
		const users = await getFPUsersWhere(getOptions);
		users.map(user => {
			delete user.pw_type;
			delete user.password;
		})
		res.end(JSON.stringify(users));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'adminmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

/**
 * @param {TYPES_ADMIN.T_getFPUsersOptions} whereOpt - allowed: ['id']
 * @param {TYPES.T_userFP} updateObj 
 * @returns {Promise<Array<TYPES.T_userFP>>}
 */
async function updateFPUsersWhere(whereOpt, updateObj) {
	return (new Promise((resolve, reject) => {
		STORE.db.linkdbfp.Update(_userCol, whereOpt, updateObj, (err, data) => {
			if (data)
				resolve(data);
			else
				reject(err);
		})
	}))
};

/**
 * Update FP users without sensitive data
 * @param {*} req 
 * @param {*} res 
 */
async function updateFPUsersSafeHandler(req, res) {
	/**@type {TYPES_ADMIN.T_getFPUsersOptions} */
	const getOptions = {};
	if (req.get.id) getOptions.id = req.get.id;

	/**@type {TYPES_ADMIN.T_getFPUsersOptions} */

	try {
		const updateObj = { ...req.body };
		if (updateObj.password) delete updateObj.password;

		const users = await updateFPUsersWhere(getOptions);
		users.map(user => {
			delete user.pw_type;
			delete user.password;
		})
		console.log('FP Users', users);
		res.end(JSON.stringify(users));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'absencemgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

exports.router = [
	{
		on: true,
		route: "/api/admin/get/:admin_id",
		handler: getAdminByIdHandler,
		method: 'get'
	},

	// API NEXT
	{
		on: true,
		route: "/api/next/fp-users",
		handler: getFPUsersSafeHandler,
		method: 'GET'
	}, {
		on: true,
		route: "/api/next/fp-users",
		handler: notImplementedHandler,
		method: 'POST'
	}, {
		on: true,
		route: "/api/next/fp-users",
		handler: updateFPUsersSafeHandler,
		method: 'PUT'
	}, {
		on: true,
		route: "/api/next/fp-users",
		handler: notImplementedHandler,
		method: 'DELETE'
	},
];

exports.handler = async (req, res) => {
	var _admin = await getAdmin();
	res.end(JSON.stringify(_admin));
	return;
}

function verifyAccess(_type, _res) {
	if (_type == 'harbour_manager') {
		_res.end("<p>Accès refusé</p>");
		return;
	}
}

exports.plugin =
{
	title: "Gestion des admins",
	desc: "",
	handler: async (req, res) => {
		console.log('ADMINMGMT')

		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

			//get user from FORTPRESS db <
		var admin;
		var _type;
		var _entity_id;
		var _harbour_id;
		let roleBackOffice = ENUM.rolesBackOffice.VISITEUR;
		if (req.userCookie.data.id) {
			console.log(req.userCookie.data.id);

			// admin = await getAdminById(req.userCookie.data.id);
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
			console.log('admin', admin)

			if (admin.id) {
				if (admin.data.type)
					_type = admin.data.type;
				if (admin.data.entity_id)
					_entity_id = admin.data.entity_id;
				if (admin.data.harbour_id)
					_harbour_id = admin.data.harbour_id;
				if (admin.data.roleBackOffice)
					roleBackOffice = admin.data.roleBackOffice;
			}
		}

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)){
			res.writeHead(401);
			res.end('No access rights');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.admin_id) {
				verifyAccess(_type, res);
				await delAdmin(req.get.admin_id);
			}
			else if (req.get.admin_id) {
				verifyAccess(_type, res);
				await getAdminById(req.get.admin_id);
			}
		}
		if (req.method == "POST") {
			if (req.post.mode == "get_session") {
				console.log(admin);
				if (!admin) {
					UTILS.httpUtil.dataError(req, res, "error", "No user session", "1.0");
					return;
				} else {
					delete admin.password;
					delete admin.pw_type;
					delete admin.id;
					delete admin.login;
					UTILS.httpUtil.dataSuccess(req, res, "User session active", admin, "1.0");
					return;
				}
			}
			else if (req.post.id) {
				verifyAccess(_type, res);
				if (verifyPostReq(req, res)) {
					var currentAdmin = await getAdminById(req.post.id);
					if (currentAdmin.login != req.post.login) {
						var _admin = await getAdminByLogin(req.post.login);
						if (_admin[0]) {
							UTILS.httpUtil.dataError(req, res, "error", "Login déjà utilisé", "1.0");
							return;
						}
					}
					currentAdmin.data.harbour_id = JSON.parse(req.post.harbour_id);
					currentAdmin.data.roleBackOffice = req.post.roleBackOffice;
					if (typeof (await updateAdmin(currentAdmin)) != "string") {
						UTILS.httpUtil.dataSuccess(req, res, "Entité mis à jour", "1.0");
						return;
					}
				}
			}
			else {
				verifyAccess(_type, res);
				if (verifyPostReq(req, res)) {

					// verify if login already used
					const findAdminUserResp = await DB_FP.user.find({ login: req.post.login }, { raw: 1 });
					if (findAdminUserResp.error) {
						console.error(findAdminUserResp.error);
						res.writeHead(500);
						res.end('Internal Error');
						return;
					} else if (findAdminUserResp.data.length < 1) {
						console.error('No dashboard user found');
						res.writeHead(401);
						res.end('Accès non autorisé');
						return;
					}
					const _admin = findAdminResp.data[0];

					if (req.post.login == _admin.login) {
						UTILS.httpUtil.dataError(_req, _res, "error", "Login déjà utilisé", "1.0");
						return;
					}

					// set new user
					var user = {
						id: req.post.login,
						login: req.post.login,
						pw_type: 'sha512',
						password: UTILS.Crypto.createSHA512(req.post.login + req.post.password),
						name: req.post.name,
						bio: '',
						role: 'user',
						data: { 
							type: req.post.type,
							entity_id: req.post.entity_id,
							harbour_id: JSON.parse(req.post.harbour_id),
							roleBackOffice: req.post.roleBackOffice,
						},
						link: [],
						last_login: new Date(),
						photo: '/fortpress_admin_assets/img/default.png',
						date: Date.now()
					};

					//create user
					if (typeof (await createAdmin(user)) != "string") {
						//send response
						UTILS.httpUtil.dataSuccess(req, res, "Utilisateur créé", "1.0");
						return;
					}
				}
			}
		}
		else {
			verifyAccess(_type, res);

			//get html files
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _indexUserHtml = fs.readFileSync(path.join(__dirname, "index-user.html")).toString();
			var _adminHtml = fs.readFileSync(path.join(__dirname, "admin.html")).toString();


			var _admins = await getAdmin();

			const rolesOptions = generateRoleOptions(roleBackOffice);
			//modify html dynamically <
			var _adminGen = "";
			for (var i = 0; i < _admins.length; i++) {
				if (_admins[i].data != '') {
					var entity = await getEntityById(_admins[i].data.entity_id);
					var typeTranslated;
					if (_admins[i].data.type == "harbour_manager") {
						typeTranslated = "Gestionnaire de port";
					}

					var userHarbours = _admins[i].data.harbour_id;
					var harbours = await STORE.harbourmgmt.getHarbourByEntityId(_admins[i].data.entity_id);
					var harbour_select = '<select id="harbour_list_' + _admins[i].id.replace(/\./g, "_").replace("@", "_at_") + '" class="form-control" style="width:250px;" name="harbour_id" multiple>';
					var selected;
					for (var b = 0; b < harbours.length; b++) {
						for (var d = 0; d < userHarbours.length; d++) {
							if (harbours[b].id == userHarbours[d]) {
								selected = true;
								d = userHarbours.length;
							} else {
								selected = false;
							}
						}
						if (selected)
							harbour_select += '<option value="' + harbours[b].id + '" selected="selected">' + harbours[b].name + '</option>';
						else
							harbour_select += '<option value="' + harbours[b].id + '">' + harbours[b].name + '</option>';
					}
					harbour_select += '</select>';


					// Set back office role dropdown options
					let roleOptionsStr = rolesOptions.join('');
					if (_admins[i].data.roleBackOffice) {
						roleOptionsStr = roleOptionsStr.replace(`>${_admins[i].data.roleBackOffice}`, ` selected>${_admins[i].data.roleBackOffice}`);
					} else {
						roleOptionsStr = roleOptionsStr.replace(`>${ENUM.rolesBackOffice.VISITEUR}`, ` selected>${ENUM.rolesBackOffice.VISITEUR}`);
					}

					_adminGen += _adminHtml.replace(/__ID__/g, _admins[i].id)
						.replace(/__FORMID__/g, _admins[i].id.replace(/\./g, "_").replace("@", "_at_"))
						.replace(/__NAME__/g, _admins[i].name)
						.replace(/__LOGIN__/g, _admins[i].login)
						.replace(/__TYPE__/g, typeTranslated)
						.replace(/__ENTITY_NAME__/g, entity.name)
						.replace(/__HARBOUR_NAME__/g, harbour_select)
						.replace(/__BACK_OFFICE_ROLE__/g, roleOptionsStr);
				}
				else {
					const roleOptionsStr = `
						<option selected> - - - </option>
						${rolesOptions.join('')}
					`;
					_adminGen += _adminHtml.replace(/__ID__/g, _admins[i].id)
						.replace(/__FORMID__/g, _admins[i].id.replace(/\./g, "_").replace("@", "_at_"))
						.replace(/__NAME__/g, _admins[i].name)
						.replace(/__LOGIN__/g, _admins[i].login)
						.replace(/__TYPE__/g, "")
						.replace(/__ENTITY_NAME__/g, "")
						.replace(/__HARBOUR_NAME__/g, "")
						.replace(/__BACK_OFFICE_ROLE__/g, roleOptionsStr);
				}
			}
			// >

			//set entity and harbour lists <
			var entites = await getEntity();
			entites.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
			var harbours = await getHarbour();
			harbours.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
			if (entites[0] && harbours[0]) {
				var entitesOption;
				for (var i = 0; i < entites.length; i++) {
					entitesOption += '<option type="checkbox" value="' + entites[i].id + '">' + entites[i].name + '</option>';
				}
				_indexHtml = _indexHtml.replace("__ADMINS__", _adminGen)
					.replace('__SELECT_ENTITY__', entitesOption)
					.replace('__FIRST_ENTITY__', entites[0].id)
					.replace(/undefined/g, '');
			} else {
				_indexHtml = "Veuillez créer une entité et un port avant de créer les comptes gestionnaire";
			}
			// >

			// set for back office role options
			_indexHtml = _indexHtml.replace('__SELECT_BACK_OFFICE__', rolesOptions.join(''))

			// send html
			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}