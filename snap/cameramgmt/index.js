const ENUM = require('../lib-js/enums');
const TYPES = require('../../types');
const { verifyRoleAccess } = require('../lib-js/verify');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [ROLES.SUPER_ADMIN];

//function to sort array
var dynamicSort = function (property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		/* next line works with strings and numbers,
		 * and you may want to customize it to your needs
		 */
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

function verifyPostReq(_req, _res) {
	if (!_req.post.title || _req.post.title.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
		return false;
	}
	if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
		return false;
	}
	return true;
}

/* ************** */
/* DB HANDLERS V2 */

/**
 * 
 * @param {Partial<TYPES.T_camera>} where 
 * @returns {Promise<TYPES.T_camera[]>}
 */
const getCamerasV2 = async (where) => {
	console.log('===getCamerasV2===');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Search cameras where: ', where);
	const getCamerasV2Resp = await DB_NS.camera.find(where);
	if (getCamerasV2Resp.error) {
		throw new Error(getCamerasV2Resp.message, { cause: getCamerasV2Resp });
	}

	const cameras = getCamerasV2Resp.data;
	console.log(`Found ${cameras.length} camera(s) items`);
	return cameras;
};

/**
 * 
 * @param {Omit<TYPES.T_camera, "id">} updates 
 * @returns {Promise<TYPES.T_camera>}
 */
const createCamerasV2 = async (updates = {}) => {
	console.log('====createCamerasV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createCameraResp = await DB_NS.camera.create(updates);
	if (createCameraResp.error) {
		console.error(createCameraResp);
		throw new Error(createCameraResp.message, { cause: createCameraResp });
	}
	const createdCamera = createCameraResp.data;
	console.log(`Created camera:`, createdCamera);
	return createdCamera;
};

/**
 * 
 * @param {Pick<TYPES.T_camera, "id"|"category"|"harbour_id"|"title">} where 
 * @param {Partial<TYPES.T_camera>} updates 
 * @returns {Promise<TYPES.T_camera[]>}
 */
const updateCamerasV2 = async (where, updates) => {
	console.log('====updateCameraV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;
	console.log('Update cameras where: ', where);
	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ');
	}

	console.log('Update cameras with: ', updates);
	const updateCameraResp = await DB_NS.camera.update(where, updates);
	if (updateCameraResp.error) {
		throw new Error(updateCameraResp.message, { cause: updateCameraResp });
	}
	const cameras = updateCameraResp.data;
	console.log(`${cameras.length} camera(s) Updated`);
	return cameras;
};

/**
 * 
 * @param {Pick<TYPES.T_camera, "id"|"category"|"harbour_id"|"title">} where 
 * @returns {Promise<TYPES.T_camera[]>}
 */
const deleteCamerasV2 = async (where = {}) => {
	console.log('====deleteCamerasV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte camera where: ', where);
	const deleteCameraResp = await DB_NS.camera.delete(where);
	if (deleteCameraResp.error) {
		console.error(deleteCameraResp);
		throw new Error(deleteCameraResp.message, { cause: deleteCameraResp });
	}
	const deletedCamera = deleteCameraResp.data;
	console.log(`Deleted ${deletedCamera.length} camera(s) items`, deletedCamera);
	return deletedCamera;
};

/* DB HANDLERS V2 */
/* ************** */

/* ************** */
/* API HANDLERS */

async function getCameraFromHarbourHandler(_req, _res) {
	let camera = await getCamerasV2({ harbour_id: _req.param.harbour_id });
	camera = camera.sort(dynamicSort("date")).reverse();
	UTILS.httpUtil.dataSuccess(_req, _res, "success", camera);
	return;
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

		/**@type {Omit<TYPES.T_camera, "id">} */
		const newCamera = {
			created_at: req.post.created_at || Date.now(),
			harbour_id: req.post.harbour_id || null,
			title: req.post.title || null,
			updated_at: req.post.updated_at || null,
			url: req.post.url || null,
		};
		const createdCamera = await createCamerasV2(newCamera);
		console.log('createdCamera',createdCamera);
		UTILS.httpUtil.dataSuccess(req, res, "Camera créé", "1.0");
	} catch (error) {
		console.error(error);
		UTILS.httpUtil.dataError(req, res, "Erreur", "Internal Server Error", "500", "1.0");
	}
};

const pluginPostUpdateHandler = async (req, res) => {
	console.log('===pluginPostUpdateHandler===')
	try {
		if (!verifyPostReq(req, res)) {
			return;
		}
		const camera = await getCamerasV2({ id: req.post.id });
		/**@type {Omit<TYPES.T_camera, "id">} */
		const cameraUpdates = { ...req.post };
		delete cameraUpdates.id;
		const updatedCamera = await updateCamerasV2({ id: req.post.id }, cameraUpdates);
		console.log('updatedCamera',updatedCamera)
		UTILS.httpUtil.dataSuccess(req, res, "Camera mis à jour", "1.0");
	} catch (error) {
		console.error(error)
		UTILS.httpUtil.dataError(req, res, "Erreur", "Erreur lors de la mise a jour de la camera", "500", "1.0");
	}
};

/* PLUGIN HANDLERS */
/* *************** */

exports.router = [
	{
		route: "/api/camera/:harbour_id",
		handler: getCameraFromHarbourHandler,
		method: "GET",
	},
];

exports.plugin = {
	title: "Gestion des caméras",
	desc: "",
	handler: async (req, res) => {
		console.log('CAMERA PLUGIN HANDLER')
		console.log('req.post',req.post)
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		//get user from FORTPRESS db <
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

		var _type = admin.data.type;
		var _role = admin.role;
		var _entity_id = admin.data.entity_id;
		var _harbour_id = admin.data.harbour_id;
		// >

		if (!verifyRoleAccess(admin.data.roleBackOffice, AUTHORIZED_ROLES)) {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}
		if (_entity_id === 'SlEgXL3EGoi') {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.camera_id) {
				try {
					await deleteCamerasV2({ id: req.get.camera_id });
				} catch (error) {
					UTILS.httpUtil.dataError(req, res, "Erreur", "Erreur lors de la suppression de la camera", "1.0");
					return;
				}
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				await pluginPostUpdateHandler(req, res);
			}
			else {
				await pluginPostCreateHandler(req, res);
			}
		}
		else {
			//get html files
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _cameraHtml = fs.readFileSync(path.join(__dirname, "camera.html")).toString();

			//get cameras from user role
			var _cameras = [];
			if (_role == "user") {
				for (var i = 0; i < _harbour_id.length; i++) {
					_cameras = _cameras.concat(await getCamerasV2({ id: _harbour_id[i] }));
				}
			}
			else if (_role == "admin")
				_cameras = await getCamerasV2({});


			//modify html dynamically <
			var _cameraGen = "";
			for (var i = 0; i < _cameras.length; i++) {
				const [currentHarbour] = await STORE.harbourmgmt.getHarbours({ id: _cameras[i].harbour_id });
				_cameraGen += _cameraHtml.replace(/__ID__/g, _cameras[i].id)
					.replace(/__FORMID__/g, _cameras[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour.id)
					.replace(/__URL__/g, _cameras[i].url)
					.replace(/__TITLE__/g, _cameras[i].title)
			}
			_indexHtml = _indexHtml.replace("__CAMERA__", _cameraGen).replace(/undefined/g, '');
			// >

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';

				const getHarbourPromises = await _harbour_id.map(harbourId => STORE.harbourmgmt.getHarbours({ id: harbourId }));
				const userHarbours = await Promise.all(getHarbourPromises);
				userHarbours.map(userHarbour => {
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

			//send plugin html page
			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}
