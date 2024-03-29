require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
];

var _entityCol = "entity";
var _userCol = "user";


function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}
function testOnlyAplhaNum(value) {
	if (value.match("^[a-zA-Z0-9]*.png$")) {
		return true;
	} else
		return false;
}
function validatePhone(phone) {
	const re = /^\d{10}$|^\d{9}$/;
	return re.test(String(phone).toLowerCase());
}


function completePhonePrefix(prefix) {
	var patternPrefix = new RegExp(/^\+/)
	if (patternPrefix.test(prefix)) {
		return prefix
	} else {
		return '+' + prefix;
	}
}

function addProtocolToUrl(url) {
	var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol
	console.log(url);
	console.log(patternProtocol.test(url));
	if (patternProtocol.test(url)) {
		console.log(url);
		return url;
	} else {
		console.log(url);
		return ("https://" + url);
	}
}

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

function verifyPostReq(_req, _res) {
	if (!_req.post.name || _req.post.name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de l'entité", "100", "1.0");
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
	if (_req.post.phone) {
		if (!_req.post.prefix || _req.post.prefix.length < 1) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
			return false;
		}
		if (!_req.post.phone || _req.post.phone.length < 1) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
			return false;
		}
		if (!validatePhone(_req.post.phone)) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
			return false;
		}
	}
	return true;
}

/**
 * 
 * @param {import('../../types').T_entity['id']} _id 
 * @returns {Promise<Array<import('../../types').T_entity>>}
 */
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

/**
 * 
 * @returns {Promise<Array<import('../../types').T_entity>>}
 */
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

async function delEntity(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Delete(_entityCol, { id: _id }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function createEntity(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Create(_entityCol, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function updateEntity(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Update(_entityCol, { id: _obj.id }, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
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
async function getAdmin(_query) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.Find(_userCol, _query, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}
//routes handlers
async function getEntityByIdHandler(_req, _res) {
	var entity = await getEntityById(_req.param.entity_id);
	if (entity.id) {
		UTILS.httpUtil.dataSuccess(_req, _res, "success", entity, "1.0");
		return;
	} else {
		UTILS.httpUtil.dataError(_req, _res, "error", "entity not found", "1.0");
		return;
	}
}

//routes handlers
async function getEntityByCookieIdHandler(_req, _res) {
	// console.log(await getAdmin({}));
	console.log(_req.userCookie);

	//console.log(await getAdmin({token: _req.post.token}));
	/* var admin = await getAdminById(_req.userCookie.data.id);
	 //console.log(admin);
 
	 if (admin.id) {
			 var entity = await getEntityById(admin.data.entity_id);
			 if (entity.id) {
					 UTILS.httpUtil.dataSuccess(_req, _res, "success", entity, "1.0");
					 return;
			 } else {
					 UTILS.httpUtil.dataError(_req, _res, "error", "entity not found", "1.0");
					 return;
			 }
	 } else {
			 UTILS.httpUtil.dataError(_req, _res, "error", "admin not found", "1.0");
			 return;
	 }
	 */
	UTILS.httpUtil.dataError(_req, _res, "error", "admin not found", "1.0");
	return;
}

/**
 * @typedef getEntityWhereOptions 
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [email]
 * @returns 
 */
/**
 * @param {getEntityWhereOptions} whereOptions
 * @returns 
 */
const getEntityWhere = (whereOptions) => {
	return new Promise(resolve => {
		STORE.db.linkdb.Find(_entityCol, whereOptions, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
};

const getEntityHandler = async (req, res) => {
	try {
		/** @type {getEntityWhereOptions} */
		const whereOpt = {};
		if (req.get.id) whereOpt.id = req.get.id;
		if (req.get.name) whereOpt.name = req.get.name;
		if (req.get.email) whereOpt.email = req.get.email;
		const result = await getEntityWhere(whereOpt);
		res.end(JSON.stringify(result));
	} catch (error) {
		console.error('[ERROR]', error);
			myLogger.logError(error, { module: 'entitymgmt' })
			const errorHttpCode = error.cause?.httpCode || 500;
			res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				success: false,
				error: error.toString(),
			}));
	}
};

const createEntityHandler = async (req, res) => {
	try {
		const entityData = req.body;
		if (!entityData) throw new Error('request body error', { cause: { httpCode: 400 } });

		// TODO - check for requested fields

		const result = await createEntity(entityData);
		res.end(JSON.stringify(result));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'entitymgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

/**
 * 
 * @param {import('../../types').T_entity} updateFields 
 * @param {getEntityWhereOptions} whereFields 
 * @returns {Promise<Array<import('../../types').T_entity>>}
 */
async function updateEntityWhere(updateFields, whereFields) {
	return new Promise(resolve => {
		STORE.db.linkdb.Update(_entityCol, whereFields, updateFields, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
};

const updateEntityHandler = async (req, res) => {
	try {
		/** @type {getEntityWhereOptions} */
		const whereOpt = {}
		if (req.get.id) whereOpt.id = req.get.id;
		if (req.get.name) whereOpt.name = req.get.name;
		if (req.get.email) whereOpt.email = req.get.email;

		const result = await updateEntityWhere(req.body, whereOpt);
		res.end(JSON.stringify(result));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'entitymgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

const deleteEntityHandler = async (req, res) => {
	try {
		const entityId = req.param.id;
		if (!entityId) throw new Error({ code: 404, message: 'param error' });

		const result = await delEntity(entityId);
		res.end(JSON.stringify("ok"));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'entitymgmt' })
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
		route: "/api/entity/get/:entity_id",
		handler: getEntityByIdHandler,
		method: 'get'
	},
	{
		on: true,
		route: "/admin/api/entity/get",
		handler: getEntityByCookieIdHandler,
		method: 'post'
	},

	// NEW CRUD
	{
		on: true,
		route: "/api/next/entities",
		handler: getEntityHandler,
		method: 'GET'
	},
	{
		on: true,
		route: "/api/next/entities",
		handler: createEntityHandler,
		method: 'POST'
	},
	{
		on: true,
		route: "/api/next/entities",
		handler: updateEntityHandler,
		method: 'PUT'
	},
	{
		on: true,
		route: "/api/next/entities",
		handler: deleteEntityHandler,
		method: 'DELETE'
	},
];

exports.handler = async (req, res) => {
	var _entity = await getEntity();
	res.end(JSON.stringify(_entity));
	return;
}
function verifyAccess(_type, _res) {
	if (_type == 'harbour_manager') {
		_res.end("<p>Accès refusé</p>");
	}
}
exports.plugin =
{
	title: "Gestion des groupes portuaires",
	desc: "",
	handler: async (req, res) => {
		var admin;
		var _type;
		var _entity_id;
		var _harbour_id;
		if (req.userCookie.data.id) {
			// admin = await getAdminById(req.userCookie.data.id);
			/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
			const DB_NS = SCHEMA.NAUTICSPOT;
			/**@type {TYPES.T_SCHEMA['fortpress']} */
			const DB_FP = SCHEMA.fortpress;

			const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: 1 });
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
			admin = findAdminResp.data[0];

			if (admin.id) {
				if (admin.data.type)
					_type = admin.data.type;
				if (admin.data.entity_id)
					_entity_id = admin.data.entity_id;
				if (admin.data.harbour_id)
					_harbour_id = admin.data.harbour_id;
			}
		}

		if (req.post.mode !== 'getEntity') {
			if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
				res.writeHead(401);
				res.end('No access rights');
				return;
			}
		}

		if (req.method == "GET") {
			verifyAccess(_type, res);
			if (req.get.mode && req.get.mode == "delete" && req.get.entity_id) {
				var currentEntity = await getEntityById(req.get.entity_id);
				//var currentEntity = await getEntityById(req.post.id);
				if (currentEntity.cloudinary_img_public_id) {
					await STORE.cloudinary.deleteFile(currentEntity.cloudinary_img_public_id);
				}
				if (currentEntity.cloudinary_logo_public_id) {
					await STORE.cloudinary.deleteFile(currentEntity.cloudinary_logo_public_id);
				}
				await delEntity(req.get.entity_id);
			}
			else if (req.get.entity_id) {
				await getEntityById(req.get.entity_id);
			}
		}
		if (req.method == "POST") {

			if (req.post.mode == "getEntity") {
				if (_entity_id) {
					var entity = await getEntityById(_entity_id);
					if (entity.id) {
						UTILS.httpUtil.dataSuccess(req, res, "success", entity, "1.0");
						return;
					} else {
						UTILS.httpUtil.dataError(req, res, "error", "entity not found", "1.0");
						return;
					}
				}
				else {
					UTILS.httpUtil.dataError(req, res, "error", "user not found", "1.0");
					return;
				}
			}
			else if (req.post.id) {
				verifyAccess(_type, res);
				if (verifyPostReq(req, res)) {
					req.post.date = Date.now();
					var _FD = req.post;
					if (_FD.prefix) {
						_FD.prefix = completePhonePrefix(_FD.prefix);
						_FD.prefixed_phone = _FD.prefix + _FD.phone.replace(/^0/, '');
					}

					var currentEntity = await getEntityById(req.post.id);


					//img gesture
					if (_FD.img) {
						var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
						_FD.img = upload.secure_url;
						_FD.cloudinary_img_public_id = upload.public_id;
						if (currentEntity.cloudinary_img_public_id) {
							await STORE.cloudinary.deleteFile(currentEntity.cloudinary_img_public_id);
						}
					}

					//logo gesture
					if (_FD.logo) {
						var upload = await STORE.cloudinary.uploadFile(_FD.logo, req.field["logo"].filename);
						_FD.logo = upload.secure_url;
						_FD.cloudinary_img_public_id = upload.public_id;
						if (currentEntity.cloudinary_logo_public_id) {
							await STORE.cloudinary.deleteFile(currentEntity.cloudinary_logo_public_id);
						}
					}

					if (_FD.absence_module)
						_FD.absence_module = true;
					else
						_FD.absence_module = false;

					if (_FD.security_module)
						_FD.security_module = true;
					else
						_FD.security_module = false;

					if (_FD.marees_module)
						_FD.marees_module = true;
					else
						_FD.marees_module = false;

					if (_FD.challenges_module)
						_FD.challenges_module = true;
					else
						_FD.challenges_module = false;


					if (_FD.wlink_vone_pw) {
						_FD.wlink_vone_pw = UTILS.Crypto.encryptText(_FD.wlink_vone_pw, "AJtWbggDUidBESek3fIc");
					}
					var entity = await updateEntity(_FD);
					if (entity[0].id) {
						UTILS.httpUtil.dataSuccess(req, res, "Success", "Entité mise à jour", "1.0");
						return;
					} else {
						UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'entité", "1.0");
						return;
					}
				}
			}
			else {
				verifyAccess(_type, res);
				if (verifyPostReq(req, res)) {
					var _FD = req.post;
					if (_FD.prefix) {
						_FD.prefix = completePhonePrefix(_FD.prefix);
						_FD.prefixed_phone = _FD.prefix + _FD.phone.replace(/^0/, '');
						console.log(_FD.prefixed_number);
					}


					//img gesture
					if (_FD.img) {
						var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
						_FD.img = upload.secure_url;
						_FD.cloudinary_img_public_id = upload.public_id;
					}

					//logo gesture
					if (_FD.logo) {
						var upload = await STORE.cloudinary.uploadFile(_FD.logo, req.field["logo"].filename);
						_FD.logo = upload.secure_url;
						_FD.cloudinary_logo_public_id = upload.public_id;
					}

					if (_FD.appIcon) {
						var upload = await STORE.cloudinary.uploadFile(_FD.appIcon, req.field["appIcon"].filename, undefined, {cloudinaryPath: '/Nauticspot-Next/pwa-mobile-logo/2048/'});
						_FD.appIcon = upload.secure_url;
					}

					if (_FD.absence_module)
						_FD.absence_module = true;
					else
						_FD.absence_module = false;

					if (_FD.security_module)
						_FD.security_module = true;
					else
						_FD.security_module = false;

					if (_FD.marees_module)
						_FD.marees_module = true;
					else
						_FD.marees_module = false;

					if (_FD.challenges_module)
						_FD.challenges_module = true;
					else
						_FD.challenges_module = false;


					if (_FD.wlink_vone_pw) {
						_FD.wlink_vone_pw = UTILS.Crypto.encryptText(_FD.wlink_vone_pw, "AJtWbggDUidBESek3fIc");
					}

					var entity = await createEntity(_FD);
					console.log(entity);
					if (entity.id) {
						UTILS.httpUtil.dataSuccess(req, res, "Success", "Entité mise à jour", "1.0");
						return;
					} else {
						UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'entité", "1.0");
						return;
					}
				}
			}
		}
		else {
			verifyAccess(_type, res);

			var absence_module = "";
			var security_module = "";
			var marees_module = "";
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _entityHtml = fs.readFileSync(path.join(__dirname, "entity.html")).toString();
			var _entities = await getEntity();
			var _entityGen = "";
			for (var i = 0; i < _entities.length; i++) {

				if (_entities[i].absence_module)
					absence_module = '<input class="form-control" name="absence_module" type="checkbox" checked>'
				else
					absence_module = '<input class="form-control" name="absence_module" type="checkbox">'

				if (_entities[i].security_module)
					security_module = '<input class="form-control" name="security_module" type="checkbox" checked>'
				else
					security_module = '<input class="form-control" name="security_module" type="checkbox">'

				if (_entities[i].marees_module)
					marees_module = '<input class="form-control" name="marees_module" type="checkbox" checked>'
				else
					marees_module = '<input class="form-control" name="marees_module" type="checkbox">'

				if (_entities[i].challenges_module)
					challenges_module = '<input class="form-control" name="challenges_module" type="checkbox" checked>'
				else
					challenges_module = '<input class="form-control" name="challenges_module" type="checkbox">'

				let weather_api = "";
				if (_entities[i].weather_api) {
					if (_entities[i].weather_api == "wlv1") {
						weather_api = '<option class="form-control" name="weather_api" value="wlv1" selected>WeatherLink v1</option>' + '<option class="form-control" name="weather_api" value="wlv2">WeatherLink v2</option>' + '<option class="form-control" name="weather_api" value="wwo">world weather online</option>'

					}
					else if (_entities[i].weather_api == "wlv2") {
						weather_api = '<option class="form-control" name="weather_api" value="wlv1">WeatherLink v1</option>' + '<option class="form-control" name="weather_api" value="wlv2" selected>WeatherLink v2</option>' + '<option class="form-control" name="weather_api" value="wwo"">world weather online</option>'
					}
					else if (_entities[i].weather_api == "wwo") {
						weather_api = '<option class="form-control" name="weather_api" value="wlv1">WeatherLink v1</option>' + '<option class="form-control" name="weather_api" value="wlv2">WeatherLink v2</option>' + '<option class="form-control" name="weather_api" value="wwo"" selected>world weather online</option>'
					}

				}
				else
					weather_api = '<option class="form-control" name="weather_api" value="wlv1">WeatherLink v1</option>' + '<option class="form-control" name="weather_api" value="wlv2">WeatherLink v2</option>' + '<option class="form-control" name="weather_api" value="wwo"" selected>world weather online</option>'

				if (_entities[i].wlink_vone_pw) {
					_entities[i].wlink_vone_pw = UTILS.Crypto.decryptText(_entities[i].wlink_vone_pw, "AJtWbggDUidBESek3fIc");
				}

				_entityGen += _entityHtml.replace(/__ID__/g, _entities[i].id)
					.replace(/__FORMID__/g, _entities[i].id.replace(/\./g, "_"))
					.replace(/__NAME__/g, _entities[i].name)
					.replace(/__EMAIL__/g, _entities[i].email)
					.replace(/__PREFIX__/g, _entities[i].prefix)
					.replace(/__PHONE__/g, _entities[i].phone)
					.replace(/__ADDRESS__/g, _entities[i].address)
					.replace(/__LINK__/g, '/app/' + _entities[i].id + '/?entity=' + _entities[i].id)
					.replace(/__LOGO__/g, _entities[i].logo)
					.replace(/__APP_ICON__/g, _entities[i].appIcon)
					.replace(/__IMG__/g, _entities[i].img)
					.replace(/__ONESIGNAL_APP_ID__/g, _entities[i].onesignal_app_id)
					.replace(/__ONESIGNAL_AUTH__/g, _entities[i].onesignal_auth)
					.replace(/__MAILJET_MAIL__/g, _entities[i].mailjet_mail)
					.replace(/__MAILJET_APIKEY__/g, _entities[i].mailjet_apikey)
					.replace(/__MAILJET_SECRETKEY__/g, _entities[i].mailjet_secretkey)
					.replace(/__MAREE_ID__/g, _entities[i].maree_id)
					.replace(/__ABSENCE_MODULE__/g, absence_module)
					.replace(/__SECURITY_MODULE__/g, security_module)
					.replace(/__MAREES_MODULE__/g, marees_module)
					.replace(/__CHALLENGES_MODULE__/g, challenges_module)
					.replace(/__WEATHER_API__/g, weather_api)
					.replace(/__WLINK_VONE_USER__/g, _entities[i].wlink_vone_user)
					.replace(/__WLINK_VONE_PW__/g, _entities[i].wlink_vone_pw)
					.replace(/__WLINK_VONE_TOKEN__/g, _entities[i].wlink_vone_token)
					.replace(/__WLINK_VTWO_APIKEY__/g, _entities[i].wlink_vtwo_apikey)
					.replace(/__WLINK_VTWO_SECRETKEY__/g, _entities[i].wlink_vtwo_secretkey)
					.replace(/__GBB_APP_ID__/g, _entities[i].gbbAppId)
					.replace(/__GBB_API_KEY__/g, _entities[i].gbbApiKey)

			}
			_indexHtml = _indexHtml.replace("__ENTITIES__", _entityGen).replace(/undefined/g, '');
			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
		
	}
}

exports.store = {
	getEntityById: getEntityById
}