const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');
const { errorHandler } = require('../lib-js/errorHandler');

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
	if (!_req.post.title || _req.post.title.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
		return false;
	}
	if (!_req.post.content || _req.post.content.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Contenu requis", "100", "1.0");
		return false;
	}
	if (!_req.post.description || _req.post.description.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Description requise", "100", "1.0");
		return false;
	}
	if (_req.post.description.length > 255) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "La description ne doit pas dépasser 255 caractères", "100", "1.0");
		return false;
	}
	if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
		return false;
	}
	if (!_req.post.date_start) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Date de début requise", "100", "1.0");
		return false;
	}
	// if (!_req.post.date_end) {
	//     UTILS.httpUtil.dataError(_req, _res, "Error", "Date de fin requis", "100", "1.0");
	//     return false;
	// }
	/*
	if (!_req.post.category == "events" || !_req.post.category == "event") {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
			return false;
	}
	if (_req.post.pj && !_req.post.pjname || _req.post.pjname.length < 1) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de la pièce jointe requise", "100", "1.0");
			return false;
	}*/
	return true;
}

// * ************** *
// * DB HANDLERS V2 *

/**
 * 
 * @param {*} searchOpt 
 * @returns {Promise<TYPES.T_event[]>}
 */
const getEventsV2 = async (searchOpt) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Find events with searchOpt', searchOpt);
	const findEventsResp = await DB_NS.events.find(searchOpt);
	if (findEventsResp.error) {
		console.error('[ERROR]', findEventsResp);
		throw new Error(findEventsResp.message, { cause: findEventsResp });
	}
	console.log('Found events', findEventsResp.data.length);

	return (findEventsResp.data);
}

/**
 * 
 * @param {TYPES.T_event} obj 
 * @returns {Promise<TYPES.T_event>}
 */
const createEventV2 = async (obj) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createEventResp = await DB_NS.events.create(obj);
	if (createEventResp.error) {
		throw new Error(createEventResp, { cause: createEventResp });
	}
	console.log('createEventResp.data', createEventResp.data)
	return createEventResp.data;
};

/**
 * 
 * @param {Pick<TYPES.T_event, "id">} where 
 * @param {Partial<TYPES.T_event>} updates 
 * @returns {Promise<TYPES.T_event[]>}
 */
const updateEventsV2 = async (where, updates) => {
	console.log('====updateEventsV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update events where: ', where);
	console.log('Update events with: ', updates);
	const updateEventsResp = await DB_NS.events.update(where, updates);
	if (updateEventsResp.error) {
		throw new Error(updateEventsResp.message, { cause: updateEventsResp });
	}
	const events = updateEventsResp.data;
	console.log(`${events.length} event(s) Updated`);
	return events;
};

/**
 * 
 * @param {*} searchOpt 
 * @returns {Promise<TYPES.T_event[]>}
 */
const deleteEventsV2 = async (searchOpt) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Delete event by:', searchOpt);
	const deleteEventsResp = await DB_NS.events.delete(searchOpt);
	if (deleteEventsResp.error) {
		throw new Error(deleteEventsResp.message, { cause: deleteEventsResp });
	}
	const deletedEvents = deleteEventsResp.data;
	console.log('deletedEvents', deletedEvents);
	return deletedEvents;
}

// * DB HANDLERS V2 *
// * ************** *

// * ************ *
// * API HANDLERS *

async function getEventHandler(req, res) {
	try {
		const events = await getEventsV2({ id: req.get.id });
		UTILS.httpUtil.dataSuccess(req, res, "success", events, "1.0");
	} catch (error) {
		console.log('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", error.toString(), "500", "1.0");
	}
};

async function getEventsByHarbourIdHandler(req, res) {
	try {
		const events = await getEventsV2({ harbour_id: req.param.harbour_id });
		UTILS.httpUtil.dataSuccess(req, res, "success", events, "1.0");
	} catch (error) {
		console.log('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", error, "500", "1.0");
	}
};

const createNewEventHandler = async (req, res) => {
	console.log('===createNewEventHandler===');
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		// CHECK IF TITLE ALREADY EXISTS
		const events = await getEventsV2({ title: req.post.title });
		if (events?.length > 0) {
			throw new Error("This event title already exists", { cause: { httpCode: "409", publicMsg: "This event title already exists" } });
		}

		if (typeof req.post.date_start === "number") {
			// transform en tring DD/MM/YYYY
			req.post.date_start = new Date(req.post.date_start).getTime();
		}
		if (typeof req.post.date_end === "number") {
			// transform en tring DD/MM/YYYY
			req.post.date_end = new Date(req.post.date_end).getTime();
		}

		/**@type {TYPES.T_event} */
		const newEvent = {
			title: req.post.title,
			description: req.post.description,
			content: req.post.content,
			img: req.post.img,
			harbour_id: req.post.harbour_id,
			category: req.post.category,
			cloudinary_img_public_id: req.post.cloudinary_img_public_id,
			date_start: req.post.date_start,
			date_end: req.post.date_end,
			created_at: new Date(Date.now()).getTime(),
			date: new Date(Date.now()).getTime(),
		}

		const createdEvent = await createEventV2(newEvent);
		console.log('createdEvent', createdEvent);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			event: createdEvent,
		}));
	} catch (error) {
		errorHandler(res, error);
	}
};

// * API HANDLERS *
// * ************ *

// * *************** *
// * PLUGIN HANDLERS *

const pluginPostUpdateHandler = async (req, res) => {
	try {
		const eventId = req.post.id;
		const events = await getEventsV2({ id: eventId });
		const currentEvent = events[0];
		if (!currentEvent) {
			throw new Error('Event to update not found');
		}

		const newEvent = req.post;
		delete newEvent.id;
		newEvent.updated_at = Date.now();

		newEvent.date_start = Date.parse(newEvent.date_start);
		newEvent.date_end = Date.parse(newEvent.date_end);

		//img gesture
		if (newEvent.img) {
			const upload = await STORE.cloudinary.uploadFile(newEvent.img, req.field["img"].filename);
			newEvent.img = upload.secure_url;
			newEvent.cloudinary_img_public_id = upload.public_id;
			if (currentEvent.cloudinary_img_public_id) {
				await STORE.cloudinary.deleteFile(currentEvent.cloudinary_img_public_id);
			}

		}

		//pj gesture
		if (newEvent.pj) {
			const upload = await STORE.cloudinary.uploadFile(newEvent.pj, req.field["pj"].filename, "slug");;
			newEvent.pj = upload.secure_url;
			newEvent.cloudinary_pj_public_id = upload.public_id;
			if (currentEvent.cloudinary_pj_public_id) {
				await STORE.cloudinary.deleteFile(currentEvent.cloudinary_pj_public_id);
			}
		}

		// const updatedEvent = await updateEvent(newEvent);
		const updatedEvent = await updateEventsV2({ id: eventId }, newEvent);
		console.log('updatedEvent', updatedEvent);
		if (updatedEvent[0].id) {
			UTILS.httpUtil.dataSuccess(req, res, "Success", "événement mis à jour", "1.0");
			return;
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
			return;
		}
	} catch (error) {
		console.error('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
	}

};

const pluginPostCreateHandler = async (req, res) => {
	console.log('\n====pluginPostCreateHandler====');
	try {
		if (typeof req.body == "object" && req.multipart) {
			if (!verifyPostReq(req, res)) {
				return;
			}
			// const newEvent = req.post;
			/**@type {Omit<TYPES.T_event, "id">} */
			const newEvent = {
				category: 'event' || null,
				cloudinary_img_public_id: null,
				content: req.post.content || null,
				date: Date.now() || null,
				date_end: Date.parse(req.post.date_end) || null,
				date_start: Date.parse(req.post.date_start) || null,
				description: req.post.description || null,
				harbour_id: req.post.harbour_id || null,
				img: null,
				pj: null,
				title: req.post.title || null,
			};

			//img gesture
			if (newEvent.img) {
				var upload = await STORE.cloudinary.uploadFile(newEvent.img, req.field["img"].filename);
				console.log(upload);
				newEvent.img = upload.secure_url;
				newEvent.cloudinary_img_public_id = upload.public_id;
			}

			//pj gesture
			if (newEvent.pj) {
				var upload = await STORE.cloudinary.uploadFile(newEvent.pj, req.field["pj"].filename, "slug");
				console.log(upload);
				newEvent.pj = upload.secure_url;
				newEvent.cloudinary_pj_public_id = upload.public_id;
			}

			const createdEvent = await createEventV2(newEvent);
			console.log('createdEvent', createdEvent);
			if (createdEvent.id) {
				UTILS.httpUtil.dataSuccess(req, res, "Success", "Event créé", "1.0");
				return;
			} else {
				throw new Error("Erreur lors de la création de l'événement");
			}
		}
	} catch (error) {
		console.error('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'événement", "500", "1.0");
	}
};

const pluginGetDeleteHandler = async (req) => {
	const [currentEvent] = await getEventsV2({ id: req.get.event_id });
	if (currentEvent?.cloudinary_img_public_id) {
		await STORE.cloudinary.deleteFile(currentEvent.cloudinary_img_public_id);
	}
	if (currentEvent?.cloudinary_pj_public_id) {
		await STORE.cloudinary.deleteFile(currentEvent.cloudinary_pj_public_id);
	}
	await deleteEventsV2({ id: req.get.event_id });
}

// * PLUGIN HANDLERS *
// * *************** *


exports.handler = async (req, res) => {
	const _event = await getEventsV2();
	res.end(JSON.stringify(_event));
	return;
}

exports.router =
	[
		{
			route: "/api/event/",
			handler: getEventHandler,
			method: "GET",
		},
		{
			route: "/api/events/:harbour_id",
			handler: getEventsByHarbourIdHandler,
			method: "GET",
		},
		{
			method: "POST",
			route: "/api/event",
			handler: createNewEventHandler,
		},
	];

exports.plugin =
{
	title: "Gestion des événements",
	desc: "",
	handler: async (req, res) => {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id });
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
			res.end('Accès non autorisé');
			return;
		}
		if (_entity_id === 'SlEgXL3EGoi') { // No Access for Marigot users
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}

		console.log('PLUGIN EVENT METHOD', req.method)
		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.event_id) {
				try {
					await pluginGetDeleteHandler(req);
				} catch (error) {
					console.error('[ERROR]', error);
					UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la suppression de l'événement", "500", "1.0");
					return;
				}
			}
		}
		if (req.method == "POST") {
			if (req.post.id && verifyPostReq(req, res)) {
				await pluginPostUpdateHandler(req, res);
			} else {
				await pluginPostCreateHandler(req, res);
			}
		}
		else {
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _eventHtml = fs.readFileSync(path.join(__dirname, "event.html")).toString();

			var _Events = [];
			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_Events = _Events.concat(await getEventsV2({ harbour_id: _harbour_id[i] }));
				}
			}
			else if (_role == "admin") {
				try {
					_Events = await getEventsV2({});
				} catch (error) {
					console.error(error);
					UTILS.httpUtil.dataError(req, res, "Error", error, "1.0");
					return;
				}
				_Events = _Events.splice(0, 500);
			}

			const harboursMapById = await STORE.harbourmgmt.getAllHarboursMappedById();
			var _eventGen = "";
			for (var i = 0; i < _Events.length; i++) {
				if (_Events[i].category == "event") {
					_Events[i].category = "événement";
				}

				let formatedDate = '-';
				if (_Events[i].date) {
					const dateObj = new Date(_Events[i].date)
					const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
					const date = splited[0];
					const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
					formatedDate = `${date} à ${heure}`;
				}

				date = new Date(_Events[i].date_start);
				var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				date = new Date(_Events[i].date_end);
				var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
				const currentHarbour = harboursMapById[_Events[i].harbour_id] || undefined;

				_eventGen += _eventHtml.replace(/__ID__/g, _Events[i].id)
					.replace(/__FORMID__/g, _Events[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id)
					.replace(/__CATEGORY__/g, _Events[i].category)
					.replace(/__EDITOR_DESC_ID__/g, "editor_desc_" + _Events[i].id.replace(/\./g, "_"))
					.replace(/__DESCRIPTION__/g, _Events[i].description)
					.replace(/__EDITOR_ID__/g, "editor_" + _Events[i].id.replace(/\./g, "_"))
					.replace(/__CONTENT__/g, _Events[i].content)
					.replace(/__TITLE__/g, _Events[i].title)
					.replace(/__DATE_START__/g, startDateFormated)
					.replace(/__DATE_END__/g, endDateFormated)
					.replace(/__PJNAME__/g, _Events[i].pjname)
					.replace(/__PJ__/g, _Events[i].pj)
					.replace(/__IMG__/g, _Events[i].img)
					.replace(/__DATE__/g, formatedDate)
					.replace(/__DATETIMEORDER__/g, _Events[i].date)
			}
			_indexHtml = _indexHtml.replace("__EVENTS__", _eventGen).replace(/undefined/g, '');

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';

				_harbour_id.map(harbourId => {
					const harbour = harboursMapById[harbourId];
					harbour_select += '<option value="' + harbour.id + '">' + harbour.name + '</option>';
				})

				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				userHarbours = await STORE.harbourmgmt.getHarbours();
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
