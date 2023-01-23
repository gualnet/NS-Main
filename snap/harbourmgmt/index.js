const myLogger = require('../lib-js/myLogger');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const TYPES = require('../../types');
var _harbourCol = "harbour";
var _userCol = "user";

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^\d{10}$|^\d{9}$/;
    return re.test(String(phone).toLowerCase());
}

function validateGpsCoord(coord) {
    const re = /^-?\d{1,2}\.\d{1,}$/;
    return re.test(String(coord).toLowerCase());
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

function completePhonePrefix(prefix) {
    var patternPrefix = new RegExp(/^\+/)
    if (patternPrefix.test(prefix)) {
        return prefix
    } else {
        return '+' + prefix;
    }
}

function validateUrl(value) {
    var pattern = new RegExp('^(https?:\\/\\/)' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + //port
        '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i');
    return pattern.test(value);
}

function verifyPostReq(_req, _res) {
    if (!_req.post.name || _req.post.name.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de port requis", "100", "1.0");
        return false;
    }
    if (!_req.post.email || _req.post.email.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Email requis", "100", "1.0");
        return false;
    }
    if (!validateEmail(_req.post.email)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Email invalide", "100", "1.0");
        return false;
    }
    if (_req.post.email_concierge) {
        var mails = _req.post.email_concierge.split(";")
        for (var i = 0; i < mails.length; i++) {
            if (!validateEmail(mails[i])) {
                UTILS.httpUtil.dataError(_req, _res, "Error", "Email conciergerie invalide : " + mails[i], "100", "1.0");
                return false;
            }
        }
    }
    if (!_req.post.phone || _req.post.phone.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
        return false;
    }
    if (!_req.post.prefix || _req.post.prefix.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
        return false;
    }
    if (_req.post.phone_urgency) {
        if (!_req.post.prefix_urgency || _req.post.prefix_urgency.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du téléphone d'urgence requis", "100", "1.0");
            return false;
        }
    }
    if (!validatePhone(_req.post.phone)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
        return false;
    }
    if (!_req.post.latitude || _req.post.latitude.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Latitude requis", "100", "1.0");
        return false;
    }
    if (!validateGpsCoord(_req.post.latitude)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Latitude incorrect", "100", "1.0");
        return false;
    }
    if (!_req.post.longitude || _req.post.longitude.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Longitude requis", "100", "1.0");
        return false;
    }
    if (!validateGpsCoord(_req.post.longitude)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Longitude incorrect", "100", "1.0");
        return false;
    }
    if (_req.post.website) {
        if (validateUrl(_req.post.website) != true) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "URL incorrect", "100", "1.0");
            return false;
        }
    }
    if (_req.post.touristwebsite) {
        if (validateUrl(_req.post.touristwebsite) != true) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "URL incorrect", "100", "1.0");
            return false;
        }
    }
    return true;
}

//bdd requests
async function getHarbourById(_id) {
	const harbours = await getHarboursV2({ id: _id });
	return harbours[0];
};

/**
 * @returns {Promise<Array<TYPES.T_harbour>>}
 */
async function getHarbour() {
	return getHarboursV2();
};

/**
 * 
 * @param {Object} where 
 * @returns {Promise<TYPES.T_harbour[]>}
 */
const getHarboursV2 = async (where = {}) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	// console.info('[INFO] find harbours where:', where);
	// const findHarboursResp = await DB_NS.harbour.find(where, { raw: 1 });
	const findHarboursResp = await DB_NS.harbour.find(where);
	if (findHarboursResp.error) {
		throw new Error(findHarboursResp.message, { cause: findHarboursResp });
	}
	const harbours = findHarboursResp.data;
	// console.info(`Found ${harbours.length} Harbour(s)`);
	return harbours;
}

async function getHarbourByEntityId(_entity_id) {
	return getHarboursV2({ id_entity: _entity_id });
}

async function delHarbour(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_harbourCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createHarbour(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_harbourCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateHarbour(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_harbourCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateHarbourWhere(updateFieds, whereFields) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_harbourCol, whereFields, updateFieds, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

const getAllHarboursMappedById = async () => {
	/**@type {TYPES.T_harbour[]} */
	const harbours = await STORE.harbourmgmt.getHarbours();
	const harboursMapById = {};
	harbours.map(harbour => {
		harboursMapById[harbour.id] = harbour;
	})
	return harboursMapById;
}

//routes handlers
async function getHarbourList(req, res) {
		const harbours = await getHarboursV2({ id_entity: req.param.entity_id });
    var harboursSimplified = [];
    for (var i = 0; i < harbours.length; i++) {
        harboursSimplified[i] = { name: harbours[i].name, id: harbours[i].id, img: harbours[i].img };
    }
    UTILS.httpUtil.dataSuccess(req, res, "harbours simplified list", harboursSimplified, "1.0");
    return;
}

async function getHarbourInfos(req, res) {
    const harbours = await getHarboursV2({ id: req.param.harbour_id });
		let harbour = [];
		if (harbours.length > 0) harbour = harbours[0];
    UTILS.httpUtil.dataSuccess(req, res, "success, harbour infos", harbour, "1.0");
    return;
}

/* ---------------------- */
/* NEW API HANDLERS START */
/* ---------------------- */

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function getHarboursHandler(req, res) {
    console.log('get', req.get);
    try {
        const ret = await getHarboursV2(req.get);
        res.end(JSON.stringify({ results: ret }));
    } catch (error) {
			console.error('[ERROR]', error);
			myLogger.logError(error, { module: 'harbourmgmt' })
			const errorHttpCode = error.cause?.httpCode || 500;
			res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				success: false,
				error: error.toString(),
			}));
    }
};

async function updateHarboursHandler(req, res) {
    console.log('req.get', req.get);
    console.log('req.body', req.body);
    try {
        const harbourUpdate = { ...req.body };
        const whereFields = { ...req.get };

        // TODO - check for requested fields

        const result = await updateHarbourWhere(harbourUpdate, whereFields);
        res.end(JSON.stringify({ results: result }));
    } catch (error) {
			console.error('[ERROR]', error);
			myLogger.logError(error, { module: 'harbourmgmt' })
			const errorHttpCode = error.cause?.httpCode || 500;
			res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				success: false,
				error: error.toString(),
			}));
    }
}
/* -------------------- */
/* NEW API HANDLERS END */
/* -------------------- */


exports.store =
{
	getHarbour: getHarbour, // historic
	getHarbours: getHarboursV2,
	getHarbourByEntityId: getHarbourByEntityId,
	getHarbourById: getHarbourById,
	getAllHarboursMappedById,
}
exports.router = [
    {
        on: true,
        route: "/api/getharbours/:entity_id",
        handler: getHarbourList,
        method: "GET",
    },
    {
        on: true,
        route: "/api/getharbour/:harbour_id",
        handler: getHarbourInfos,
        method: "GET",
    },

    // * API NEXT GEN
    {
        on: true,
        route: "/api/next/harbours",
        handler: getHarboursHandler,
        method: "GET"
    },
    {
        on: true,
        route: "/api/next/harbours",
        handler: updateHarboursHandler,
        method: "PUT"
    },
    {
        on: false,
        route: "/api/next/harbours",
        // handler: deleteHarboursWhere,
        method: "DELETE"
    },

];


exports.handler = async (req, res) => {
		const harbours = await getHarboursV2();
    res.end(JSON.stringify(harbours));
    return;
}

exports.plugin =
{
    title: "Gestion des ports",
    desc: "",
    handler: async (req, res) => {
				// var admin = await getAdminById(req.userCookie.data.id);
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
            if (req.get.mode && req.get.mode == "delete" && req.get.harbour_id) {
                //delete harbour
                var currentHarbour = await getHarboursV2({ id: req.get.harbour_id });
                if (currentHarbour.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_img_public_id);
                }
                if (currentHarbour.cloudinary_harbour_map_public_id) {
                    await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_harbour_map_public_id);
                }
                if (currentHarbour.cloudinary_price_list_public_id) {
                    await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_price_list_public_id);
                }
                await delHarbour(req.get.harbour_id);
            }
            else if (req.get.harbourlist) {
                const harbourlist = await getHarboursV2();
                UTILS.httpUtil.dataSuccess(req, res, harbourlist, "1.0");
                return;
            }
        }
        if (req.method == "POST") {
            if (req.post.website)
                req.post.website = addProtocolToUrl(req.post.website);
            if (req.post.touristwebsite)
                req.post.touristwebsite = addProtocolToUrl(req.post.touristwebsite);

            if (req.post.erp_link)
                req.post.erp_link = addProtocolToUrl(req.post.erp_link);

            if (req.post.prefix)
                req.post.prefix = completePhonePrefix(req.post.prefix);
            if (req.post.prefix_urgency) {
                req.post.prefix_urgency = completePhonePrefix(req.post.prefix_urgency);
            }

            if (req.post.prefix && req.post.phone) {
                req.post.prefixed_phone = req.post.prefix + req.post.phone.replace(/^0/, '');
            }

            if (req.post.prefixed_phone_urgency && req.post.phone_urgency) {
                req.post.prefixed_phone_urgency = req.post.prefix + req.post.phone_urgency.replace(/^0/, '');
            }

            if (req.post.api_erp_token) {
                req.post.apiErpToken = req.post.api_erp_token;
                delete req.post.api_erp_token;
            } else {
                req.post.apiErpToken = undefined;
            }

            if (req.post.id) {
								console.log('req.post',req.post);
								//update harbour
								var currentHarbour = await getHarboursV2({ id: req.post.id });
                if (verifyPostReq(req, res)) {
                    //img gesture
                    if (req.post.img) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.img, req.field["img"].filename);
                        console.log(upload);
                        req.post.img = upload.secure_url;
                        req.post.cloudinary_img_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_img_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_img_public_id);
                        }
                    }

                    //harbour map gesture
                    if (req.post.harbour_map) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.harbour_map, req.field["harbour_map"].filename);
                        console.log(upload);
                        req.post.harbour_map = upload.secure_url;
                        req.post.cloudinary_harbour_map_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_harbour_map_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_harbour_map_public_id);
                        }
                    }

                    //price list gesture
                    if (req.post.price_list) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.price_list, req.field["price_list"].filename);
                        console.log(upload);
                        req.post.price_list = upload.secure_url;
                        req.post.cloudinary_price_list_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_price_list_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_price_list_public_id);
                        }
                    }

                    //pj gesture
                    if (req.post.pj) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.pj, req.field["pj"].filename);
                        console.log(upload);
                        req.post.pj = upload.secure_url;
                        req.post.cloudinary_pj_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_pj_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_pj_public_id);
                        }
                    }

                    if (!req.post.email_concierge) req.post.email_concierge = '';
										if (!req.post.wifi) req.post.wifi = '';
										if (!req.post.wifi_pass) req.post.wifi_pass = '';
										if (!req.post.sanitary_code) req.post.sanitary_code = '';
										if (!req.post.portal_code) req.post.portal_code = '';

                    console.log('UPDATE POST', req.post);
                    var harbour = await updateHarbour(req.post);
                    if (harbour[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Port mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour du port", "1.0");
                        return;
                    }
                }
            }
            else {
                //create harbour
                req.post.date = Date.now();
                if (verifyPostReq(req, res)) {
                    //img gesture
                    if (req.post.img) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.img, req.field["img"].filename);
                        console.log(upload);
                        req.post.img = upload.secure_url;
                        req.post.cloudinary_img_public_id = upload.public_id;
                    }

                    //harbour map gesture
                    if (req.post.harbour_map) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.harbour_map, req.field["harbour_map"].filename);
                        console.log(upload);
                        req.post.harbour_map = upload.secure_url;
                        req.post.cloudinary_harbour_map_public_id = upload.public_id;
                    }

                    //price list gesture
                    if (req.post.price_list) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.price_list, req.field["price_list"].filename);
                        console.log(upload);
                        req.post.price_list = upload.secure_url;
                        req.post.cloudinary_price_list_public_id = upload.public_id;
                    }

                    //pj gesture
                    if (req.post.pj) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.pj, req.field["pj"].filename);
                        console.log(upload);
                        req.post.pj = upload.secure_url;
                        req.post.cloudinary_pj_public_id = upload.pj;
                    }

                    var harbour = await createHarbour(req.post);
                    // console.log('created harbour: ', harbour);
                    if (harbour.id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Port créé", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création du port", "1.0");
                        return;
                    }
                }
            }
        }
        else {
            var _indexHtml;
            var _harbourHtml;
            /**@type {Array<T_harbour} */
            var _harbours = [];

            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
									const harbours = await getHarboursV2({ id: _harbour_id[i] });
									_harbours[i] = harbours[0];
                }
                _indexHtml = fs.readFileSync(path.join(__dirname, "indexuser.html")).toString();
                _harbourHtml = fs.readFileSync(path.join(__dirname, "harbouruser.html")).toString();
            }
            else if (_role == "admin") {
                _harbours = await getHarboursV2();
                _harbourHtml = fs.readFileSync(path.join(__dirname, "harbour.html")).toString();
                _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            }
            var _harbourGen = "";
            for (var i = 0; i < _harbours.length; i++) {
							  let formatedDate = '-';
                if (_harbours[i].date) {
                    const dateObj = new Date(_harbours[i].date)
                    const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
                    const date = splited[0];
                    const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
                    formatedDate = `${date} à ${heure}`;
                } secretApiErpToken = _harbours[i].apiErpToken?.slice(0, 5) + '******';
                _harbourGen += _harbourHtml.replace(/__ID__/g, _harbours[i].id)
                    .replace(/__FORMID__/g, _harbours[i].id.replace(/\./g, "_"))
                    .replace(/__ID_ENTITY__/g, _harbours[i].id_entity)
                    .replace(/__NAME__/g, _harbours[i].name)
                    .replace(/__EMAIL__/g, _harbours[i].email)
                    .replace(/__PREFIX__/g, _harbours[i].prefix)
                    .replace(/__PHONE__/g, _harbours[i].phone)
                    .replace(/__PREFIX_URGENCY__/g, _harbours[i].prefix_urgency)
                    .replace(/__PHONE_URGENCY__/g, _harbours[i].phone_urgency)
                    .replace(/__ADDRESS__/g, _harbours[i].address)
                    .replace(/__LATITUDE__/g, _harbours[i].latitude)
                    .replace(/__LONGITUDE__/g, _harbours[i].longitude)
                    .replace(/__LUNDI__/g, _harbours[i].lundi)
                    .replace(/__MARDI__/g, _harbours[i].mardi)
                    .replace(/__MERCREDI__/g, _harbours[i].mercredi)
                    .replace(/__JEUDI__/g, _harbours[i].jeudi)
                    .replace(/__VENDREDI__/g, _harbours[i].vendredi)
                    .replace(/__SAMEDI__/g, _harbours[i].samedi)
                    .replace(/__DIMANCHE__/g, _harbours[i].dimanche)
                    .replace(/__WEBSITE__/g, _harbours[i].website)
                    .replace(/__TOURISTWEBSITE__/g, _harbours[i].touristwebsite)
                    .replace(/__TECHNICAL_INFORMATIONS__/g, _harbours[i].technical_informations)
                    .replace(/__VFH__/g, _harbours[i].vfh)
                    .replace(/__PLACES__/g, _harbours[i].places)
                    .replace(/__BUOY__/g, _harbours[i].buoy)
                    .replace(/__TIRANTDEAU__/g, _harbours[i].tirantdeau)
                    .replace(/__LONGMAX__/g, _harbours[i].longmax)
                    .replace(/__ELECTRICITY__/g, _harbours[i].electricity)
                    .replace(/__WATER__/g, _harbours[i].water)
                    .replace(/__DOUCHES__/g, _harbours[i].showers)
                    .replace(/__TOILET__/g, _harbours[i].toilet)
                    .replace(/__SANITARY_CODE__/g, _harbours[i].sanitary_code)
                    .replace(/__FUEL__/g, _harbours[i].fuel)
                    .replace(/__PORTAL_CODE__/g, _harbours[i].portal_code)
                    .replace(/__WIFI__/g, _harbours[i].wifi)
                    .replace(/__WIFI_PASS__/g, _harbours[i].wifi_pass)
                    .replace(/__GOOGLE_MAP_LINK__/g, _harbours[i].google_map_link)
                    .replace(/__IMG__/g, _harbours[i].img)
                    .replace(/__HARBOUR_MAP__/g, _harbours[i].harbour_map)
                    .replace(/__PRICE_LIST__/g, _harbours[i].price_list)
                    .replace(/__ERP_LINK__/g, _harbours[i].erp_link)
                    .replace(/__PJ__/g, _harbours[i].pj)
                    .replace(/__PJ_NAME__/g, _harbours[i].pj_name)
                    .replace(/__EMAIL_CONCIERGE__/g, _harbours[i].email_concierge)
                    .replace(/__EMAIL_INCIDENT__/g, _harbours[i].email_incident)
                    .replace(/__EMAIL_ABSENCE__/g, _harbours[i].email_absence)
                    .replace(/__NAVILY_ID__/g, _harbours[i].navily_id)
                    .replace(/__DATE_CREATION__/g, formatedDate)
            }
            _indexHtml = _indexHtml.replace("__HARBOURS__", _harbourGen).replace(/undefined/g, '');
            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}