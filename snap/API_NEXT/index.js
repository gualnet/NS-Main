// REST
// GET
// POST
// PUT replaces the resource in its entirety. Use PATCH if request updates part of the resource. we dont use patch here yet
// DELETE
const TYPES = require('../../types');
const ENUMS = require('../lib-js/enums')

const TABLES = ENUMS.TABLES;

exports.setup = {
	on: true,
	title: 'API NEXT',
	description: 'some next level endpoints',
	version: '1.2.0',
	api: true,
}

exports.handler = async (req, res) => {
	res.end('Hello Snap!');
}

// GET
async function getElements(tableName, whereOptions) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Find(tableName, whereOptions, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
};
// CREATE
async function createElement(tableName, obj) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Create(tableName, obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
};
// UPDATE
async function updateElement(tableName, searchObj, updateObj) {
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Update(tableName, searchObj, updateObj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
};
// DELETE
async function deleteElement(tableName, searchObj) {
	if (Object.keys(searchObj).length < 1) {
		throw (new Error('Must specify at least 1 search value'));
	}
	return new Promise((resolve, reject) => {
		STORE.db.linkdb.Delete(tableName, searchObj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				reject(_err);
		});
	});
};

exports.store = {
	getElements,
	createElement,
	updateElement,
	deleteElement,
};

// USERS
const getUsersHandler = async (req, res) => {
	console.log('getUsersHandler');
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		console.log('req.get', req.get)
		const searchOpt = { ...req.get };
		const findUserResp = await DB_NS.user.find(searchOpt);
		if (findUserResp.error) {
			throw new Error(findUserResp.error);
		}
		const users = findUserResp.data;

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			usersCount: users.length,
			users: users,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createUsersHandler = async (req, res) => {
	console.log('createUsersHandler')
	try {
		console.log('req.body', req.body)
		const emptyUser = {
			boat_id: null,
			category: null,
			contract_number: null,
			created_at: null,
			email: null,
			enabled: null,
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
			show_communication_module: null,
			show_reporting_module: null,
			show_security_module: null,
			token: null,
			updated_at: null,
			username: null,
		};
		/**@type {TYPES.T_user} */
		const newUser = { ...emptyUser, ...req.body };
		newUser.created_at = Date.now();

		const createdUser = await createElement(TABLES.USERS, newUser);
		console.log('Created User', createdUser);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			user: createdUser,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const updateUsersHandler = async (req, res) => {
	console.log('updateUsersHandler')
	try {
		const searchObj = { ...req.get };
		const updteObj = { ...req.body };

		/**@type {TYPES.T_user} */
		const updatedUser = await updateElement(TABLES.USERS, searchObj, updteObj);
		console.log('Updated User', updatedUser)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			user: updatedUser,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const deleteUsersHandler = async (req, res) => {
	console.log('deleteUsersHandler')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const searchObj = { ...req.get };

		const deleteUserResp = await DB_NS.user.delete(searchObj);
		if (deleteUserResp.error) {
			throw new Error(deleteUserResp.error);
		}
		const deletedUsers = deleteUserResp.data;

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedUsers.length,
			users: deletedUsers,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};


// BOATS
const getBoatsHandler = async (req, res) => {
	console.log('getBoatsHandler');
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		console.log('req.get', req.get)
		const searchOpt = { ...req.get };
		const findBoatResp = await DB_NS.boat.find(searchOpt);
		console.log('findBoatResp', findBoatResp)
		if (findBoatResp.error) {
			throw new Error(findBoatResp.error);
		}
		const boats = findBoatResp.data;

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			usersCount: boats.length,
			boats: boats,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createBoatsHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		console.log('createBoatsHandler')
		console.log('req.body', req.body);
		const { place_id, name, immatriculation,
			is_resident, user_id, harbour_id } = req.body;

		const createBoatResp = await DB_NS.boat.create({
			place_id,
			name,
			immatriculation,
			is_resident,
			user_id,
			harbour_id,
		});
		console.log('createBoatResp', createBoatResp)
		if (createBoatResp.error) {
			throw new Error(createBoatResp.message, { cause: createBoatResp });
		}
		const createdBoat = createBoatResp.data;
		console.log('Created Boat', createdBoat);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			boat: createdBoat,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const updateBoatsHandler = async (req, res) => {
	console.log('updateBoatsHandler')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const searchObj = { ...req.get };
		const updateObj = { ...req.body, updated_at: Date.now() };

		if (Object.keys(searchObj).length < 1) {
			throw new (Error('You must specify at least one search param'));
		}

		const updateBoatResp = await DB_NS.boat.update(searchObj, updateObj);
		if (updateBoatResp.error) {
			throw new Error(updateBoatResp.message, { cause: updateBoatResp });
		}
		const updatedBoats = updateBoatResp.data;

		console.log('Updated Boats', updatedBoats)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: updatedBoats.length,
			boats: updatedBoats,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const deleteBoatsHandler = async (req, res) => {
	console.log('deleteBoatsHandler')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const searchObj = { ...req.get };

		// /**@type {Array<TYPES.T_boat>} */
		// const deletedObj = await deleteElement(TABLES.BOATS, searchObj);

		const deleteUserResp = await DB_NS.boat.delete(searchObj);
		if (deleteUserResp.error) {
			throw new Error(deleteUserResp.error);
		}
		const deletedUsers = deleteUserResp.data;


		console.log('Deleted boats', deletedUsers)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedUsers.length,
			boats: deletedUsers,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

// ABSENCES
const getAbsencesHandler = async (req, res) => {
	console.log('getAbsencesHandler');
	try {
		console.log('req.get', req.get)
		const searchOpt = { ...req.get };
		/** @type {Array<TYPES.T_absence>} */
		const boats = await getElements(TABLES.ABSENCES, searchOpt);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			boatsCount: boats.length,
			boats: boats,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createAbsencesHandler = async (req, res) => {
	console.log('createAbsencesHandler')
	try {
		// console.log('req.body', req.body);
		const { date_end, date_start, boat_id,
			harbour_id, user_id } = req.body;
		if (!boat_id) throw (new Error('boat id is missing'));
		if (!date_start) throw (new Error('date_start is missing'));
		if (!date_end) throw (new Error('date_end is missing'));
		const newAbsence = {
			boat_id: boat_id || null,
			created_at: Date.now(),
			date_end: date_end || null,
			date_start: date_start || null,
			harbour_id: harbour_id || null,
			id: null,
			previous_date_end: null,
			previous_date_start: null,
			token: null,
			updated_at: null,
			user_id: user_id || null,
		};
		/**@type {TYPES.T_absence} */
		const createdAbsence = await createElement(TABLES.ABSENCES, newAbsence);
		console.log('Created Boat', createdAbsence);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			boat: createdBoat,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const updateAbsencesHandler = async (req, res) => {
	console.log('updateAbsencesHandler')
	try {
		const searchObj = { ...req.get };
		const updteObj = { ...req.body };

		/**@type {Array<TYPES.T_absence>} */
		const updatedAbsences = await updateElement(TABLES.ABSENCES, searchObj, updteObj);
		console.log('Updated Boats', updatedAbsences)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: updatedAbsences.length,
			boats: updatedAbsences,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const deleteAbsencesHandler = async (req, res) => {
	console.log('deleteAbsencesHandler');
	try {
		const searchObj = { ...req.get };
		/**@type {Array<TYPES.T_absence>} */
		const deletedObj = await deleteElement(TABLES.ABSENCES, searchObj);
		console.log('Deleted absence', deletedObj)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedObj.length,
			boats: deletedObj,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

// OUTINGS
const getSortiesHandler = async (req, res) => {
	try {
		const searchOpt = { ...req.get };
		/** @type {Array<TYPES.T_sortie>} */
		const outings = await getElements(TABLES.SORTIES, searchOpt);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			outingsCount: outings.length,
			outings: outings,
		}));
	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createSortiesHandler = async (req, res) => {
	try {
		const { place_id, boat_id, harbour_id, datetime_out,
			datetime_in, duration, is_notification_sent } = req.body;
		if (!boat_id) throw (new Error('boat id is missing'));
		if (!date_start) throw (new Error('date_start is missing'));
		if (!date_end) throw (new Error('date_end is missing'));
		const newOuting = {
			place_id: place_id || null,
			boat_id: boat_id || null,
			harbour_id: harbour_id || null,
			datetime_out: datetime_out || null,
			datetime_in: datetime_in || null,
			duration: duration || null,
			is_notification_sent: is_notification_sent || null,
			created_at: Date.now(),
			edited_at: null,
			deleted_at: nulll
		};
		/**@type {TYPES.T_sortie} */
		const createdOuting = await createElement(TABLES.SORTIES, newOuting);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			outing: createdOuting,
		}));
	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
}

const deleteSortiesHandler = async (req, res) => {
	try {
		console.log('deleteSortiesHandler')
		const searchObj = { ...req.get };

		/**@type {Array<TYPES.T_sortie>} */
		const deletedObj = await deleteElement(TABLES.SORTIES, searchObj);
		console.log('Deleted sorties', deletedObj)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedObj.length,
			sorties: deletedObj,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

// Zones
const getZonesHandler = async (req, res) => {
	try {
		console.log('getZonesHandler')
		const searchOpt = { ...req.get };
		// console.log('searchOpt', searchOpt)
		/** @type {Array<TYPES.T_zone>} */
		const foundObj = await getElements(TABLES.ZONES, searchOpt);
		console.log('found zones', foundObj)
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: foundObj.length,
			zones: foundObj,
		}));
	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createZonesHandler = async (req, res) => {
	try {
		console.log('createZonesHandler');
		// console.log('req.body', req.body);
		const { harbour_id, name, type } = req.body;
		// Validation
		if (!harbour_id) throw (new Error('harbour_id is missing'));
		if (!name) throw (new Error('name is missing'));
		if (!type) throw (new Error('type is missing'));
		const newZone = {
			id: null,
			harbour_id: req.body.harbour_id || null,
			name: req.body.name || null,
			type: req.body.type || null,
		};
		/**@type {TYPES.T_zone} */
		const createdZone = await createElement(TABLES.ZONES, newZone);
		console.log('Created zone', createdZone);

		res.end(JSON.stringify({
			success: true,
			count: zones.length,
			zones: zones,
		}));
	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const updateZonesHandler = async (req, res) => {
	try {
		console.log('updateZonesHandler');
		// console.log('req.body', req.body);
		const searchObj = { ...req.get };
		const updateObj = { ...req.body };

		if (Object.keys(searchObj).length < 1) {
			throw new Error('You must specify at least one search param');
		}

		/**@type {Array<TYPES.T_zone>} */
		const updatedZone = await updateElement(TABLES.ZONES, searchObj, updateObj);
		console.log('Updated zone', updatedZone);

		res.end(JSON.stringify({
			success: true,
			count: updatedZone.length,
			zones: updatedZone,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deleteZonesHandler = async (req, res) => {
	try {
		console.log('deleteZonesHandler')
		const searchObj = { ...req.get };

		/**@type {Array<TYPES.T_zone>} */
		const deletedObj = await deleteElement(TABLES.ZONES, searchObj);
		console.log('Deleted zones', deletedObj)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedObj.length,
			zones: deletedObj,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

// EVENTS - events
const getEventsHandler = async (req, res) => {
	try {
		/// console.log('getEventsHandler')
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const searchOpt = { ...req.get };
		/** @type {Array<TYPES.T_e>} */
		const findEventsResp = await DB_NS.events.find(searchOpt);
		console.log('findEventsResp', findEventsResp);
		if (findEventsResp.error) {
			console.error('findEventsResp', findEventsResp);
			throw new Error(findEventsResp.message, { cause: findEventsResp });
		}
		const foundEvents = findEventsResp.data;
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: foundEvents.length,
			events: foundEvents,
		}));
	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createEventsHandler = async (req, res) => {
	console.log('createEventsHandler')
	try {
		console.log('req.body', req.body)
		const emptyEvent = {
			harbour_id: null,
			title: null,
			date_start: null,
			date_end: null,
			img: null,
			content: null,
			description: null,
			date: null,
			category: null,
			cloudinary_img_public_id: null,
			id: null,
		};
		/**@type {TYPES.T_event} */
		const newEvent = { ...emptyEvent, ...req.body };
		newEvent.created_at = Date.now();
		newEvent.date = newEvent.created_at

		const createdEvent = await createElement(TABLES.EVENTS, newEvent);
		console.log('Created Event', createdEvent);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			event: createdEvent,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const updateEventsHandler = async (req, res) => {
	console.log('updateEventsHandler')
	try {
		const searchObj = { ...req.get };
		const updteObj = { ...req.body };

		/**@type {TYPES.T_event} */
		const updatedEvent = await updateElement(TABLES.EVENTS, searchObj, updteObj);
		console.log('Updated Event', updatedEvent)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			event: updatedEvent,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deleteEventsHandler = async (req, res) => {
	try {
		console.log('deleteEventsHandler')
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		const searchObj = { ...req.get };

		if (Object.keys(searchObj).length < 1) {
			throw new Error('Empty search parameters, at least 1 param must be provided.');
		}

		/**@type {Array<TYPES.T_event>} */
		const deleteEventResp = await DB_NS.events.delete(searchObj);
		if (deleteEventResp.error) {
			console.error('deleteEventResp', deleteEventResp);
			throw new Error(deleteEventResp.message, { cause: deleteEventResp });
		}
		const deletedEvent = deleteEventResp.data;
		console.log('Deleted event', deletedEvent)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedEvent.length,
			events: deletedEvent,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};


// OFFERS
const getOffersHandler = async (req, res) => {
	try {
		console.log('getOffersHandler')
		const searchOpt = { ...req.get };
		// console.log('searchOpt', searchOpt)
		/** @type {Array<TYPES.T_offer>} */
		const foundObj = await getElements(TABLES.OFFERS, searchOpt);
		console.log('Found Offers', foundObj)
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: foundObj.length,
			offers: foundObj,
		}));
	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createOffersHandler = async (req, res) => {
	console.log('createOffersHandler')
	try {
		console.log('req.body', req.body)
		const emptyOffer = {
			content: null,
			created_at: null,
			date_end: null,
			date_start: null,
			deleted_at: null,
			description: null,
			harbour_id: null,
			id: null,
			img: null,
			title: null,
			updated_at: null,
		};
		/**@type {TYPES.T_offer} */
		const newOffer = { ...emptyOffer, ...req.body };
		newOffer.created_at = new Date().toLocaleString();
		console.log('newOffer', newOffer);

		const createdOffer = await createElement(TABLES.OFFERS, newOffer);
		console.log('Created Offer', createdOffer);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: createdOffer,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error,
		}));
	}
};

const updateOffersHandler = async (req, res) => {
	console.log('updateOffersHandler')
	try {
		const searchObj = { ...req.get };
		const updteObj = { ...req.body };

		/**@type {TYPES.T_offer} */
		const updatedOffer = await updateElement(TABLES.OFFERS, searchObj, updteObj);
		console.log('Updated Offer', updatedOffer)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: updatedOffer,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deleteOffersHandler = async (req, res) => {
	try {
		console.log('deleteOffersHandler')
		const searchObj = { ...req.get };

		if (Object.keys(searchObj).length < 1) {
			throw new Error('Empty search parameters, at least 1 param must be provided.');
		}

		/**@type {Array<TYPES.T_event>} */
		const deletedObj = await deleteElement(TABLES.OFFERS, searchObj);
		console.log('Deleted offers', deletedObj)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedObj.length,
			offers: deletedObj,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

// METEO
const getMeteoHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const item = req.get;
		const findMeteoResp = await DB_NS.weather.find(item);
		console.log('findMeteoResp', findMeteoResp);
		if (findMeteoResp.error) {
			throw new Error(findMeteoResp.message, { cause: findMeteoResp });
		}
		const weatherForecasts = findMeteoResp.data;
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: weatherForecasts.length,
			offers: weatherForecasts,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const updateMeteoHandler = async (req, res) => {
	console.log('updateMeteoHandler')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const searchObj = { ...req.get };
		const updateObj = { ...req.body };

		/**@type {TYPES.T_offer} */
		const updateMeteoResp = await DB_NS.weather.update(searchObj, updateObj);
		console.log('updateMeteoResp', updateMeteoResp);
		if (updateMeteoResp.error) {
			throw new Error(updateMeteoResp.message, { cause: updateMeteoResp });
		}
		const updatedItem = updateMeteoResp.data;

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: updatedItem,
		}));
	} catch (error) {
		console.error(error)
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};


const deleteMeteoHandler = async (req, res) => {
	try {
		console.log('deleteMeteoHandler')
		console.log('req.get', req.get);
		const searchObj = { ...req.get };
		console.log('searchObj', searchObj);

		if (Object.keys(searchObj).length < 1) {
			throw new Error('Empty search parameters, at least 1 param must be provided.');
		}

		const id = req.get.id;

		/**@type {Array<TYPES.T_weather['id']>} */
		let idArr = [];
		if (id.charAt(0) !== '[') {
			idArr.push(id);
		} else if (id.charAt(0) === '[') {
			idArr = Array.from(id.slice(1, id.length - 1))
				.join('')
				.split(',');
		}

		/**@type {Promise<Array<TYPES.T_weather>>} */
		let promises = [];
		idArr.map(id => {
			searchObj.id = id;
			console.log('searchObj', searchObj);
			promises.push(deleteElement(TABLES.WEATHER, searchObj));
		});

		/**@type {Array<Array<TYPES.T_weather>>} */
		const deletedObjArr = await Promise.all(promises)
		const deletedObj = deletedObjArr.flat();

		console.log('Deleted weather', deletedObj)

		deletedObj.map(async weather => {
			console.log('Delete cloudinary', weather.cloudinary_img_public_id)
			const res = await STORE.cloudinary.deleteFile(weather.cloudinary_img_public_id);
			console.log('Delete res', res);
		})

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedObj.length,
			offers: deletedObj,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

// ADMIN
const getAdminHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		const where = req.get;
		const findAdminsResp = await DB_FP.user.find(where);
		console.log('findAdminsResp', findAdminsResp);
		if (findAdminsResp.error) {
			console.error('findAdminsResp', findAdminsResp)
			throw new Error(findAdminsResp.message, { cause: findAdminsResp });
		}

		const admins = findAdminsResp.data;
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: admins.length,
			admins: admins,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createAdminHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;


		const query = req.body;
		console.log('query', query);
		const createAdminResp = await DB_FP.user.create(query);
		console.log('createAdminResp', createAdminResp);
		if (createAdminResp.error) {
			console.error('createAdminResp', createAdminResp)
			throw new Error(createAdminResp.message, { cause: createAdminResp });
		}

		const createdAdmin = createAdminResp.data;
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			createdAdmin,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const updateAdminHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		const where = req.get;
		console.log('where', where);
		const updates = req.body;
		console.log('updates', updates);

		const updateAdminResp = await DB_FP.user.update(where, updates);
		console.log('updateAdminResp', updateAdminResp);
		if (updateAdminResp.error) {
			console.error('updateAdminResp', updateAdminResp);
			throw new Error(updateAdminResp.message, { cause: updateAdminResp });
		}

		const updatedAdmins = updateAdminResp.data;
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: updatedAdmins.length,
			admins: updatedAdmins,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deleteAdminHandler = async (req, res) => {
	try {
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		const where = req.get;
		const deleteAdminResp = await DB_FP.user.delete(where);
		console.log('deleteAdminResp', deleteAdminResp);
		if (deleteAdminResp.error) {
			console.error('deleteAdminResp', deleteAdminResp);
			throw new Error(deleteAdminResp.message, { cause: deleteAdminResp });
		}
		const deletedAdmins = deleteAdminResp.data;
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedAdmins.length,
			admins: deletedAdmins,
		}));
	} catch (error) {
		console.error(error);
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

// EMPLACEMENT

const getPlacesHandler = async (req, res) => {
	console.log('====getPlacesHandler====')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const where = req.get;
		console.log('Find places params', where);
		const places = await STORE.emplacementmgmt.getPlaces(where);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: places.length,
			places: places,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const updatePlacesHandler = async (req, res) => {
	console.log('====updatePlacesHandler====')
	try {
		const x = 0;
		const where = {
			id: req.post.id,
			number: req.post.number,
			captorNumber: req.post.captorNumber,
		};
		/**@type {TYPES.T_place} */
		const updates = {
			captorNumber: req.post.captorNumber || undefined,
			harbour_id: req.post.harbour_id || undefined,
			largeur: req.post.largeur || undefined,
			longueur: req.post.longueur || undefined,
			maxSeuil: req.post.maxSeuil || undefined,
			minSeuil: req.post.minSeuil || undefined,
			nbTramesDepart: req.post.nbTramesDepart || undefined,
			nbTramesRetour: req.post.nbTramesRetour || undefined,
			number: req.post.number || undefined,
			occupation: req.post.occupation || undefined,
			pontonId: req.post.pontonId || undefined,
			status: req.post.status || undefined,
			tirantDeau: req.post.tirantDeau || undefined,
			type: req.post.type || undefined,

		};

		const updatedPlace = await STORE.emplacementmgmt.updatePlaces(where, updates);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			places: updatedPlace,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deletePlaceByHandler = async (req, res) => {
	try {
		const where = { ...req.get };
		if (Object.entries(where).length === 0) { // isObjectEmpty
			throw new Error('Where options empty');
		}
		const places = await deletePlaceWhere(where);
		res.end(JSON.stringify({ success: true, payload: places }));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'mapmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

exports.router = [
	// USERS
	{
		on: true,
		route: "/api/next/users",
		handler: getUsersHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/users",
		handler: createUsersHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/users",
		handler: updateUsersHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/users",
		handler: deleteUsersHandler,
		method: "DELETE",
	},
	// BOATS
	{
		on: true,
		route: "/api/next/boats",
		handler: getBoatsHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/boats",
		handler: createBoatsHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/boats",
		handler: updateBoatsHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/boats",
		handler: deleteBoatsHandler,
		method: "DELETE",
	},
	// ABSENCES
	{
		on: true,
		route: "/api/next/absences",
		handler: getAbsencesHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/absences",
		handler: createAbsencesHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/absences",
		handler: updateAbsencesHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/absences",
		handler: deleteAbsencesHandler,
		method: "DELETE",
	},
	// ZONES
	{
		on: true,
		route: "/api/next/zones",
		handler: getZonesHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/zones",
		handler: createZonesHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/zones",
		handler: updateZonesHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/zones",
		handler: deleteZonesHandler,
		method: "DELETE",
	},
	// OUTINGS
	{
		on: true,
		route: "/api/next/outings",
		handler: getSortiesHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/outings",
		handler: createSortiesHandler,
		method: "POST",
	},
	// {
	// 	on: true,
	// 	route: "/api/next/absences",
	// 	handler: updateAbsencesHandler,
	// 	method: "PUT",
	// },
	{
		on: true,
		route: "/api/next/outings",
		handler: deleteSortiesHandler,
		method: "DELETE",
	},
	// EVENTS
	{
		on: true,
		route: "/api/next/events",
		handler: getEventsHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/events",
		handler: createEventsHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/events",
		handler: updateEventsHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/events",
		handler: deleteEventsHandler,
		method: "DELETE",
	},
	// OFFERS
	{
		on: true,
		route: "/api/next/offers",
		handler: getOffersHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/offers",
		handler: createOffersHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/offers",
		handler: updateOffersHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/offers",
		handler: deleteOffersHandler,
		method: "DELETE",
	},
	// WEATHER
	{
		on: true,
		route: "/api/next/weathers",
		handler: getMeteoHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/weathers",
		handler: updateMeteoHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/weathers",
		handler: deleteMeteoHandler,
		method: "DELETE",
	},
	// ADMINS
	{
		on: true,
		route: "/api/next/admins",
		handler: getAdminHandler,
		method: "GET",
	},
	{
		on: true,
		route: "/api/next/admins",
		handler: createAdminHandler,
		method: "POST",
	},
	{
		on: true,
		route: "/api/next/admins",
		handler: updateAdminHandler,
		method: "PUT",
	},
	{
		on: true,
		route: "/api/next/admins",
		handler: deleteAdminHandler,
		method: "DELETE",
	},
	// EMPLACEMENT
	{
		method: "GET",
		route: "/api/next/places",
		handler: getPlacesHandler,
	}, {
		method: "POST",
		route: "/api/next/places",
		handler: updatePlacesHandler,
	}, {
		method: "DELETE",
		route: "/api/next/places",
		handler: deletePlaceByHandler,
	},
];
