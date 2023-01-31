const ENUM = require('../lib-js/enums');
const TYPES = require('../../types');
const verifyRoleAccess = require('../lib-js/verify').verifyRoleAccess;
const fetch = require('node-fetch');
const myLogger = require('../lib-js/myLogger')

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

//verify if url start with https
function addProtocolToUrl(url) {
	var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol
	if (patternProtocol.test(url)) {
		return url;
	} else {
		return ("https://" + url);
	}
}

//verify some data in post
function verifyPostReq(_req, _res) {
	if (!_req.post.title || _req.post.title.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
		return false;
	}
	if (!_req.post.message || _req.post.message.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Message requis", "100", "1.0");
		return false;
	}
	return true;
}

/**
 * @param {TYPES.T_communication} notification 
 */
const sendGoodbarberPushNotification = async (notification) => {
	try {
		const harbour = await STORE.harbourmgmt.getHarbours({ id: notification.harbour_id });
		const entity = await STORE.enititymgmt.getEntityById(harbour.id_entity);
		if (!entity.gbbAppId || !entity.gbbApiKey) {
			throw (new Error('Missing Goodbarber auth informations'))
		}

		// limit text to the first 200 chars.
		const text = notification?.title?.length > 200 ? `${notification?.title.slice(0, 200)}...` : notification.title;
		let msg = '';

		// is there many harbours within the entity and adapt the notification message accordingly
		const entityHarbours = await STORE.API_NEXT.getElements(ENUM.TABLES.HARBOURS, { id_entity: entity.id });
		if (entityHarbours.length > 1) {
			msg = `${harbour.name}: ${text}`;
		} else {
			const TRANSLATE_EVENT_TYPE = {
				"other": "Autre",
				"weather": "Météo",
				"event": "Événement",
				"maintenance": "Travaux",
				"security": "Sécurité",
			}
			const eventType = TRANSLATE_EVENT_TYPE[notification.category.toLocaleLowerCase()];
			msg = `${eventType}: ${text}`;
		}

		const response = await fetch(
			`https://classic.goodbarber.dev/publicapi/v1/general/push/${entity.gbbAppId}/`,
			{
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					token: entity.gbbApiKey,
				},
				body: JSON.stringify({
					platform: 'all',
					message: msg,
				}),
			}
		);

		if (response.ok) {
			const resp = await response.json();
			console.log('resp', resp)
			return (true);
		} else {
			console.error('Err ', response)
			const resp = await response?.json();
			console.error('Err resp', resp)
			throw (new Error(response.error_description));
		}
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'commgmt' })
		throw error;
	}
};

const uploadFileWrapper = async (fileRaw, FileName, cloudinaryPath) => {
	console.log('Upload attachment on cloudinary');
	const option = {
		isFileNameUsed: true,
		cloudinaryPath,
	}
	const upload = await STORE.cloudinary.uploadFile(fileRaw, FileName, "slug", option);
	if (upload.name === 'Error') {
		throw new Error(upload.message, { cause: upload });
	}
	console.log('Upload attachment OK\n', upload);
	return upload;
};

/* ************** */
/* DB HANDLERS V2 */

/**
 * 
 * @param {Partial<TYPES.T_communication>} where 
 * @returns {Promise<TYPES.T_communication[]>}
 */
const getComsV2 = async (where) => {
	console.log('===getComsV2===');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Search communications where: ', where);
	const getCommsV2Resp = await DB_NS.coms.find(where);
	if (getCommsV2Resp.error) {
		throw new Error(getCommsV2Resp.message, { cause: getCommsV2Resp });
	}

	const communications = getCommsV2Resp.data;
	console.log(`Found ${communications.length} communication(s) items`);
	return communications;
};

/**
 * 
 * @param {Omit<TYPES.T_communication, "id">} partner 
 * @returns {Promise<TYPES.T_communication>}
 */
const createComsV2 = async (coms = {}) => {
	console.log('====createComssV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createComResp = await DB_NS.coms.create(coms);
	if (createComResp.error) {
		console.error(createComResp);
		throw new Error(createComResp.message, { cause: createComResp });
	}
	const createdCom = createComResp.data;
	console.log(`Created com:`, createdCom);
	return createdCom;
};

/**
 * 
 * @param {Pick<TYPES.T_communication, "id"|"category"|"harbour_id"|"title">} where 
 * @param {Partial<TYPES.T_communication>} updates 
 * @returns {Promise<TYPES.T_communication[]>}
 */
const updateComsV2 = async (where, updates) => {
	console.log('====updateComsV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update coms where: ', where);
	console.log('Update coms with: ', updates);
	const updateCommsResp = await DB_NS.coms.update(where, updates);
	if (updateCommsResp.error) {
		throw new Error(updateCommsResp.message, { cause: updateCommsResp });
	}
	const coms = updateCommsResp.data;
	console.log(`${coms.length} com(s) Updated`);
	return coms;
};

/**
 * 
 * @param {Pick<TYPES.T_communication, "id"|"category"|"harbour_id"|"title">} where 
 * @returns {Promise<TYPES.T_communication[]>}
 */
const deleteComsV2 = async (where = {}) => {
	console.log('====deleteComsV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte communication where: ', where);
	const deleteCommsResp = await DB_NS.coms.delete(where);
	if (deleteCommsResp.error) {
		console.error(deleteCommsResp);
		throw new Error(deleteCommsResp.message, { cause: deleteCommsResp });
	}
	const communications = deleteCommsResp.data;
	console.log(`Deleted ${communications.length} communication(s) items`, communications);
	return communications;
};

/* DB HANDLERS V2 */
/* ************** */


/* ************** */
/* API HANDLERS */

const getCommunicationsHandler = async (req, res) => {
	try {
		const userCategory = req.get.user_category;

		/**@type {findCommunicationsOptions} */
		const options = {};
		if (req.get.id) options.id = req.get.id;
		if (req.get.category) options.category = req.get.category;
		if (req.get.harbour_id) options.harbour_id = req.get.harbour_id;
		if (req.get.title) options.title = req.get.title;
		if (req.get.user_category) options.user_category = req.get.user_category;
		const comms = await getComsV2(options);
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(comms));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'commgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

const updateCommunicationsHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_communication} */
		const commModifications = req.body
		const commId = commModifications.id;
		delete commModifications.id;
		if (!commId) { // no comm id specified
			throw (new Error('Wrong or missing comm id', { cause: { httpCode: 400 } }));
		}
		commModifications.updated_at = Date.now()
		const updatedCommunication = await updateComsV2({ id: commId }, commModifications);
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(updatedCommunication));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'commgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

//handler that get a communication
async function getComHandler(req, res) {
	console.log('--getComHandler--');
	if (req.get.comid && req.get.userid) {
		if (req.get.userid === 'undefined') req.get.userid = undefined;

		const coms = await getComsV2({ id: req.get.comid });
		console.log('coms', coms);
		if (req.get.userid && coms.read_id) {
			var ids = coms.read_id.filter(id => id == req.get.userid)
			if (!ids[0]) {
				coms.read_id.push(req.get.userid);
				coms = await updateComsV2(coms);
			}
		}
		const com = coms[0];
		if (com.id) {
			UTILS.httpUtil.dataSuccess(req, res, "success", com, "1.0");
			return;
		}
		else {
			UTILS.httpUtil.dataError(req, res, "Error", "", "100", "1.0");
			return;
		}
	}
};

/* API HANDLERS */
/* ************** */

/* *************** */
/* PLUGIN HANDLERS */

const pluginPostCreateHandler = async (req, res) => {
	try {
		if (!verifyPostReq(req, res)) {
			return;
		}

		/**@type {Omit<TYPES.T_communication, "id">} */
		const newCom = {
			category: req.post.category || null,
			cloudinary_img_public_id: req.post.cloudinary_img_public_id || null,
			cloudinary_pj_public_id: req.post.cloudinary_pj_public_id || null,
			created_at: req.post.created_at || Date.now(),
			harbour_id: req.post.harbour_id || null,
			img: null,
			link: null,
			link_name: req.post.link_name || null,
			message: req.post.message || null,
			pj: req.post.pj || null,
			pjname: req.post.pjname || null,
			read_id: req.post.read_id || null,
			title: req.post.title || null,
			updated_at: req.post.updated_at || null,
			user_category: req.post.user_category || null,
			users_id: req.post.users_id || null,
		};
		if (req.post.link)
			newCom.link = addProtocolToUrl(req.post.link);

		//img gesture
		if (req.post.img) {
			const cloudinaryPath = `Nauticspot-Next/${newCom.harbour_id}/coms-images/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			const upload = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newCom.img = upload.secure_url;
			newCom.cloudinary_img_public_id = upload.public_id;
		}

		//pj gesture
		if (req.post.pj) {
			const cloudinaryPath = `Nauticspot-Next/${newCom.harbour_id}/coms-attachments/`;
			const imgData = req.post.pj;
			const imgFilename = req.field["pj"].filename;
			if (!newCom.pjname) newCom.pjname = imgFilename;
			const upload = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newCom.pj = upload.secure_url;
			newCom.cloudinary_pj_public_id = upload.public_id;
		}

		const isPushSent = await sendGoodbarberPushNotification(newCom).catch((err) => {
			console.error('[ERROR]', err)
			UTILS.httpUtil.dataError(req, res, "erreur lors de l'envoi de la notification", "1.0");
			return;
		})
		if (!isPushSent) {
			throw new Error('Push Notification not sent !');
		}

		const createdCom = await createComsV2(newCom);
		if (createdCom.id) {
			UTILS.httpUtil.dataSuccess(req, res, "Success", "Notification envoyé", "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de l'enregistrement de la notification", "1.0");
			return;
		}
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Erreur lors de l'envoi de la notification", "500", "1.0");
	}
};

const pluginPostUpdateHandler = async (req, res) => {
	try {
		if (!verifyPostReq(req, res)) {
			return;
		}
		const [currentCom] = await getComsV2({ id: req.post.id });
		const updates = {
			category: req.post.category || currentCom.category || null,
			cloudinary_img_public_id: req.post.cloudinary_img_public_id || currentCom.cloudinary_img_public_id || null,
			cloudinary_pj_public_id: req.post.cloudinary_pj_public_id || currentCom.cloudinary_pj_public_id || null,
			created_at: req.post.created_at || currentCom.created_at || null,
			harbour_id: req.post.harbour_id || currentCom.harbour_id || null,
			img: currentCom.img || null,
			link: currentCom.link || null,
			link_name: req.post.link_name || currentCom.link_name || null,
			message: req.post.message || currentCom.message || null,
			pj: req.post.pj || currentCom.pj || null,
			pjname: req.post.pjname || currentCom.pjname || null,
			read_id: req.post.read_id || currentCom.read_id || null,
			title: req.post.title || currentCom.title || null,
			updated_at: req.post.updated_at || currentCom.updated_at || null,
			user_category: req.post.user_category || currentCom.user_category || null,
			users_id: req.post.users_id || currentCom.users_id || null,
		};

		if (req.post.link)
			updates.link = addProtocolToUrl(req.post.link);

		//img gesture
		if (req.post.img) {
			const cloudinaryPath = `Nauticspot-Next/${newCom.harbour_id}/coms-images/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			const upload = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			updates.img = upload.secure_url;
			updates.cloudinary_img_public_id = upload.public_id;
			if (currentCom.cloudinary_img_public_id) {
				await STORE.cloudinary.deleteFile(currentCom.cloudinary_img_public_id);
			}
		}

		//pj gesture
		if (req.post.pj) {
			const cloudinaryPath = `Nauticspot-Next/${newCom.harbour_id}/coms-attachments/`;
			const imgData = req.post.pj;
			const imgFilename = req.field["pj"].filename;
			if (!updates.pjname) updates.pjname = imgFilename;
			const upload = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			updates.pj = upload.secure_url;
			updates.cloudinary_pj_public_id = upload.public_id;
			if (currentCom.cloudinary_pj_public_id) {
				await STORE.cloudinary.deleteFile(currentCom.cloudinary_pj_public_id);
			}
		}

		const createdCom = await updateComsV2({ id: req.post.id }, updates);
		if (createdCom[0].id) {
			UTILS.httpUtil.dataSuccess(req, res, "Success", "Notification mis à jour", "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de la notification", "1.0");
			return;
		}
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de la notification", "500", "1.0");
	}
};

/* PLUGIN HANDLERS */
/* *************** */

exports.router = [
	{
		route: "/api/com",
		handler: getComHandler,
		method: "GET",
	},

	// API NEXT
	{
		on: true,
		route: '/api/next/communications',
		method: "GET",
		handler: getCommunicationsHandler,
	}, {
		on: true,
		route: '/api/next/communications',
		method: "POST",
		handler: (req, res) => res.end('NOT IMPLEM'),
	}, {
		on: true,
		route: '/api/next/communications',
		method: "PUT",
		handler: updateCommunicationsHandler,
	}, {
		on: true,
		route: '/api/next/communications',
		method: "DELETE",
		handler: (req, res) => res.end('NOT IMPLEM'),
	},
];

exports.plugin =
{
	title: "Gestion des communications",
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
		if (!verifyRoleAccess(admin.data.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('No access rights');
			return;
		}
		if (_entity_id === 'SlEgXL3EGoi') {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}
		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.com_id) {
				try {
					const currentCom = await getComsV2({ id: req.get.com_id });
					if (currentCom.cloudinary_img_public_id) {
						await STORE.cloudinary.deleteFile(currentCom.cloudinary_img_public_id);
					}
					if (currentCom.cloudinary_pj_public_id) {
						await STORE.cloudinary.deleteFile(currentCom.cloudinary_pj_public_id);
					}
					await deleteComsV2({ id: req.get.com_id });
				} catch (error) {
					console.error('[ERROR]', error)
					res.writeHead(500);
					res.end('Internal error !');
					return;
				}
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				await pluginPostUpdateHandler(req, res);
			} else if (typeof req.body == "object" && req.multipart) {
				await pluginPostCreateHandler(req, res);
			}
		}
		else {
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _comHtml = fs.readFileSync(path.join(__dirname, "com.html")).toString();
			var _Coms = [];

			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_Coms = _Coms.concat(await getComsV2({ harbour_id: _harbour_id[i] }));
				}
			}
			else if (_role == "admin") {
				_Coms = await getComsV2({});
				// ! DEV
				_Coms = _Coms.splice(0, 50); // ! DEV
			}

			const harbousMapById = await STORE.harbourmgmt.getAllHarboursMappedById();

			var _comGen = "";
			for (var i = 0; i < _Coms.length; i++) {
				if (_Coms[i].category == "weather") {
					_Coms[i].category = "Météo";
				} else if (_Coms[i].category == "event") {
					_Coms[i].category = "Événement";
				} else if (_Coms[i].category == "maintenance") {
					_Coms[i].category = "Travaux";
				} else if (_Coms[i].category == "security") {
					_Coms[i].category = "Sécurité";
				} else if (_Coms[i].category == "other") {
					_Coms[i].category = "Autre";
				}

				if (_Coms[i].user_category == "all") {
					_Coms[i].user_category = "Tous";
				} else if (_Coms[i].user_category == "yatchsman") {
					_Coms[i].user_category = "Plaisanciers";
				} else if (_Coms[i].user_category == "visitor") {
					_Coms[i].user_category = "Visiteurs";
				}

				var date = new Date(_Coms[i].created_at || _Coms[i].date);
				const dateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

				const currentHarbour = harbousMapById[_Coms[i].harbour_id];

				_comGen += _comHtml.replace(/__ID__/g, _Coms[i].id)
					.replace(/__FORMID__/g, _Coms[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id)
					.replace(/__CATEGORY__/g, _Coms[i].category)
					.replace(/__USER_CATEGORY__/g, _Coms[i].user_category)
					.replace(/__EDITOR_ID__/g, "editor_" + _Coms[i].id.replace(/\./g, "_"))
					.replace(/__MESSAGE__/g, _Coms[i].message)
					.replace(/__LINK_NAME__/g, _Coms[i].link_name)
					.replace(/__LINK__/g, _Coms[i].link)
					.replace(/__TITLE__/g, _Coms[i].title)
					.replace(/__PJNAME__/g, _Coms[i].pjname)
					.replace(/__PJ__/g, _Coms[i].pj)
					.replace(/__IMG__/g, _Coms[i].img)
					.replace(/__DATE__/g, dateFormated)
					.replace(/__DATETIMEORDER__/g, _Coms[i].created_at)
			}
			_indexHtml = _indexHtml.replace("__COMS__", _comGen).replace(/undefined/g, '');

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';

				const getHarbourPromises = await _harbour_id.map(harbourId => STORE.harbourmgmt.getHarbours({ id: harbourId }));
				const userHarbours = await Promise.all(getHarbourPromises);
				userHarbours.flat().map(userHarbour => {
					harbour_select += '<option value="' + userHarbour.id + '">' + userHarbour.name + '</option>';
				});

				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				userHarbours = await STORE.harbourmgmt.getHarbours({});
				userHarbours.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);

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