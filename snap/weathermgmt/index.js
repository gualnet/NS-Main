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

function makeid(length) {
	var result = '';
	var characters = 'abcdefghijklmnopqrstuvwxyz';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	console.log(result);
	return result;
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

function verifyPostReq(_req, _res) {
	if (!_req.post.title || _req.post.title.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "400", "1.0");
		return false;
	}
	if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
		UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "400", "1.0");
		return false;
	}
	// if (!_req.post.content || _req.post.content.length < 1) {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Contenu requis", "100", "1.0");
	// 	return false;
	// }
	// if (!_req.post.category == "news" || !_req.post.category == "event") {
	// 	UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
	// 	return false;
	// }
	return true;
}

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
 * @param {Partial<TYPES.T_weather>} where 
 * @returns {Promise<TYPES.T_weather[]>}
 */
const getWeathersV2 = async (where) => {
	console.log('===getWeathersV2===');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Search weathers where: ', where);
	const getWeathersV2Resp = await DB_NS.weather.find(where);
	if (getWeathersV2Resp.error) {
		throw new Error(getWeathersV2Resp.message, { cause: getWeathersV2Resp });
	}

	const weathers = getWeathersV2Resp.data;
	console.log(`Found ${weathers.length} weather(s) items`);
	return weathers;
};

/**
 * 
 * @param {Omit<TYPES.T_weather, "id">} updates 
 * @returns {Promise<TYPES.T_weather>}
 */
const createWeathersV2 = async (updates = {}) => {
	console.log('====createWeathersV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createweatherResp = await DB_NS.weather.create(updates);
	if (createweatherResp.error) {
		console.error(createweatherResp);
		throw new Error(createweatherResp.message, { cause: createweatherResp });
	}
	const createdWeather = createweatherResp.data;
	console.log(`Created weather:`, createdWeather);
	return createdWeather;
};

/**
 * 
 * @param {Pick<TYPES.T_weather, "id"|"harbour_id"|"title">} where 
 * @param {Partial<TYPES.T_weather>} updates 
 * @returns {Promise<TYPES.T_weather[]>}
 */
const updateWeathersV2 = async (where, updates) => {
	console.log('====updateWeathersV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;
	console.log('Update weathers where: ', where);
	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ');
	}

	console.log('Update weathers with: ', updates);
	const updateWeatherResp = await DB_NS.weather.update(where, updates);
	if (updateWeatherResp.error) {
		throw new Error(updateWeatherResp.message, { cause: updateWeatherResp });
	}
	const weathers = updateWeatherResp.data;
	console.log(`${weathers.length} weather(s) Updated`);
	return weathers;
};

/**
 * 
 * @param {Pick<TYPES.T_weather, "id"|"category"|"harbour_id"|"title">} where 
 * @returns {Promise<TYPES.T_weather[]>}
 */
const deleteWeathersV2 = async (where = {}) => {
	console.log('====deleteWeathersV2====');

	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte weather where: ', where);
	const deleteWeatherResp = await DB_NS.weather.delete(where);
	if (deleteWeatherResp.error) {
		console.error(deleteWeatherResp);
		throw new Error(deleteWeatherResp.message, { cause: deleteWeatherResp });
	}
	const deletedWeather = deleteWeatherResp.data;
	console.log(`Deleted ${deletedWeather.length} weather(s) items`, deletedWeather);
	return deletedWeather;
};

/* DB HANDLERS V2 */
/* ************** */

/* ************** */
/* API HANDLERS */

async function getWeatherFromHarbourHandler(req, res) {
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		let weather = await getWeathersV2({ harbour_id: req.param.harbour_id });
		weather = weather.sort(dynamicSort("date")).reverse();
		if (weather[0]) {
			UTILS.httpUtil.dataSuccess(req, res, "success", weather[0])
			return;
		} else {
			UTILS.httpUtil.dataError(req, res, "Error", "Pas de bulletin meteo", "404", "1.0");
		}
	} catch (error) {
		console.error('[ERROR]', error);
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

async function getWeatherFromLatLonHandler(_req, _res) {
	try {
		var promise = await UTILS.httpsUtil.httpReqPromise({
			"host": "api.worldweatheronline.com",
			"path": "/premium/v1/marine.ashx?key=b9dacb23fd39441c90970816191507&q=" + _req.get.latitude + "," + _req.get.longitude + "&lang=fr&format=json&tp=1&tide=yes",
			"method": "GET"
		});
		//_res.setHeader("Content-Type", "application/json");
		UTILS.httpUtil.dataSuccess(_req, _res, "success", promise);
		return;
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'weathermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		_res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		_res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

async function getWeatherFromWeatherLinkVOneHandler(_req, _res) {
	try {
		if (_req.get.entity_id) {
			let entity = await STORE.enititymgmt.getEntityById(_req.get.entity_id);

			console.log('entity',entity);
			console.log("/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token)
			if (entity.weather_api == "wlv1") {
				var promise = await UTILS.httpsUtil.httpReqPromise({
					"host": "api.weatherlink.com",
					"path": "/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token,
					"method": "GET"
				});
			}
			//_res.setHeader("Content-Type", "application/json");
			UTILS.httpUtil.dataSuccess(_req, _res, "success", promise);
			return;
		}
		_res.end();
		return;
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'weathermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		_res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		_res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}
async function getWeatherFromWeatherLinkVTwoHandler(_req, _res) {
	try {
		if (_req.get.entity_id) {
			let entity = await STORE.enititymgmt.getEntityById(_req.get.entity_id);

			console.log(entity);
			console.log("/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token)
			if (entity.weather_api == "wlv1") {
				var promise = await UTILS.httpsUtil.httpReqPromise({
					"host": "api.weatherlink.com",
					"path": "/v1/NoaaExt.json?user=" + entity.wlink_vone_user + "&pass=" + UTILS.Crypto.decryptText(entity.wlink_vone_pw, "AJtWbggDUidBESek3fIc") + "&apiToken=" + entity.wlink_vone_token,
					"method": "GET"
				});
			}
			//_res.setHeader("Content-Type", "application/json");
			UTILS.httpUtil.dataSuccess(_req, _res, "success", promise);
			return;
		}
		_res.end();
		return;
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'weathermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		_res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		_res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}

}

async function getWeatherFromWeatherLinkVTwoHandler(_req, _res) {
	try {
		if (_req.get.entity_id) {
			let entity = await STORE.enititymgmt.getEntityById(_req.get.entity_id);
			let stations;

			var date = Math.floor(Date.now() / 1000);
			let message = "api-key" + entity.wlink_vtwo_apikey + "t" + date;
			let secretkey = entity.wlink_vtwo_secretkey;
			let api_signature = crypto.createHmac('SHA256', secretkey).update(message).digest('hex')
			if (entity.weather_api == "wlv2") {
				var promise = await UTILS.httpsUtil.httpReqPromise({
					"host": "api.weatherlink.com",
					"path": "/v2/stations?api-key=" + entity.wlink_vtwo_apikey + "&t=" + date + "&api-signature=" + api_signature,
					"method": "GET"
				});
				stations = JSON.parse(promise.data);
				stations = stations.stations;
			}

			date = Math.floor(Date.now() / 1000);
			message = "api-key" + entity.wlink_vtwo_apikey + "t" + date;
			api_signature = crypto.createHmac('SHA256', secretkey).update(message).digest('hex')//UTILS.Crypto.createSHA256(message + secretkey);
			let sensorsDetails;
			if (entity.weather_api == "wlv2") {
				var promise = await UTILS.httpsUtil.httpReqPromise({
					"host": "api.weatherlink.com",
					"path": "/v2/sensors?api-key=" + entity.wlink_vtwo_apikey + "&t=" + date + "&api-signature=" + api_signature,
					"method": "GET"
				});
				const sensors = JSON.parse(promise.data);
				sensorsDetails = sensors.sensors;
			}

			let weather;
			date = Math.floor(Date.now() / 1000);
			message = "api-key" + entity.wlink_vtwo_apikey + "station-id" + stations[0].station_id + "t" + date;
			api_signature = crypto.createHmac('SHA256', secretkey).update(message).digest('hex')//UTILS.Crypto.createSHA256(message + secretkey);
			console.log(api_signature);
			console.log("api-key" + entity.wlink_vtwo_apikey + "t" + date);
			if (entity.weather_api == "wlv2") {
				var promise = await UTILS.httpsUtil.httpReqPromise({
					"host": "api.weatherlink.com",
					"path": "/v2/current/" + stations[0].station_id + "?api-key=" + entity.wlink_vtwo_apikey + "&t=" + date + "&api-signature=" + api_signature,
					"method": "GET"
				});
				weather = JSON.parse(promise.data);
				// Add sensor category next to sensor type
				weather.sensors.map(sensor => {
					sensorsDetails.map(sensorsDetails => {
						if (sensorsDetails.lsid === sensor.lsid) {
							sensor.category = sensorsDetails.category
						}
					})
				})
			}
			UTILS.httpUtil.dataSuccess(_req, _res, "success", weather);
			return;
		}
		res.end();
		return;
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'weathermgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		_res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		_res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

/* API HANDLERS */
/* ************** */

/* *************** */
/* PLUGIN HANDLERS */

const pluginPostCreateHandler = async (req, res) => {
	try {
		if (!req.post.title) {
			UTILS.httpUtil.dataError(req, res, "Le bulletin doit avoir un titre", "Le bulletin doit avoir un titre", "400");
			return;
		}
		if (!req.post.img) {
			UTILS.httpUtil.dataError(req, res, "Le bulletin doit avoir une image", "Le bulletin doit avoir une image", "400");
			return;
		}

		if (typeof req.body == "object" && req.multipart) {
			/**@type {Omit<TYPES.T_weather, "id">} */
			const newWeather = {
				cloudinary_img_public_id: req.post.cloudinary_img_public_id || null,
				created_at: req.post.created_at || Date.now(),
				harbour_id: req.post.harbour_id || null,
				img: null,
				title: req.post.title || null,
				updated_at: req.post.updated_at || null,
			}

			//img gesture
			if (req.post.img) {
				const cloudinaryPath = `Nauticspot-Next/${newWeather.harbour_id}/weather-images/`;
				const imgData = req.post.img;
				const imgFilename = req.field["img"].filename;
				const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
				newWeather.img = uploadDetails.secure_url;
				newWeather.cloudinary_img_public_id = uploadDetails.public_id;
			}
			const createdWeather = await createWeathersV2(newWeather);
			if (createdWeather.id) {
				console.log('[INFO] new waether created SUCCESS', createdWeather);
				UTILS.httpUtil.dataSuccess(req, res, "Success", "Météo publié", "1.0");
				return;
			} else {
				console.error('[ERROR] New waether creation FAILURE', createdWeather);
				UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la publication de la météo", "1.0");
				return;
			}
		}
	} catch (error) {
		console.error('[ERROR] New waether creation FAILURE', error);
		UTILS.httpUtil.dataError(req, res, error, "Une Erreur c'est produite lors de la creation du bulletin.");
	}
};

const pluginPostUpdateHandler = async (req, res) => {
	try {
		const weatherId = req.post.id;
		/**@type {Partial<TYPES.T_weather>} */
		const weatherUpdates = { ...req.post };
		delete weatherUpdates.id;
		weatherUpdates.updated_at = Date.now();
		const updatedWeather = await updateWeathersV2({ id: weatherId}, weatherUpdates);
		console.log('updatedWeather',updatedWeather);
		UTILS.httpUtil.dataSuccess(req, res, "Weather mis à jour", "200", "1.0");
	} catch (error) {
		console.error('[ERROR]', error);
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour du bulletin météo", "500", "1.0");
	}
};

const pluginGetDeleteHandler = async (req, res) => {
	try {
		const [currentWeather] = await getWeathersV2({ id: req.get.weather_id });
		if (currentWeather?.cloudinary_img_public_id) {
			await STORE.cloudinary.deleteFile(currentWeather.cloudinary_img_public_id);
		}
		await deleteWeathersV2({ id: req.get.weather_id });
	} catch (error) {
		console.error('[ERROR]', error);
		STORE.mailjet.sendMailRaw({
			email: 'noreply@nauticspot.fr',
			name: 'Error logger',
		}, {
			email: 'g.aly@nauticspot.fr',
			name: 'ADMIN',
		}, error);
		res.setHeader("Content-Type", "text/html");
		res.end('OOPS.. Quelque chose c\'est mal passé !');
		return;
	}
};

/* PLUGIN HANDLERS */
/* *************** */

exports.handler = async (req, res) => {
	var _weather = await getWeathersV2({});
	res.end(JSON.stringify(_weather));
	return;
}

exports.router =
	[
		{
			route: "/api/weather/coord",
			handler: getWeatherFromLatLonHandler,
			method: "GET",
		},
		{
			route: "/api/weather/forecasts/:harbour_id",
			handler: getWeatherFromHarbourHandler,
			method: "GET",
		},
		{
			route: "/api/weather/wlink/vone",
			handler: getWeatherFromWeatherLinkVOneHandler,
			method: "get"
		},
		{
			route: "/api/weather/wlink/vtwo",
			handler: getWeatherFromWeatherLinkVTwoHandler,
			method: "get"
		}

	];

exports.plugin =
{
	title: "Gestion de la météo",
	desc: "",
	handler: async (req, res) => {
		console.log('WEATHER PLUGIN HANDLER');
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
		if (_entity_id === 'SlEgXL3EGoi') {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}

		if (req.method == "GET") {
			if (req.get.mode && req.get.mode == "delete" && req.get.weather_id) {
				await pluginGetDeleteHandler(req, res);
			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				await pluginPostUpdateHandler(req, res);
			} else {
				await pluginPostCreateHandler(req, res);
			}
		}
		else {
			var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
			var _weatherHtml = fs.readFileSync(path.join(__dirname, "weather.html")).toString();
			var _weathers;

			try {
				if (_role == "user") {
					const promises = [];
					_harbour_id.map(harbourId => {
						promises.push(getWeathersV2({ harbour_id: harbourId }));
					});
					const resp = await Promise.all(promises);
					_weathers = resp.flat();
				} else if (_role == "admin") {
					_weathers = await getWeathersV2({});
				}
				// _weathers = _weathers.splice(0, 500) // limit to speed up the front but should never reach that limit if we keep only the few last days of weather forecasts
			} catch (error) {
				console.error(error);
				res.setHeader("Content-Type", "text/html");
				res.end('OOPS.. Quelque chose c\'est mal passé !');
				return;
			}

			var _weatherGen = "";
			for (var i = 0; i < _weathers.length; i++) {
				var date = new Date(_weathers[i].created_at || _weathers[i].date);
				var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');
				const [currentHarbour] = await STORE.harbourmgmt.getHarbours({ id: _weathers[i].harbour_id });
				_weatherGen += _weatherHtml.replace(/__ID__/g, _weathers[i].id)
					.replace(/__FORMID__/g, _weathers[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour.id)
					.replace(/__CATEGORY__/g, _weathers[i].category)
					.replace(/__BULLETIN__/g, _weathers[i].img || '')
					.replace(/__TITLE__/g, _weathers[i].title)
					.replace(/__DATE__/g, dateFormated)
					.replace(/__DATETIMEORDER__/g, _weathers[i].created_at || _weathers[i].date)
			}
			_indexHtml = _indexHtml.replace("__WEATHER__", _weatherGen).replace(/undefined/g, '');

			var userHarbours = [];
			var harbour_select;
			if (_role == "user") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';

				const getHarbourPromises = []
				_harbour_id.map(harbourId => {
					getHarbourPromises.push(STORE.harbourmgmt.getHarbours({ id: harbourId }));
				});
				const userHarboursResp = await Promise.all(getHarbourPromises);
				const userHarbours = [];
				userHarboursResp.map(harbourList => {
					userHarbours.push(...harbourList);
				});
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

			res.setHeader("Content-Type", "text/html");
			res.end(_indexHtml);
			return;
		}
	}
}

exports.store = {
	find: getWeathersV2,
	create: createWeathersV2,
	delete: deleteWeathersV2,
};