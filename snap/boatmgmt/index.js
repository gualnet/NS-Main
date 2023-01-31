const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const { errorHandler } = require('../lib-js/errorHandler');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

//gestions des bateaux

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

//verify boat from request for create
function verifyPostReq(_req, _res) {
	if (!_req.post.name || _req.post.name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom du bateau requis", "100", "1.0");
		return false;
	}
	if (!_req.post.place_id || _req.post.place_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "place requise", "100", "1.0");
		return false;
	}
	if (!_req.post.immatriculation || _req.post.immatriculation.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Immatriculation requise", "100", "1.0");
		return false;
	}
	// if (!_req.post.contract_number || _req.post.contract_number.length < 1) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de contrat requis", "100", "1.0");
	// 	return false;
	// }
	// if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Id de l'utilisateur requis", "100", "1.0");
	// 	return false;
	// }
	// if (!_req.post.userid || _req.post.userid.length < 1) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
	// 	return false;
	// }
	return true;
}

//verify boat from request for update
function verifyFirstPostReq(_req, _res) {
	if (!_req.post.name || _req.post.name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom du bateau requis", "100", "1.0");
		return false;
	}
	if (!_req.post.place || _req.post.place.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "place requise", "100", "1.0");
		return false;
	}
	if (!_req.post.immatriculation || _req.post.immatriculation.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Immatriculation requise", "100", "1.0");
		return false;
	}
	if (!_req.post.contract_number || _req.post.contract_number.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de contrat requis", "100", "1.0");
		return false;
	}
	return true;
}


/**
 * 
 * @param {Object} where 
 * @returns {Pomise<TYPES.T_boat[]>}
 */
const getBoatsV2 = async (where) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Search boats where: ', where);
	const findBoatsResp = await DB_NS.boat.find(where);
	if (findBoatsResp.error) {
		console.error(findBoatsResp);
		throw new Error(findBoatsResp.message, { cause: findBoatsResp });
	}
	const boats = findBoatsResp.data;
	console.log(`Found ${boats.length} boat(s) items`);
	return boats;
};

/**
 * 
 * @param {TYPES.T_boat} boat 
 * @returns 
 */
const createBoatV2 = async (boat) => {
	// console.log('====createBoatV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Create boats where: ', where);
	const createBoatResp = await DB_NS.boat.create(boat);
	if (createBoatResp.error) {
		console.error('[ERROR]', createBoatResp);
		throw new Error(createBoatResp.message, { cause: createBoatResp });
	}
	const boats = createBoatResp.data;
	console.log(`Created ${boats.length} boat:\n`.boats);
	return boats;
};

/**
 * 
 * @param {Pick<TYPES.T_boat, "id">} where 
 * @param {Partial<TYPES.T_boat>} updates 
 * @returns {Promise<TYPES.T_boat[]>}
 */
const updateBoatV2 = async (where, updates) => {
	// console.log('====updateBoatV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update boats where: ', where);
	console.log('Update boats with: ', updates);
	const updateboatResp = await DB_NS.boat.update(where, updates);
	if (updateboatResp.error) {
		throw new Error(updateboatResp.message, { cause: updateboatResp });
	}
	const boats = updateboatResp.data;
	console.log(`${boats.length} boat(s) Updated`);
	return boats;
};

/**
 * 
 * @param {Pick<TYPES.T_boat, "id">} where 
 * @returns {Promise<TYPES.T_boat[]>}
 */
const deleteBoatV2 = async (where = {}) => {
	console.log('====deleteBoatV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Delte boat where: ', where);
	if (Object.keys(where).length === 0) {
		throw new Error('Wrong parameter: ', where);
	}

	const deleteBoatsResp = await DB_NS.boat.delete(where);
	if (deleteBoatsResp.error) {
		console.error('[ERROR]', deleteBoatsResp)
		throw new Error(deleteBoatsResp.message, { cause: deleteBoatsResp });
	}
	const boats = deleteBoatsResp.data;
	console.log(`Deleted ${boats.length} boat(s) items`, boats);
	return boats;
};

//handler that save boat in db
async function addBoatHandler(_req, _res) {
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		// CREATE BOAT
		const creatBoatResp = await DB_NS.boat.create({
			id: UTILS.UID.generate(),
			harbour_id: _req.post.harbour_id,
			is_resident: _req.post.is_resident,
			place_id: _req.post.place_id,
			user_id: _req.post.user_id,
			name: _req.post.name,
			longueur: _req.post.longueur,
			largeur: _req.post.largeur,
			tirant_eau: _req.post.tirant_eau,
		});
		if (creatBoatResp.error) {
			throw new Error(creatBoatResp.error);
		}
		/**@type {TYPES.T_boat} */
		const createdBoat = creatBoatResp.data;

		// UPDATE USER
		const updateUserResp = await DB_NS.user.update({ id: createdBoat.user_id }, { boat_id: createdBoat.id });
		if (updateUserResp.error) {
			throw new Error(updateUserResp.error, { cause: { httpCode: 500 } });
		}
		const updatedUser = updateUserResp.data[0]
		UTILS.httpUtil.dataSuccess(_req, _res, "Bateau enregistré", "1.0")
	} catch (error) {
		errorHandler(_res, error);
	}
}

//handler that delete boat in db
async function deleteBoatHandler(_req, _res) {
	//verify user
	var user;
	if (!_req.post.token || _req.post.token.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur non connecté", "100", "1.0");
		return;
	} else {
		user = await STORE.usermgmt.getUsers({ token: _req.post.token });
		if (!user[0]) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur non connecté", "100", "1.0");
			return;
		}
	}

	if (_req.post.id) {
		delete _req.post.token;
		const boat = await deleteBoatV2({ id: _req.post.id });
		UTILS.httpUtil.dataSuccess(_req, _res, "Bateau supprimé", "1.0")
		return;
	} else {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Aucun id de bateau", "100", "1.0");
		return;
	}
	res.end();
	return;
}

//Handler to update boat
async function updateBoatHandler(_req, _res) {
	var user;
	if (!_req.post.token || _req.post.token.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur non connecté", "100", "1.0");
		return;
	} else {
		const users = await STORE.usermgmt.getUsers({ token: _req.post.token });
		user = users[0] || undefined;
		if (!user) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur non connecté", "100", "1.0");
			return;
		}
	}

	if (!_req.post.name || _req.post.name.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Nom incorrect", "100", "1.0");
		return;
	}
	if (!_req.post.place_id || _req.post.place_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Aucune place séléctionnée", "100", "1.0");
		return;
	}
	if (!_req.post.longueur || _req.post.longueur.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Longueur incorrect", "100", "1.0");
		return;
	}
	if (!_req.post.largeur || _req.post.largeur.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Largeur incorrect", "100", "1.0");
		return;
	}
	if (!_req.post.tirant_eau || _req.post.tirant_eau.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Tirant d'eau incorrect", "100", "1.0");
		return;
	}
	if (!_req.post.immatriculation || _req.post.immatriculation.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Immatriculation incorrect", "100", "1.0");
		return;
	}
	if (_req.post.id) {
		try {
			delete _req.post.token;
			const boatId = _req.post.id;
			delete _req.post.id;
			delete _req.post;
			await updateBoatV2({ id: boatId }, _req.post);
			UTILS.httpUtil.dataSuccess(_req, _res, "Bateau mis à jour", "1.0")
			return;
		} catch (error) {
			console.error('[ERROR]', error);
			UTILS.httpUtil.dataError(_req, _res, "Erreur", "Erreur lors de la mise à jour du bateau", "1.0");
			return;
		}
	} else {
		try {
			// TODO A TESTER
			console.log('ELSE BOAT CREATE REQ.POST', _req.post);
			delete _req.post.token;
			_req.post.user_id = user.id;
			_req.post.date = Date.now();

			const createdBoat = await createBoatV2(_req.post);

			const upadtedUser = await STORE.usermgmt.updateUsers({ id: user.id }, { boat_id: createdBoat })

			UTILS.httpUtil.dataSuccess(_req, _res, "Bateau créer", "1.0")
			return;
		} catch (error) {
			console.error('[ERROR]', error);
			UTILS.httpUtil.dataError(_req, _res, "Erreur", "Erreur lors de la création du bateau", "1.0");
			return;
		}
	}
	res.end();
	return;
}

//handler that verify boat form data 
async function verifyFormBoatHandler(_req, _res) {
	if (verifyFirstPostReq(_req.data)) {
		UTILS.httpUtil.dataSuccess(_req, _res, 'success', 'no error in form data', '1.0');
		return;
	}
}

// handle that return the boat of the user
async function getUserBoatsHandler(_req, _res) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (_req.get.user_id && _req.get.harbour_id) {
		const { user_id, harbour_id } = _req.get;

		const boats = await getBoatsV2({ user_id, harbour_id });
		if (boats[0]) {
			UTILS.httpUtil.dataSuccess(_req, _res, 'success', boats, '1.0');
			return;
		} else {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Aucun bateau trouvé", "100", "1.0");
			return false;
		}
	} else {
		UTILS.httpUtil.dataError(_req, _res, "Error", "ID utilisateur requis", "100", "1.0");
		return false;
	}
}

exports.router = [
	{
		on: true,
		route: "/api/addboat",
		handler: addBoatHandler,
		method: "post",
	},
	{
		on: true,
		route: "/api/updateboat",
		handler: updateBoatHandler,
		method: "post",
	},
	{
		on: true,
		route: "/api/deleteboat",
		handler: deleteBoatHandler,
		method: "post",
	},
	{
		on: true,
		route: "/api/verify/boat/form",
		handler: verifyFormBoatHandler,
		method: "post",
	},
	{
		on: true,
		route: "/api/get/userboats",
		handler: getUserBoatsHandler,
		method: "get",
	},

]


exports.plugin =
{
	title: "Gestion des bateaux",
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
			res.end('No access rights');
			return;
		}
		if (_entity_id === 'SlEgXL3EGoi') {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.boat_id) {
				try {
					await deleteBoatV2({ id: req.get.boat_id });
				} catch (error) {
					console.error('[ERROR]', error);
					res.writeHead(500);
					res.end('Erreur lors de la suppression du bateau.');
					return;
				}
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				try {
					if (!verifyPostReq(req, res)) {
						return;
					}
					const boatId = req.post.id;
					delete req.post.id;
					const updatedBoat = await updateBoatV2({ id: boatId }, req.post);
					UTILS.httpUtil.dataSuccess(req, res, "Bateau mis à jour", "1.0");
					return;
				} catch (error) {
					console.error('[ERROR]', error);
					res.writeHead(500);
					res.end('Erreur lors de la mise à jour du bateau.');
					return;
				}
			}
		}
		else {
			//get html files
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _boatHtml = fs.readFileSync(path.join(__dirname, "boat.html")).toString();
			/**@type {Array<TYPES.T_boat>} */
			var _boats = [];
			let harboursMapById = {};
			let placesMapByHarbourId = {};

			try {
				//get boats from user role
				if (_role == "user") {
					for (var i = 0; i < _harbour_id.length; i++) {
						_boats = _boats.concat(await getBoatsV2({ harbour_id: _harbour_id[i] }));
					}
				}
				else if (_role == "admin") {
					_boats = await getBoatsV2({});
					console.log('[INFO] Limit boats to display 500 elements.');
					_boats = _boats.splice(0, 500);
				}

				// get harbours list
				/**@type {TYPES.T_harbour[]} */
				const harbours = await STORE.harbourmgmt.getHarbours();
				const placesPromises = [];
				harbours.map(async harbour => {
					if (!harboursMapById[harbour.id]) {
						harboursMapById[harbour.id] = harbour;
						placesPromises.push(STORE.mapmgmt.getPlaceByHarbourId(harbour.id)); // TODO: update that
					}
				});

				const placesList = await Promise.all(placesPromises);
				placesList.map((places) => {
					if (places.length > 0) {
						if (!placesMapByHarbourId[places[0].harbour_id]) {
							placesMapByHarbourId[places[0].harbour_id] = places;
						}
					}
				})

			} catch (error) {
				console.error(error);
				res.writeHead(500);
				res.end('Internal Error');
			}

			Object.values(placesMapByHarbourId).map(places => places = places.sort((a, b) => a.number < b.number ? -1 : 1));

			//modify html dynamically <
			var _boatGen = "";
			let isPlaceAttributed;
			for (var i = 0; i < _boats.length; i++) {
				isPlaceAttributed = false;
				const currentHarbour = harboursMapById[_boats[i].harbour_id];
				let places = placesMapByHarbourId[_boats[i].harbour_id] || [];
				// set places lists
				var places_select = '';
				for (var p = 0; p < places.length; p++) {
					if (places[p] && _boats[i]) {
						if (places[p]?.id == _boats[i]?.place_id) {
							isPlaceAttributed = true
							places_select += '<option value="' + places[p].id + '" selected>' + places[p].number + '</option>'
						} else {
							places_select += '<option value="' + places[p].id + '">' + places[p].number + '</option>'
						}
					}
				}
				if (isPlaceAttributed === false) {
					places_select += '<option value="" selected> - - </option>'
				}

				const [currentUser] = await STORE.usermgmt.getUsers({ id: _boats[i].user_id });

				_boatGen += _boatHtml.replace(/__ID__/g, _boats[i].id)
					.replace(/__FORMID__/g, _boats[i].id.replace(/\./g, "_"))
					.replace(/__NAME__/g, _boats[i].name || 'NONE')
					.replace(/__PLACE__/g, places_select)
					.replace(/__USER__/g, _boats[i].user_id + "\\" + currentUser?.first_name + " " + currentUser?.last_name)
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name || 'NONE')
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id || 'NONE')
					.replace(/__IMMATRICULATION__/g, _boats[i].immatriculation || 'NONE')
					.replace(/__LONGUEUR__/g, _boats[i].longueur || 'NONE')
					.replace(/__LARGEUR__/g, _boats[i].largeur || 'NONE')
					.replace(/__TIRANT_EAU__/g, _boats[i].tirant_eau || 'NONE')
			}
			_indexHtml = _indexHtml.replace("__BOATS__", _boatGen).replace(/undefined/g, '');
			// >

			//send plugin html page
			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}


exports.store = {
	getBoats: getBoatsV2,
	deleteBoats: deleteBoatV2,
}