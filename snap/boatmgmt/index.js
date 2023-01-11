const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const {errorHandler} = require('../lib-js/errorHandler');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

//gestions des bateaux


//set datatable cols
var _boatCol = "boat";
var _userCol = "user";

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
	if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Id de l'utilisateur requis", "100", "1.0");
		return false;
	}
	if (!_req.post.userid || _req.post.userid.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
		return false;
	}
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

	const findBoatsResp = await DB_NS.boat.find(where, { raw: 1 });
	if (findBoatsResp.error) {
		throw new Error(findBoatsResp.message, { cause: findBoatsResp });
	}
	const boats = findBoatsResp.data;
	console.log(`Found [${boats.length}] Boat(s)`);
	return boats;
}

async function delBoat(_id) {
	return new Promise(resolve => {
		STORE.db.linkdb.Delete(_boatCol, { id: _id }, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function createBoat(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Create(_boatCol, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

async function updateBoat(_obj) {
	return new Promise(resolve => {
		STORE.db.linkdb.Update(_boatCol, { id: _obj.id }, _obj, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

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
// >

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
		const updateUserResp = await DB_NS.user.update({ id: createdBoat.user_id }, {boat_id: createdBoat.id }, { raw: 1 });
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
	console.log(_req.post);

	//verify user
	var user;
	if (!_req.post.token || _req.post.token.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur non connecté", "100", "1.0");
		return;
	} else {
		user = await STORE.usermgmt.getUserByToken(_req.post.token);
		if (!user[0]) {
			UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur non connecté", "100", "1.0");
			return;
		}
	}

	if (_req.post.id) {
		delete _req.post.token;
		var boat = await delBoat(_req.post.id);
		console.log(boat);
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
		user = await STORE.usermgmt.getUserByToken(_req.post.token);
		if (!user[0]) {
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
		delete _req.post.token;
		var boat = await updateBoat(_req.post);
		UTILS.httpUtil.dataSuccess(_req, _res, "Bateau mis à jour", "1.0")
		return;

	} else {
		delete _req.post.token;
		_req.post.user_id = user[0].id;
		_req.post.date = Date.now();

		var boat = await createBoat(_req.post);
		UTILS.httpUtil.dataSuccess(_req, _res, "Bateau créer", "1.0")
		return;

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

		const findBoatResp = await DB_NS.boat.find({ user_id, harbour_id });
		if (findBoatResp.error) {
			throw new Error(findBoatResp.error);
		}
		const boats = findBoatResp.data;
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
		
		// var admin = await getAdminById(req.userCookie.data.id);
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
				await delBoat(req.get.boat_id);
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				//if (verifyPostReq(req, res)) {
				if (typeof (await updateBoat(req.post)) != "string") {
					UTILS.httpUtil.dataSuccess(req, res, "Bateau mis à jour", "1.0");
					return;
				}
				//}
			}
		}
		else {
			//get html files
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _boatHtml = fs.readFileSync(path.join(__dirname, "boat.html")).toString();
			/**@type {Array<TYPES.T_boat>} */
			var _boats = [];

			try {
				//get boats from user role
				if (_role == "user") {
					for (var i = 0; i < _harbour_id.length; i++) {
						_boats = _boats.concat(await getBoatsV2({ harbour_id: _harbour_id[i] }));
					}
				}
				else if (_role == "admin") {
					_boats = await getBoatsV2({});
				}
			} catch (error) {
				console.error(error);
				res.writeHead(500);
				res.end('Internal Error');
			}
			
			//modify html dynamically <
			var _boatGen = "";
			let isPlaceAttributed;
			for (var i = 0; i < _boats.length; i++) {
				isPlaceAttributed = false;
				var currentHarbour = await STORE.harbourmgmt.getHarbourById(_boats[i].harbour_id);
				let places = await STORE.mapmgmt.getPlaceByHarbourId(_boats[i].harbour_id);
				places = places.sort((a, b) => a.number < b.number ? -1 : 1);
				// set places lists
				var places_select = "";
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

				var currentUser = await STORE.usermgmt.getUserById(_boats[i].user_id);

				_boatGen += _boatHtml.replace(/__ID__/g, _boats[i].id)
					.replace(/__FORMID__/g, _boats[i].id.replace(/\./g, "_"))
					.replace(/__NAME__/g, _boats[i].name)
					.replace(/__PLACE__/g, places_select)
					.replace(/__USER__/g, _boats[i].user_id + "\\" + currentUser.first_name + " " + currentUser.last_name)
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour.id || 'NONE')
					.replace(/__IMMATRICULATION__/g, _boats[i].immatriculation || '- -')
					.replace(/__LONGUEUR__/g, _boats[i].longueur)
					.replace(/__LARGEUR__/g, _boats[i].largeur)
					.replace(/__TIRANT_EAU__/g, _boats[i].tirant_eau)
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
	getBoat: getBoatsV2,
	updateBoat: updateBoat
}