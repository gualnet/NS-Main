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

function verifyPostReq(_req, _res) {
	if (!_req.post.user_id || _req.post.user_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur requis", "100", "1.0");
		return false;
	}
	return true;
}

exports.handler = async (req, res) => {
	const _securite = await getIncidentsV2({});
	res.end(JSON.stringify(_securite));
	return;
}

/* ************** */
/* DB HANDLERS V2 */

/**
 * 
 * @param {Partial<TYPES.T_incident>} where 
 * @returns {Promise<TYPES.T_incident[]>}
 */
const getIncidentsV2 = async (where) => {
	console.log('====getIncidentsV2====')
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Find incidents params', where);
	const getIncidentsResp = await DB_NS.securite.find(where);
	if (getIncidentsResp.error) {
		console.error(getIncidentsResp)
		throw new Error(getIncidentsResp.message, { cause: getIncidentsResp });
	}

	const incidents = getIncidentsResp.data;
	console.log(`Number of incidents found: `, incidents.length);
	return incidents;
};

/**
 * 
 * @param {Partial<Omit<TYPES.T_incident, "id">>} incident
 * @returns {Promise<TYPES.T_incident>}
 */
const createIncidentsV2 = async (incident) => {
	console.log('====createIncidentsV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;
	const createIncidentsResp = await DB_NS.securite.create(incident);
	if (createIncidentsResp.error) {
		console.error(createIncidentsResp)
		throw new Error(createIncidentsResp, { cause: createIncidentsResp });
	}
	const incidents = createIncidentsResp.data;
	console.log(`Found ${incidents.length} incident(s) items`);
	return incidents;
};

/**
 * 
 * @param {Pick<TYPES.T_incident, "id">} where 
 * @param {Partial<TYPES.T_incident>} updates 
 * @returns {Promise<TYPES.T_incident[]>}
 */
const updateIncidentsV2 = async (where, updates) => {
	console.log('====updateIncidentsV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update incidents where: ', where);
	console.log('Update incidents with: ', updates);
	const updateIncidentsResp = await DB_NS.securite.update(where, updates);
	if (updateIncidentsResp.error) {
		console.error(error);
		throw new Error(updateIncidentsResp.message, { cause: updateIncidentsResp });
	}
	const incidents = updateIncidentsResp.data;
	console.log(`${incidents.length} incident(s) Updated`);
	return incidents;
};

/**
 * 
 * @param {Pick<TYPES.T_incident, "id">} where 
 * @returns {Promise<TYPES.T_incident[]>}
 */
const deleteIncidentsV2 = async (where = {}) => {
	console.log('====deleteIncidentsV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte incidents where: ', where);
	const deleteIncidentsResp = await DB_NS.securite.delete(where);
	if (deleteIncidentsResp.error) {
		console.error(deleteIncidentsResp)
		throw new Error(deleteIncidentsResp.message, { cause: deleteIncidentsResp });
	}
	const incidents = deleteIncidentsResp.data;
	console.log(`Deleted ${incidents.length} incident(s) items`, incidents);
	return incidents;
}

/* DB HANDLERS V2 */
/* ************** */

/* ************** */
/* API HANDLERS */

async function getIncidentsHandler(req, res) {
	try {
		const where = { ...req.get };
		const places = await getIncidentsV2(where);
		res.end(JSON.stringify({ success: true, payload: places }));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'securitemgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

async function getSecuriteHandler(req, res) {
	try {
		console.info('[INFO] Handler -> /api/get/securite')
		const incidents = await getIncidentsV2({
			user_id: req.get.user_id,
			harbour_id: req.get.harbour_id,
		});
		UTILS.httpUtil.dataSuccess(req, res, "success", incidents, "200", "1.0");
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Error", "Internal Server Error", "500", "1.0");
	}
};

async function createSecuriteHandler(req, res) {
	try {
		console.info('[INFO] Handler -> /api/create/securite')
		const verifRes = verifyPostReq(req);
		console.log('verifRes', verifRes);
		console.log('req.post', req.post);
		const newIncident = {
			created_at: req.post.created_at || Date.now(),
			date: req.post.date || Date.now(),
			date_end: Date.parse(req.post.date_end) || null,
			date_start: Date.parse(req.post.date_start) || Date.now(),
			description: req.post.description || null,
			harbour_id: req.post.harbour_id || null,
			status: req.post.status || 'open',
			token: req.post.token || null,
			type: req.post.type || null,
			updated_at: req.post.updated_at || null,
			user_id: req.post.user_id || null,
			zone: req.post.zone || null,
		};
		console.log('newIncident', newIncident);

		const createdIncident = await createIncidentsV2(newIncident);
		console.log('createdIncident', createdIncident);
		if (createdIncident.id) {
			var date = new Date(createdIncident.date_start);
			var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

			/**@type {import('../../types').T_harbour} */
			const [harbour] = await STORE.harbourmgmt.getHarbours({ id: createdIncident.harbour_id });
			const user = await STORE.usermgmt.getUsers({ id: createdIncident.user_id });
			var zone = await STORE.mapmgmt.getZoneById(createdIncident.zone);

			var subject = `Declaration d'incident le ${dateFormated}`;
			var body = `
					<img id="logo" src="https://api.nauticspot.io/images/logo.png" alt="Nauticspot logo" style="width: 30%;">
					<h1>Bonjour</h1>
					<p style="font-size: 13pt">
							Le plaisancier <B>${user.first_name || ''} ${user.last_name || ''}</B> a déclaré un incident.
					</p>
					<p style="font-size: 13pt">
							Type: ${ENUM.incidentsTypes[`${createdIncident.type}`] || 'type d\'incident non renseignée'}.</BR>
							Zone: ${zone.name || 'zone non renseignée'}.</BR>
							Description: ${createdIncident.description || 'pas de description'}.
					</p>
					<p style="font-size: 12pt">À bientôt,</p>
					<p style="font-size: 12pt">L'équipe Nauticspot</p>
					`;

			const sendTo = harbour.email_incident || harbour.email;
			if (sendTo.includes(';')) {
					const emails = sendTo.split(';');
					emails.map(async (email) => await STORE.mailjet.sendHTML(harbour.id_entity, email, harbour.name, subject, body))
			} else {
					await STORE.mailjet.sendHTML(harbour.id_entity, sendTo, harbour.name, subject, body);
			}
			UTILS.httpUtil.dataSuccess(req, res, "success", createdIncident, "1.0");
			return;
		}
		else {
			UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
			return;
		}
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'incident", "500", "1.0");
	}

};

const deleteIncidentApiHandler = async (req, res) => {
	try {
		console.log('====deleteIncidentApiHandler====')
		const deletedIncident = await deleteIncidentsV2(req.get);
		res.writeHead(200, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			results: deletedIncident,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'securitemgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

async function getIncidentTypesHandler(req, res) {
	try {
		res.end(JSON.stringify({
			results: ENUM.incidentsTypes,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'securitemgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}

};

/* API HANDLERS */
/* ************** */

/* *************** */
/* PLUGIN HANDLERS */

const pluginPostCreateHandler = async (req, res) => {
	try {
		if (!verifyPostReq(req, res)) return;

		/**@type {Omit<TYPES.T_incident, "id">} */
		const newIncident = {
			created_at: req.post.created_at || Date.now(),
			date_end: Date.parse(req.post.date_end) || null,
			date_start: Date.parse(req.post.date_start) || null,
			description: req.post.description || null,
			harbour_id: req.post.harbour_id || null,
			resolution: req.post.resolution || null,
			status: req.post.status || null,
			token: req.post.token || null,
			type: req.post.type || null,
			updated_at: req.post.updated_at || null,
			user_id: req.post.user_id || null,
			zone: req.post.zone || null,
		};

		const createdIncident = await createIncidentsV2(newIncident);
		if (createdIncident.id) {
			UTILS.httpUtil.dataSuccess(req, res, "Success", "Securite créé", "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'événement", "1.0");
			return;
		}
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'incident", "500", "1.0");
	}
};

const pluginPostUpdateHandler = async (req, res, admin) => {
	try {
		const userRole = admin.data.roleBackOffice;
		const closeIncidentAuthorized = [ROLES.AGENT_SUPERVISEUR, userRole.ADMIN_MULTIPORTS, userRole.SUPER_ADMIN];
		if (req.post.status === 'closed' && !closeIncidentAuthorized.includes(userRole)) {
			res.writeHead(401);
			res.end(JSON.stringify({
				message: 'No access rights',
				description: 'Vous ne disposez pas des droits requis pour clôturer cet incident.'
			}));
			return;
		}
		console.log('req.post', req.post)
		const [currentIncident] = await getIncidentsV2({ id: req.post.id });
		const incidentId = req.post.id;
		/**@type {Partial<Omit<TYPES.T_incident, "id">>} */
		const incidentUpdates = {
			created_at: req.post.created_at || currentIncident.created_at,
			date: req.post.date || currentIncident.date,
			date_end: Date.parse(req.post.date_end) || currentIncident.date_end,
			date_start: Date.parse(req.post.date_start) || currentIncident.date_start,
			description: req.post.description || currentIncident.description,
			harbour_id: req.post.harbour_id || currentIncident.harbour_id,
			resolution: req.post.resolution || currentIncident.resolution,
			status: req.post.status || currentIncident.status,
			token: req.post.token || currentIncident.token,
			type: req.post.type || currentIncident.type,
			updated_at: req.post.updated_at || Date.now(),
			user_id: req.post.user_id || currentIncident.user_id,
			zone: req.post.zone || currentIncident.zone,
		};

		const [updatedIncident] = await updateIncidentsV2({ id: incidentId }, incidentUpdates);
		if (!updatedIncident) {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
			return;
		}
		UTILS.httpUtil.dataSuccess(req, res, "Success", "Securite mis à jour", "1.0");
		return;
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'incident", "500", "1.0");
	}
};

/* PLUGIN HANDLERS */
/* *************** */

exports.router =
	[
		{
			route: "/api/get/securite",
			handler: getSecuriteHandler,
			method: "GET",
		},
		{
			route: "/api/create/securite",
			handler: createSecuriteHandler,
			method: "POST",
		},
		{
			on: true,
			route: "/api/next/incident-types",
			handler: getIncidentTypesHandler,
			method: "GET",
		},
		{
			on: true,
			route: "/api/next/incidents",
			handler: getIncidentsHandler,
			method: "GET",
		},
		{
			on: true,
			route: "/api/next/incidents",
			handler: deleteIncidentApiHandler,
			method: "DELETE",
		},
	];

exports.plugin =
{
	title: "Gestion des incidents",
	desc: "",
	handler: async (req, res) => {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

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

		var _role = admin.role;
		var _type = admin.data.type;
		var _entity_id = admin.data.entity_id;
		var _harbour_id = admin.data.harbour_id;

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('No access rights');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.securite_id) {
				// await delSecurite(req.get.securite_id);
				try {
					await deleteIncidentsV2({ id: req.get.securite_id });
				} catch (error) {
					console.log('error', error);
					UTILS.dataError(req, res, "Error", "Erreur lors de la suppression de l'incident", "500", "1.0");
				}
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				await pluginPostUpdateHandler(req, res, admin);
			}
			else if (typeof req.body == "object" && req.multipart) {
				await pluginPostCreateHandler(req, res);
			}
		}
		else {
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _securiteHtml = fs.readFileSync(path.join(__dirname, "securite.html")).toString();

			var _Securites = [];
			try {
				if (_role == "user") {
					for (var i = 0; i < _harbour_id.length; i++) {
						_Securites = _Securites.concat(await getIncidentsV2({ harbour_id: _harbour_id[i] }));
					}
				}
				else if (_role == "admin") {
					_Securites = await getIncidentsV2({});
				}
			} catch (error) {
				console.error(error)
				const errorDiv = `
							<div style="display: block;" id="error" class="alert alert-danger" role="alert">Une erreur est survenue lors de la recupération des données</div>
							`;
				_indexHtml = _indexHtml
					.replace('<div id="harbourError"></div>', errorDiv)
					.replace('__HARBOUR_ID_INPUT__', '')
					.replace('__SECURITES__', '')
				res.setHeader("Content-Type", "text/html");
				res.end(_indexHtml);
				return;
			}

			var _securiteGen = "";
			var statusoptions = "";
			for (var i = 0; i < _Securites.length; i++) {
				if (_Securites[i].category == "securite") {
					_Securites[i].category = "événement";
				}

				let formatedDate = '-';
				if (_Securites[i].created_at || _Securites[i].date) {
					const dateObj = new Date(_Securites[i].created_at || _Securites[i].date)
					const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
					const date = splited[0];
					const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
					formatedDate = `${date} à ${heure}`;
				}

				let startDateFormated;
				if (_Securites[i].date_start) {
					const date = new Date(_Securites[i].date_start);
					startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				} else {
					startDateFormated = '';
				}

				let endDateFormated;
				if (_Securites[i].date_end) {
					const date = new Date(_Securites[i].date_end);
					endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				} else {
					endDateFormated = '';
				}

				const currentHarbour = await STORE.harbourmgmt.getHarbourById(_Securites[i].harbour_id);
				/**@type {[TYPES.T_user | undefined]} */
				const [currentUser] = await STORE.usermgmt.getUsers({ id: _Securites[i].user_id });
				const currentZone = await STORE.mapmgmt.getZoneById(_Securites[i].zone);

				if (_Securites[i].status == "open") {
					statusoptions = '<option value="open" selected>ouvert</option><option value="closed">clôturé</option>'
				} else {
					statusoptions = '<option value="open">ouvert</option><option value="closed" selected>clôturé</option selected>'
				}
				_securiteGen += _securiteHtml.replace(/__ID__/g, _Securites[i].id)
					.replace(/__FORMID__/g, _Securites[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__ZONE__/g, currentZone.name)
					.replace(/__USER_NAME__/g, `${currentUser?.first_name} ${currentUser?.last_name}`)
					.replace(/__DESCRIPTION__/g, _Securites[i].description)
					.replace(/__RESOLUTION__/g, _Securites[i].resolution)
					.replace(/__DATE_START__/g, startDateFormated)
					.replace(/__DATE_END__/g, endDateFormated)
					.replace(/__STATUS__/g, statusoptions)
					.replace(/__CREATED_AT__/g, formatedDate)
			}
			_indexHtml = _indexHtml.replace("__SECURITES__", _securiteGen).replace(/undefined/g, '');

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Séléction du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id" id="harbourDropdown">';
				for (var i = 0; i < _harbour_id.length; i++) {
					const harbours = await STORE.harbourmgmt.getHarbours({ id: _harbour_id[i] })
					userHarbours[i] = harbours[0];
					harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
				}
				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Séléction du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id" id="harbourDropdown">';
				userHarbours = await STORE.harbourmgmt.getHarbours({});
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