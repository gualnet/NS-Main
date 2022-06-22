// REST
// GET
// POST
// PUT replaces the resource in its entirety. Use PATCH if request updates part of the resource. we dont use patch here yet
// DELETE
const TYPES = require('../../types');


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
		console.log('req.get', req.get)
		const searchOpt = { ...req.get };
		/** @type {Array<TYPES.T_user>} */
		const users = await getElements('user', searchOpt);

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
			error,
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

		const createdUser = await createElement('user', newUser);
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
		const updatedUser = await updateElement('user', searchObj, updteObj);
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
		const searchObj = { ...req.get };

		/**@type {Array<TYPES.T_user>} */
		const deletedObj = await deleteElement('user', searchObj);
		console.log('Deleted Users', deletedObj)

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: deletedObj.length,
			users: deletedObj,
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
		console.log('req.get', req.get)
		const searchOpt = { ...req.get };
		/** @type {Array<TYPES.T_user>} */
		const boats = await getElements('boat', searchOpt);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			usersCount: boats.length,
			boats: boats,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

const createBoatsHandler = async (req, res) => {
	console.log('createBoatsHandler')
	try {
		// console.log('req.body', req.body);
		const { place_id, name, immatriculation,
			is_resident, user, harbour } = req.body;
		const newBoat = {
			id: null,
			place_id: place_id || null,
			name: name || null,
			immatriculation: immatriculation || null,
			is_resident: is_resident || null,
			user: user || null,
			harbour: harbour || null,
			created_at: Date.now(),
		};
		/**@type {TYPES.T_boat} */
		const createdBoat = await createElement('boat', newBoat);
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
		const searchObj = { ...req.get };
		const updteObj = { ...req.body };

		/**@type {Array<TYPES.T_boat>} */
		const updatedBoats = await updateElement('boat', searchObj, updteObj);
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
		const searchObj = { ...req.get };

		/**@type {Array<TYPES.T_boat>} */
		const deletedObj = await deleteElement('boat', searchObj);
		console.log('Deleted boats', deletedObj)

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

// ABSENCES
const getAbsencesHandler = async (req, res) => {
	console.log('getAbsencesHandler');
	try {
		console.log('req.get', req.get)
		const searchOpt = { ...req.get };
		/** @type {Array<TYPES.T_absence>} */
		const boats = await getElements('absences', searchOpt);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			usersCount: boats.length,
			boats: boats,
		}));

	} catch (error) {
		res.writeHead(500, 'Error', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error,
		}));
	}
};

const createAbsencesHandler = async (req, res) => {
	console.log('createAbsencesHandler')
	try {
		// console.log('req.body', req.body);
		const { date_end, date_start, boat_id,
			harbour_id, user_id } = req.body;
		if (! boat_id) throw(new Error('boat id is missing'));
		if (! date_start) throw(new Error('date_start is missing'));
		if (! date_end) throw(new Error('date_end is missing'));
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
		const createdAbsence = await createElement('absences', newAbsence);
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
		const updatedAbsences = await updateElement('absences', searchObj, updteObj);
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
		const deletedObj = await deleteElement('absences', searchObj);
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
];
