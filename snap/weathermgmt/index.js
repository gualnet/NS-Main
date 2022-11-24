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

var _weatherCol = "weather";

var _userCol = "user";
var path_to_img = path.resolve(path.join(CONF.instance.static, "img", "bulletin"));

function testOnlyAplhaNum(value) {
    if (value.match("^[a-zA-Z0-9]*.png$")) {
        return true;
    } else
        return false;
}

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
        UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
        return false;
    }
    if (!_req.post.content || _req.post.content.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Contenu requis", "100", "1.0");
        return false;
    }
    if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
        return false;
    }
    if (!_req.post.category == "news" || !_req.post.category == "event") {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
        return false;
    }
    return true;
}


async function getWeather(queryObj) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const findWeatherResp = await DB_NS.weather.find(queryObj, { raw: 1 });
	if (findWeatherResp.error) {
		throw new Error(findWeatherResp);
	}
	return findWeatherResp.data;
}

async function delWeather(item) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const deleteWeatherResp = await DB_NS.weather.delete({ id : item }, { raw: 1 });
	if (deleteWeatherResp.error) {
		throw new Error(deleteWeatherResp);
	}
	return;
}

async function createWeather(item) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createWeatherResp = await DB_NS.weather.create(item, { raw: 1 });
	if (createWeatherResp.error) {
		throw new Error(createWeatherResp);
	}
	return(createWeatherResp.data);
}

async function updateWeather(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_weatherCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getWeatherFromHarbourHandler(_req, _res) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;
	try {
		const findWeatherResp = await DB_NS.weather.find({ harbour_id: _req.param.harbour_id }, { raw: 1 });
		if (findWeatherResp.error) {
			throw new Error(findWeatherResp.message);
		}
		let weather = findWeatherResp.data;
    weather = weather.sort(dynamicSort("date")).reverse();
    if (weather[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", weather[0])
        return;
    }
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
			// console.log(entity.wlink_vtwo_secretkey);
			let stations;

			var date = Math.floor(Date.now() / 1000);
			let message = "api-key" + entity.wlink_vtwo_apikey + "t" + date;
			let secretkey = entity.wlink_vtwo_secretkey;
			let api_signature = crypto.createHmac('SHA256', secretkey).update(message).digest('hex')//UTILS.Crypto.createSHA256(message + secretkey);
			// console.log(api_signature);
			// console.log("api-key" + entity.wlink_vtwo_apikey + "t" + date);
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
							"path": "/v2/current/"  + stations[0].station_id +  "?api-key=" + entity.wlink_vtwo_apikey + "&t=" + date + "&api-signature=" + api_signature,
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
			// console.log('weather current', weather);
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

exports.handler = async (req, res) => {
    var _weather = await getWeather();
    res.end(JSON.stringify(_weather));
    return;
}

exports.router =
    [
        {
            route: "/api/weather/:harbour_id",
            handler: getWeatherFromHarbourHandler,
            method: "GET",
        },
        {
            route: "/api/weather/coord/",
            handler: getWeatherFromLatLonHandler,
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

				if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)){
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
					try {
						if (req.get.mode && req.get.mode == "delete" && req.get.weather_id) {
							const [currentWeather] = await getWeather({ id: req.get.weather_id });
							if (currentWeather?.cloudinary_img_public_id) {
								await STORE.cloudinary.deleteFile(currentWeather.cloudinary_img_public_id);
							}
							await delWeather(req.get.weather_id);
						}
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
				}
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
									req.post.updated_at = Date.now();
                    if (typeof (await updateWeather(req.post)) != "string") {
                        UTILS.httpUtil.dataSuccess(req, res, "Weather mis à jour", "1.0");
                        return;
                    }
                }
            }
            else {
							if (!req.post.title) {
								UTILS.httpUtil.dataError(req, res, "Le bulletin doit avoir un titre", "Le bulletin doit avoir un titre");
								return;
							}
							if (!req.post.img) {
								UTILS.httpUtil.dataError(req, res, "Le bulletin doit avoir une image", "Le bulletin doit avoir une image");
								return;
							}

                if (typeof req.body == "object" && req.multipart) {
                    var _FD = req.post;

                    // _FD.date = Date.now();
                    _FD.created_at = Date.now();

                    //img gesture
                    if (_FD.img) {
                        const upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                    }
										try {
											const weather = await createWeather(_FD);
											if (weather.id) {
												console.log('[INFO] new waether created SUCCESS', weather);
												UTILS.httpUtil.dataSuccess(req, res, "Success", "Météo publié", "1.0");
												return;
											} else {
												console.error('[ERROR] New waether creation FAILURE', weather);
												UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la publication de la météo", "1.0");
												return;
											}
										} catch (error) {
											console.error('[ERROR] New waether creation FAILURE', error);
											UTILS.httpUtil.dataError(req, res, error, "Une Erreur c'est produite lors de la creation du bulletin.");
											return;
										}
                    
                }
            }
        }
        else {
					var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _weatherHtml = fs.readFileSync(path.join(__dirname, "weather.html")).toString();
            var _weathers;

            function reformatDate(_date) {
                var split = _date.split(" ");
                var reformat = split[0].split("-")
                reformat = reformat[2] + reformat[1] + reformat[0] + split[1];
                console.log(reformat);
                return reformat;
            }

						try {
							if (_role == "user") {
								const promises = [];
								_harbour_id.map(harbourId => {
									promises.push(getWeather({ harbour_id: harbourId }));
								});
								const resp = await Promise.all(promises);
								_weathers = resp.flat();
							} else if (_role == "admin") {
								_weathers = await getWeather();
							}
						} catch (error) {
							console.error(error);
							res.setHeader("Content-Type", "text/html");
							res.end('OOPS.. Quelque chose c\'est mal passé !');
							return;
						}

            var _weatherGen = "";
            for (var i = 0; i < _weathers.length; i++) {
                var date = new Date(_weathers[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_weathers[i].harbour_id);
                _weatherGen += _weatherHtml.replace(/__ID__/g, _weathers[i].id)
                    .replace(/__FORMID__/g, _weathers[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, _weathers[i].category)
                    .replace(/__BULLETIN__/g, _weathers[i].img || '')
                    .replace(/__TITLE__/g, _weathers[i].title)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _weathers[i].date)
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
								getHarbourPromises.push(DB_NS.harbour.find({ id: harbourId }, { raw: 1 }));
							});

							const userHarboursResp = await Promise.all(getHarbourPromises);
							let findError;
							const userHarbours = [];
							userHarboursResp.map(resp => {
								if (resp.error) findError = resp;
								else userHarbours.push(...resp.data);
							});
							if (findError?.error) {
								console.error(error);
								res.setHeader("Content-Type", "text/html");
								res.end('OOPS.. Quelque chose c\'est mal passé !');
								return;
							}
                userHarbours.map(userHarbour => {
                    harbour_select += '<option value="' + userHarbour.id + '">' + userHarbour.name + '</option>';
                });

                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';

							const findHarbourResp = await DB_NS.harbour.find({}, { raw: 1 });
							if (findHarbourResp.error) {
								console.error(error);
								res.setHeader("Content-Type", "text/html");
								res.end('OOPS.. Quelque chose c\'est mal passé !');
								return;
							}
							userHarbours = findHarbourResp.data;
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
	createWeather,
};