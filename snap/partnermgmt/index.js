const TYPES = require('../../types');
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

// var path_to_img = path.resolve(path.join(CONF.instance.static, "img", "partner"));

// function makeid(length) {
// 	var result = '';
// 	var characters = 'abcdefghijklmnopqrstuvwxyz';
// 	var charactersLength = characters.length;
// 	for (var i = 0; i < length; i++) {
// 		result += characters.charAt(Math.floor(Math.random() * charactersLength));
// 	}
// 	// console.log(result);
// 	return result;
// }

// function validateEmail(email) {
// 	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// 	return re.test(String(email).toLowerCase());
// }

// function validatePhone(phone) {
// 	const re = /^\d{10}$|^\d{9}$/;
// 	return re.test(String(phone).toLowerCase());
// }

function addProtocolToUrl(url) {
	var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol
	if (patternProtocol.test(url)) {
		return url;
	} else {
		return ("https://" + url);
	}
}

// function validateUrl(value) {
// 	var pattern = new RegExp('^(https?:\\/\\/)' + // protocol
// 		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
// 		'((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
// 		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + //port
// 		'(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
// 		'(\\#[-a-z\\d_]*)?$', 'i');
// 	return pattern.test(value);
// }

function completePhonePrefix(prefix) {
	var patternPrefix = new RegExp(/^\+/)
	if (patternPrefix.test(prefix)) {
		return prefix
	} else {
		return '+' + prefix;
	}
}

function verifyPostReq(_req, _res) {
	if (!_req.post.name || _req.post.name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom du partenaire requis", "100", "1.0");
		return false;
	}
	if (!_req.post.address || _req.post.address.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Adresse requise", "100", "1.0");
		return false;
	}
	/*
			if (!_req.post.category || _req.post.category.length < 1) {
					UTILS.httpUtil.dataError(_req, _res, "Error", "Cat�gorie requise", "100", "1.0");
					return false;
			}
			if (!_req.post.subcategory || _req.post.subcategory.length < 1) {
					UTILS.httpUtil.dataError(_req, _res, "Error", "Sous cat�gorie requise", "100", "1.0");
					return false;
			}
	if (_req.post.email) {
			if (!validateEmail(_req.post.email)) {
					UTILS.httpUtil.dataError(_req, _res, "Error", "Email incorrect", "100", "1.0");
					return false;
			}
	}
	if (_req.post.phone) {
			if (!validatePhone(_req.post.phone)) {
					UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
					return false;
			}
	}
	*/
	// if (_req.post.phone) {
	// 	if (!_req.post.prefix || _req.post.prefix.length < 1) {
	// 		UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
	// 		return false;
	// 	}
	// 	if (!_req.post.phone || _req.post.phone.length < 1) {
	// 		UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
	// 		return false;
	// 	}
	// 	if (!validatePhone(_req.post.phone)) {
	// 		UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
	// 		return false;
	// 	}
	// }
	// if (_req.post.website) {
	// 	if (validateUrl(_req.post.website) != true) {
	// 		UTILS.httpUtil.dataError(_req, _res, "Error", "URL incorrect", "100", "1.0");
	// 		return false;
	// 	}
	// }
	return true;
}

async function getAdminByIdV2(_id) {
	/**@type {TYPES.T_SCHEMA['fortpress']} */
	const DB_FP = SCHEMA.fortpress;

	const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: 1 });
	if (findAdminResp.error) {
		console.error(findAdminResp);
		throw new Error(findAdminResp.error, { cause: findAdminResp });
	}
	const admin = findAdminResp.data[0];
	return admin;
};

//route handlers
async function getPartnerBySearchHandler(_req, _res) {
	try {
		const partners = await getPartnersV2({ harbour_id: _req.param.harbour_id, category: _req.param.category, subcategory: _req.param.subcategory })
		if (partners?.length < 1) {
			UTILS.httpUtil.dataSuccess(_req, _res, "error", "No partner found", "200", "1.0")
			return;
		}
		UTILS.httpUtil.dataSuccess(_req, _res, "success", partners, "1.0");
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(_req, _res, "Error", "Error", "500", "1.0")
	}
}

async function getPartnerByIdHandler(_req, _res) {
	try {
		const partners = await getPartnersV2({ id: _req.param.id });
		if (partners?.length < 1) {
			UTILS.httpUtil.dataError(_req, _res, "error", "No partner found", "200", 1.0);
			return;
		}
		UTILS.httpUtil.dataSuccess(_req, _res, "success", partners[0], "1.0");
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(_req, _res, "error", "Error", "500", "1.0")
	}
}

async function getPartnersByHarbourHandler(_req, _res) {
	try {
		if (!_req.get.harbour_id) {
			UTILS.httpUtil.dataError(_req, _res, "error", "Wrong harbour id", "400", "1.0")
			return;
		}
		const partners = await getPartnersV2({ harbour_id: _req.get.harbour_id });
		if (partners?.length < 1) {
			UTILS.httpUtil.dataSuccess(_req, _res, "error", "No partner found", "200", "1.0")
			return;
		}
		const harbours = await STORE.harbourmgmt.getHarbours({ id: _req.get.harbour_id });
		const harbour = harbours[0];
		if (!harbour) {
			UTILS.httpUtil.dataError(_req, _res, "error", "Wrong harbour id", "400", "1.0")
			return;
		}
		const _partnerHtml = fs.readFileSync(path.join(__dirname, "partner.html")).toString();

		UTILS.httpUtil.dataSuccess(_req, _res, "success", { html: _partnerHtml, partners: partners, harbour: harbour }, "1.0");
		return;
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(_req, _res, "Error", "Error", "500", "1.0")
	}
}

async function getActivePartnersCategoryHandler(_req, _res) {
	try {
		const partners = await getPartnersV2({ harbour_id: _req.param.harbour_id });
		var data = { activeCategories: {}, activeSubCategories: {} };
		for (var i = 0; i < partners.length; i++) {
			switch (partners[i].category) {
				case "harbourlife":
					data.activeCategories.harbourlife = true;
					break;
				case "experience":
					data.activeCategories.experience = true;
					break;
				case "discovery":
					data.activeCategories.discovery = true;
					break;
			}

			//discovery 	divertissement
			switch (partners[i].subcategory) {
				case "sos":
					data.activeSubCategories.sos = true;
					break;
				case "maintenance":
					data.activeSubCategories.maintenance = true;
					break;
				case "accastillage":
					data.activeSubCategories.accastillage = true;
					break;
				case "sante":
					data.activeSubCategories.sante = true;
					break;
				case "annonce":
					data.activeSubCategories.annonce = true;
					break;
				case "laverie":
					data.activeSubCategories.laverie = true;
					break;
				case "transport":
					data.activeSubCategories.transport = true;
					break;
				case "boutique":
					data.activeSubCategories.boutique = true;
					break;
				case "alimentation":
					data.activeSubCategories.alimentation = true;
					break;
				case "vieportautre":
					data.activeSubCategories.vieportautre = true;
					break;
				case "nautic":
					data.activeSubCategories.nautic = true;
					break;
				case "terrestres":
					data.activeSubCategories.terrestres = true;
					break;
				case "association":
					data.activeSubCategories.association = true;
					break;
				case "equipbourse":
					data.activeSubCategories.equipbourse = true;
					break;
				case "experienceautre":
					data.activeSubCategories.experienceautre = true;
					break;
				case "restaurant":
					data.activeSubCategories.restaurant = true;
					break;
				case "bar":
					data.activeSubCategories.bar = true;
					break;
				case "culture":
					data.activeSubCategories.culture = true;
					break;
				case "divertissement":
					data.activeSubCategories.divertissement = true;
					break;
				case "detente":
					data.activeSubCategories.detente = true;
					break;
				case "decouverteautre":
					data.activeSubCategories.decouverteautre = true;
					break;
				case 'vendeurLoueurHl':
					data.activeSubCategories.vendeurLoueurHl = true;
					break;
				case 'vendeurLoueurEx':
					data.activeSubCategories.vendeurLoueurEx = true;
					break;
				case 'patrimoine':
					data.activeSubCategories.patrimoine = true;
					break;
				case 'mouillages':
					data.activeSubCategories.mouillages = true;
					break;
			}
		}
		UTILS.httpUtil.dataSuccess(_req, _res, "success", data, "1.0");
		return;
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(_req, _res, "Error", "Error", "500", "1.0");
	}
}

/* ---------------------- */
/* NEW API HANDLERS START */
/* ---------------------- */

const checkApiAuth = async (authorization) => {
	console.log('CHECK API NEXT AUTH', authorization)
	const token = authorization.split(' ')[1];
	const adminUser = await getAdminByIdV2({ id: 'admin' });
	if (adminUser?.data?.token !== token) {
		console.log('CHECK API NEXT AUTH FAILED\n')
		return (false);
	}
	console.log('CHECK API NEXT AUTH SUCCESS\n')
	return (true);
}

async function getPartnerHandler(req, res) {
	try {
		const { authorization } = req.headers;
		if (!checkApiAuth(authorization)) {
			res.writeHead(401);
			res.end({
				code: 401,
				message: 'Not autorized',
				description: 'MUUUUUUUAHAHAHAHAH !!!',
			});
		}

		const ret = await getPartnersV2(req.get);
		res.end(JSON.stringify({ results: ret }));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500);
		res.end({
			code: 500,
			message: 'Internal error.',
			description: '',
		});
	}
};

const updatePartnerHandler = async (req, res) => {
	try {
		const { authorization } = req.headers;
		if (!checkApiAuth(authorization)) {
			res.writeHead(401);
			res.end({
				code: 401,
				message: 'Not autorized',
				description: 'MUUUUUUUAHAHAHAHAH !!!',
			});
		}

		const harbourUpdate = { ...req.body };
		const whereFields = { ...req.get };

		const result = await updatePartnersV2(whereFields, harbourUpdate);
		res.end(JSON.stringify({ results: result }));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'partnermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

/* ************** */
/* DB HANDLERS V2 */

/**
 * 
 * @param {*} where 
 * @returns {Promise<TYPES.T_partner[]>}
 */
async function getPartnersV2(where) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Find partners where', where);
	const findPartnersResp = await DB_NS.partner.find(where);
	if (findPartnersResp.error) {
		console.error('[ERROR]', findPartnersResp);
		throw new Error(findPartnersResp.message, { cause: findPartnersResp });
	}
	const partners = findPartnersResp.data;
	console.log(`Found ${partners.length} partner(s) items`);
	return partners;
};

/**
 * 
 * @param {Omit<TYPES.T_partner, "id">} partner 
 * @returns {Promise<TYPES.T_partner>}
 */
const createPartnersV2 = async (partner = {}) => {
	console.log('====createPartnersV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createPartnerResp = await DB_NS.partner.create(partner);
	if (createPartnerResp.error) {
		throw new Error(createPartnerResp.message, { cause: createPartnerResp });
	}
	const partners = createPartnerResp.data;
	console.log(`Created partner:`, partners);
	return partners;
};

/**
 * 
 * @param {Pick<TYPES.T_partner, "id"|"name"|"category"|"subcategory">} where 
 * @param {Partial<TYPES.T_partner>} updates 
 * @returns {Promise<TYPES.T_partner[]>}
 */
const updatePartnersV2 = async (where, updates) => {
	console.log('====updatePartnersV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ', { cause: where });
	}

	console.log('Update partners where: ', where);
	console.log('Update partners with: ', updates);
	const updatePartnersResp = await DB_NS.partner.update(where, updates);
	if (updatePartnersResp.error) {
		throw new Error(updatePartnersResp.message, { cause: updatePartnersResp });
	}
	const partners = updatePartnersResp.data;
	console.log(`${partners.length} partner(s) Updated`);
	return partners;
};

/**
 * 
 * @param {Pick<TYPES.T_partner, "id">} where 
 * @returns {Promise<TYPES.T_partner[]>}
 */
const deletePartnerV2 = async (where = {}) => {
	console.log('====deletePartnerV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte partner where: ', where);
	const deletePartnersResp = await DB_NS.partner.delete(where);
	console.log('deletePartnersResp', deletePartnersResp)
	if (deletePartnersResp.error) {
		throw new Error(deletePartnersResp.message, { cause: deletePartnersResp });
	}
	const partners = deletePartnersResp.data;
	console.log(`Deleted ${partners.length} partner(s) items`, partners);
	return partners;
};

// * DB HANDLERS V2 *
// * ************** *

// * *************** *
// * PLUGIN HANDLERS *

const pluginPostCreateHandler = async (req, res) => {
	try {
		if (req.post.website) {
			req.post.website = addProtocolToUrl(req.post.website);
		}
		if (!verifyPostReq(req, res)) {
			return;
		}

		/**@type {Omit<TYPES.T_partner, "id">} */
		const newPartner = {
			address: req.post.address || null,
			category: req.post.category || null,
			cloudinary_img_public_id: null,
			date: Date.now() || null,
			description: req.post.description || null,
			harbour_id: req.post.harbour_id || null,
			img: null,
			name: req.post.name || null,
			phone: req.post.phone || null,
			prefix: req.post.prefix || null,
			prefixed_phone: req.post.prefixed_phone || null,
			spotyrideLink: req.post.spotyrideLink || null,
			subcategory: req.post.subcategory || null,
		};

		if (newPartner.prefix && newPartner.phone) {
			newPartner.prefix = completePhonePrefix(newPartner.prefix);
			newPartner.prefixed_phone = newPartner.prefix + newPartner.phone.replace(/^0/, '');
		}

		//img gesture
		if (req.post.img) {
			const cloudinaryPath = `Nauticspot-Next/${newPartner.harbour_id}/partners/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			const upload = await STORE.cloudinary.uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newPartner.img = upload.secure_url;
			newPartner.cloudinary_img_public_id = upload.public_id;
		}

		const partner = await createPartnersV2(newPartner);
		console.log('created partner', partner);
		if (!partner?.id) {
			throw new Error('Erreur lors de la création du partenaire');
		}
		UTILS.httpUtil.dataSuccess(req, res, "Success", "Partenaire créé", "1.0");
	} catch (error) {
		console.error('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création du partenaire", "500", "1.0");
	}
};

const pluginPostUpdateHandler = async (req, res) => {
	try {
		if (req.post.website) {
			req.post.website = addProtocolToUrl(req.post.website);
		}
		if (!verifyPostReq(req, res)) {
			return;
		}
		/**@type {Partial<Omit<TYPES.T_partner, "id">>} */
		const partnerId = req.post.id;
		const partnerUpdates = req.post;
		delete partnerUpdates.id;
		const partners = await getPartnersV2({ id: partnerId });
		const currentPartner = partners[0];

		if (partnerUpdates.prefix && partnerUpdates.phone) {
			partnerUpdates.prefix = completePhonePrefix(partnerUpdates.prefix);
			partnerUpdates.prefixed_phone = partnerUpdates.prefix + partnerUpdates.phone.replace(/^0/, '');
		}

		//img gesture
		if (partnerUpdates.img) {
			var upload = await STORE.cloudinary.uploadFile(partnerUpdates.img, req.field["img"].filename);
			partnerUpdates.img = upload.secure_url;
			partnerUpdates.cloudinary_img_public_id = upload.public_id;
			if (currentPartner.cloudinary_img_public_id) {
				await STORE.cloudinary.deleteFile(currentPartner.cloudinary_img_public_id);
			}
		}

		const updatedPartners = await updatePartnersV2({ id: partnerId }, partnerUpdates);
		if (updatedPartners.length < 1) {
			throw new Error('Erreur lors de la mise à jour du partenaire');
		}
		UTILS.httpUtil.dataSuccess(req, res, "Success", "Partenaire mis à jour", "1.0");
	} catch (error) {
		console.error('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour du partenaire", "500", "1.0");
	}
};

// * PLUGIN HANDLERS *
// * *************** *

exports.router = [
	{
		on: true,
		route: "/api/getpartner/:id",
		handler: getPartnerByIdHandler,
		method: "GET"
	},
	{
		on: true,
		route: "/api/partner/:harbour_id/:category/:subcategory",
		handler: getPartnerBySearchHandler,
		method: "GET"
	},
	{
		on: true,
		route: "/api/partner/active/:harbour_id",
		handler: getActivePartnersCategoryHandler,
		method: "GET"
	},
	{
		on: true,
		route: "/api/partners/",
		handler: getPartnersByHarbourHandler,
		method: "GET"
	},

	// * API NEXT GEN --- DEPREC
	{
		on: true,
		route: "/api/next/partners",
		handler: getPartnerHandler,
		method: "GET"
	},
	{
		on: true,
		route: "/api/next/partners",
		handler: ((req, res) => { res.writeHead(401); res.end() }),
		method: "POST"
	},
	{
		on: true,
		route: "/api/next/partners",
		handler: updatePartnerHandler,
		method: "PUT"
	},
	{
		on: false,
		route: "/api/next/partners",
		handler: ((req, res) => { res.writeHead(401); res.end() }),
		method: "DELETE"
	},
];

exports.handler = async (req, res) => {
	var _partner = await getPartnersV2();
	res.end(JSON.stringify(_partner));
	return;
}

exports.plugin =
{
	title: "Gestion des partenaires",
	desc: "",
	handler: async (req, res) => {
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
			if (req.get.mode && req.get.mode == "delete" && req.get.partner_id) {
				const currentPartner = await getPartnersV2({ id: req.get.id });
				if (currentPartner.cloudinary_img_public_id) {
					await STORE.cloudinary.deleteFile(currentPartner.cloudinary_img_public_id);
				}
				await deletePartnerV2({ id: req.get.partner_id });
			}
		}
		if (req.method == "POST") {
			if (req.post.id && typeof req.body == "object" && req.multipart) {
				await pluginPostUpdateHandler(req, res);
			} else {
				await pluginPostCreateHandler(req, res);
			}
		}
		else {
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _partnerHtml = fs.readFileSync(path.join(__dirname, "partner.html")).toString();
			/**@type {Array<TYPES.T_partner>} */
			var _partners = [];

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" id="harbour_id" style="width:250px;" name="harbour_id">';

				const getHarbourPromises = await _harbour_id.map(harbour => STORE.harbourmgmt.getHarbourById(harbour))
				const userHarbours = await Promise.all(getHarbourPromises);
				userHarbours.map(userHarbour => {
					harbour_select += '<option value="' + userHarbour.id + '">' + userHarbour.name + '</option>';
				});

				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" id="harbour_id" style="width:250px;" name="harbour_id">';
				userHarbours = await STORE.harbourmgmt.getHarbours();
				userHarbours.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);

				for (var i = 0; i < userHarbours.length; i++) {
					harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			}
			_indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);

			try {
				if (_role == "user") {
					for (var i = 0; i < _harbour_id.length; i++) {
						_partners = await getPartnersV2({ harbour_id: _harbour_id[i] });
					}
				} else if (_role == "admin") {
					_partners = await getPartnersV2({});
					_partners = _partners.slice(0, 100);
				}
			} catch (error) {
				console.error('[ERROR]', error);

				_indexHtml = _indexHtml
					.replace("__PARTNERS__", '')
					.replace("<div id=\"harbourError\"></div>", '<div id="harbourError" class="alert alert-danger">Erreur lors du chargement des partenaires</div>');

				res.setHeader("Content-Type", "text/html");
				res.end(_indexHtml);
				return;
			}

			var categories = `
                <option value="harbourlife">Vie au port</option>
                <option value="experience">Experiences</option>
                <option value="discovery">Découvertes</option>
            `;
			var subcategories = {
				harbourlife: '<option value="sos">S.O.S.</option>'
					+ '<option value="maintenance">Maintenance</option>'
					+ '<option value="accastillage">Accastillage</option>'
					+ '<option value="sante">Santé</option>'
					+ '<option value="annonce">Annonce</option>'
					+ '<option value="laverie">Laverie</option>'
					+ '<option value="transport">Transport</option>'
					+ '<option value="alimentation">Alimentation</option>'
					+ '<option value="boutique">Boutique</option>'
					+ '<option value="vendeurLoueurHl">Vendeur / Loueur</option>'
					+ '<option value="vieportautre">Autre</option>',
				experience: '<option value="nautic">Activités nautiques</option>'
					+ '<option value="terrestres">Activités terrestres</option>'
					+ '<option value="association">Association</option>'
					+ '<option value="equipbourse">Bourse aux équipiers</option>'
					+ '<option value="vendeurLoueurEx">Vendeur / Loueur</option>'
					+ '<option value="experienceautre">Autre</option>',
				discovery: '<option value="restaurant">Restaurants</option>'
					+ '<option value="bar">Bar</option>'
					+ '<option value="culture">Culture</option>'
					+ '<option value="divertissement">Loisirs</option>'
					+ '<option value="detente">Détente</option>'
					+ '<option value="patrimoine">Patrimoine</option>'
					+ '<option value="mouillages">Mouillages</option>'
					+ '<option value="decouverteautre">Autre</option>',
			};

			var _partnerGen = "";

			totalPerfStart = performance.now();
			for (var i = 0; i < _partners.length; i++) {
				const currentHarbour = await STORE.harbourmgmt.getHarbours({ id: _partners[i].harbour_id });

				let formatedDate = '-';
				if (_partners[i].created_at || _partners[i].date) {
					const dateObj = new Date(_partners[i].created_at || _partners[i].date)
					const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
					const date = splited[0];
					const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
					formatedDate = `${date} à ${heure}`;
				}

				_partnerGen += _partnerHtml.replace(/__ID__/g, _partners[i].id)
					.replace(/__FORMID__/g, _partners[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id)
					.replace(/__CATEGORY__/g, categories)
					.replace(`option value="${_partners[i].category}"`, `option value=${_partners[i].category} selected`)
					.replace(/__SUBCATEGORY__/g, subcategories[_partners[i].category])
					.replace(`option value="${_partners[i].subcategory}"`, `option value=${_partners[i].subcategory} selected`)
					.replace(/__NAME__/g, _partners[i].name)
					.replace(/__EDITOR_ID__/g, "editor_" + _partners[i].id.replace(/\./g, "_"))
					.replace(/__DESCRIPTION__/g, _partners[i].description)
					.replace(/__EMAIL__/g, _partners[i].email)
					.replace(/__PREFIX__/g, _partners[i].prefix)
					.replace(/__PHONE__/g, _partners[i].phone)
					.replace(/__IMG__/g, _partners[i].img)
					.replace(/__WEBSITE__/g, _partners[i].website)
					.replace(/__ADDRESS__/g, _partners[i].address)
					.replace(/__DATE_CREATION__/g, formatedDate)
					.replace(/__SPOTYRIDE_LINK__/g, _partners[i].spotyrideLink || '');
			}
			_indexHtml = _indexHtml.replace("__PARTNERS__", _partnerGen).replace(/undefined/g, '');

			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}