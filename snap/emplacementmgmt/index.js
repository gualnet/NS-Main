const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');
const TYPES = require('../../types');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
    ROLES.SUPER_ADMIN,
];

var _userCol = "user";
var _placeCol = "place";
var _zoneCol = "zone";
var _userFpCol = "user";


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^0\d{9}$/;
    return re.test(String(phone).toLowerCase());
}

function validateGpsCoord(coord) {
    const re = /^\d{1,2}\.\d{1,}$/;
    return re.test(String(coord).toLowerCase());
}


function completePhonePrefix(prefix) {
    var patternPrefix = new RegExp(/^\+/)
    if (patternPrefix.test(prefix)) {
        return prefix
    } else {
        return '+' + prefix;
    }
}

function verifyPhonePrefix(prefix) {
    var pattern = new RegExp(/^\+?[0-9]*/);
    if (pattern.test(prefix))
        return false;
    else
        return true;
}


function verifyPostReq(_req, _res, isUpdate) {
    if (!_req.post.first_name || _req.post.first_name.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Prénom requis", "100", "1.0");
        return false;
    }
    if (!_req.post.last_name || _req.post.last_name.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de famille requis", "100", "1.0");
        return false;
    }
    if (!_req.post.email || _req.post.email.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Email requis", "100", "1.0");
        return false;
    }
    if (!validateEmail(_req.post.email)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Email incorrect", "100", "1.0");
        return false;
    }
    if (!_req.post.phone || _req.post.phone.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
        return false;
    }
    if (!_req.post.prefix || _req.post.prefix.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
        return false;
    }
    if (verifyPhonePrefix(_req.post.prefix)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone invalide", "100", "1.0");
        return false;
    }
    if (!validatePhone(_req.post.phone)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "téléphone incorrect", "100", "1.0");
        return false;
    }
    if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "aucun port séléctionné", "100", "1.0");
        return false;
    }
    if (isUpdate == false) {
        if (!_req.post.password || _req.post.password.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "aucun mot de passe", "100", "1.0");
            return false;
        }
        if (!_req.post.password_confirm || _req.post.password_confirm.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "aucun mot de passe de confirmation", "100", "1.0");
            return false;
        }
        if (_req.post.password != _req.post.password_confirm) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "mot de passe non identiques", "100", "1.0");
            return false;
        }
    }
    if (!validatePhone(_req.post.phone)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
        return false;
    }
    return true;
}

//bdd requests
async function getPlace() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_placeCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getPlaceByCaptorNumber(_captorNumber) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_placeCol, { captorNumber: _captorNumber }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function createPlace(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_placeCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updatePlace(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_placeCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getPlaceByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_placeCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function findPlaceByHarbourIdAnNumber(_harbour_id, _number) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_placeCol, { harbour_id: _harbour_id, number: _number }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getPlaceById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_placeCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delPlace(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_placeCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}


async function getZone() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_zoneCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function createZone(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_zoneCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updateZone(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_zoneCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getZoneByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_zoneCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getPontonZoneByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_zoneCol, { harbour_id: _harbour_id, type: "ponton" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getPontonZoneByHarbourIdAndName(_harbour_id, _name) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_zoneCol, { harbour_id: _harbour_id, type: "ponton", name: _name }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getPontonZone(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_zoneCol, { type: "ponton" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getZoneById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_zoneCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delZone(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_zoneCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}




async function getAdminById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.FindById(_userFpCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delMail(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_mailCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

exports.handler = async (req, res) => {
    //var _user = await getUser();
    res.end();
    return;
}

exports.plugin =
{
    title: "Gestion des emplacements",
    desc: "",
    handler: async (req, res) => {
        console.log('EMPLACEMENT HANDLER');
        /**@type {TYPES.T_SCHEMA['fortpress']} */
        const DB_FP = SCHEMA.fortpress;

        // var admin = await getAdminById(req.userCookie.data.id);
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
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.zone_id) {
                await delZone(req.get.zone_id);
            } else if (req.get.mode && req.get.mode == "delete" && req.get.place_id) {
                await delPlace(req.get.place_id);
            }
        }
        if (req.method == "POST") {
            console.log('POST', req.post);
            if (req.post.id) {
                if (req.post.type == "zone") {
                    delete req.post.type;
                    await updateZone(req.post);
                    UTILS.httpUtil.dataSuccess(req, res, "Zone mise à jour", "1.0");
                    return;

                } else if (req.post.type == "place") {
                    delete req.post.type;
                    await updatePlace(req.post);
                    UTILS.httpUtil.dataSuccess(req, res, "Place mise à jour", "1.0");
                    return;

                }
                res.end();
                return;
            } else if (req.post.type == 'csvzone') {
                var zonesArray = req.post.csvzones.replace(/\n/g, '').split('\r');
                console.log('[INFO] Creating new zones', zonesArray);
                let createdZones = [];
                for (var i = 1; i < zonesArray.length; i++) {
                    let zoneInfo = zonesArray[i].split(';');
                    let doublonZone = await getPontonZoneByHarbourIdAndName(req.post.harbour_id, zoneInfo[0]);
                    if (!doublonZone[0]) {
                        let id = makeid(10) + '_' + Date.now();
                        let zone = { id: id, harbour_id: req.post.harbour_id, name: zoneInfo[0], type: "ponton" }
                        createdZones.push(await createZone(zone));
                    }
                }
                UTILS.httpUtil.dataSuccess(req, res, "success", "zones added", createdZones, '1.0');
                return;
            } else if (req.post.type == 'csvplace') {

                var placesArray = req.post.csvplaces.replace(/\n/g, '').split('\r');
                console.log('[INFO] Creating new places', zonesArray);
                let createdPlaces = [];
                for (var i = 1; i < placesArray.length; i++) {
                    let placeInfo = placesArray[i].split(';');
                    //place = (place[])
                    let id = makeid(10) + '_' + Date.now();
                    let ponton = await getPontonZoneByHarbourIdAndName(req.post.harbour_id, placeInfo[10]);
                    if (!ponton[0]) {
                        ponton = "";
                    } else {
                        ponton = ponton[0].id;
                    }
                    var doublonPlace = await findPlaceByHarbourIdAnNumber(req.post.harbour_id, placeInfo[0]);
                    if (!doublonPlace[0]) {

                        let place = { id: id, harbour_id: req.post.harbour_id, number: placeInfo[0], captorNumber: placeInfo[1], pontonId: ponton, longueur: placeInfo[2], largeur: placeInfo[3], tirantDeau: placeInfo[4], type: placeInfo[5], nbTramesDepart: placeInfo[6], nbTramesRetour: placeInfo[7], maxSeuil: placeInfo[8], minSeuil: placeInfo[9], occupation: "occupied" };
                        console.log(place);
                        createdPlaces.push(await createPlace(place));
                    } else {
                        let place = { id: doublonPlace[0].id, harbour_id: req.post.harbour_id, number: placeInfo[0], captorNumber: placeInfo[1], pontonId: ponton, longueur: placeInfo[2], largeur: placeInfo[3], tirantDeau: placeInfo[4], type: placeInfo[5], nbTramesDepart: placeInfo[6], nbTramesRetour: placeInfo[7], maxSeuil: placeInfo[8], minSeuil: placeInfo[9], occupation: "occupied" };
                        await updatePlace(place);
                    }
                }
                UTILS.httpUtil.dataSuccess(req, res, "success", "places added", createdPlaces, '1.0');
                return;
            }

        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _placeHtml = fs.readFileSync(path.join(__dirname, "place.html")).toString();
            var _zoneHtml = fs.readFileSync(path.join(__dirname, "zone.html")).toString();
            var _places = [];
            var _zones = [];





            var userHarbours = [];
            var harbour_select;
            if (_role == "user") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" id="harbour_id" style="width:250px;" name="harbour_id">';

                const getHarbourPromises = await _harbour_id.map(harbour => STORE.harbourmgmt.getHarbourById(harbour))
                userHarbours = await Promise.all(getHarbourPromises);
                userHarbours.map(userHarbour => {
                    harbour_select += '<option value="' + userHarbour.id + '">' + userHarbour.name + '</option>';
                });

                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" id="harbour_id" style="width:250px;" name="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();
                userHarbours.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);

                for (var i = 0; i < userHarbours.length; i++) {
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            }
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_PLACE_INPUT__', harbour_select.replace('id="harbour_id"', 'id="harbourid_place"'));
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_PONTON_INPUT__', harbour_select.replace('id="harbour_id"', 'id="harbourid_ponton"'));

            _places = await getPlaceByHarbourId(userHarbours[0].id);
            _zones = await getPontonZoneByHarbourId(userHarbours[0].id);

            var _placeGen = "";
            for (var i = 0; i < _places.length; i++) {
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_places[i].harbour_id);
                _placeGen += _placeHtml.replace(/__ID__/g, _places[i].id)
                    .replace(/__FORMID__/g, _places[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__NUMBER__/g, _places[i].number)
                    .replace(/__CAPTOR_NUMBER__/g, _places[i].captorNumber)
                    .replace(/__LONGUEUR__/g, _places[i].longueur)
                    .replace(/__LARGEUR__/g, _places[i].largeur)
                    .replace(/__TIRANTDEAU__/g, _places[i].tirantDeau)
                    .replace(/__TYPE__/g, _places[i].type)
                    .replace(/__NBTRAMESDEPART__/g, _places[i].nbTramesDepart)
                    .replace(/__NBTRAMESRETOUR__/g, _places[i].nbTramesRetour)
                    .replace(/__MAXSEUIL__/g, _places[i].maxSeuil)
                    .replace(/__MINSEUIL__/g, _places[i].minSeuil)
            }

            var _zoneGen = "";
            for (var i = 0; i < _zones.length; i++) {
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_zones[i].harbour_id);
                _zoneGen += _zoneHtml.replace(/__ID__/g, _zones[i].id)
                    .replace(/__FORMID__/g, _zones[i].id.replace(/\./g, "_"))
                    .replace(/__NAME__/g, _zones[i].name)
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
            }

            _indexHtml = _indexHtml.replace("__PLACES__", _placeGen).replace("__ZONES__", _zoneGen).replace(/undefined/g, '');




            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}

/* ******** */
/* SERVICES */
/* SERVICES */
/* ******** */


/* ************** */
/* DB HANDLERS V2 */


/**
 * 
 * @param {} searchOpt 
 * @returns {Promise<TYPES.T_place[]>}
 */
const getPlacesV2 = async (searchOpt) => {
    /**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
    const DB_NS = SCHEMA.NAUTICSPOT;

    console.log('Find places params', searchOpt);
    const getPlacesV2Resp = await DB_NS.place.find(searchOpt);
    if (getPlacesV2Resp.error) {
        throw new Error(getPlacesV2Resp.message, { cause: getPlacesV2Resp });
    }

    const places = getPlacesV2Resp.data;
    console.log(`Number of places found: `, places.length);
    return places;
};

/**
 * 
 * @param {Pick<TYPES.T_place, 'id'|'captorNumber'|'number'>} where 
 * @param {*} updates 
 * @returns {Promise<TYPES.T_place[]>}
 */
const updatePlacesV2 = async (where, updates) => {
    console.log('=====updatePlacesV2=====');
    /**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
    const DB_NS = SCHEMA.NAUTICSPOT;

    if (Object.keys(where).length < 1) {
        throw new Error('Wrong parameter: ' + where);
    }

    console.log('Update places where: ', where);
    console.log('Update places with: ', updates);
    const updatePlacesResp = await DB_NS.place.update(where, updates);
    if (updatePlacesResp.error) {
        console.error(updatePlacesResp.error);
        throw new Error(updatePlacesResp.message, { cause: updatePlacesResp });
    }
    const places = updatePlacesResp.data;
    console.log(`${places.length} place(s) Updated`);
    return places;
};

/* DB HANDLERS V2 */
/* ************** */

// /* ************** */
// /* API HANDLERS */

/**
 * This function is used to sync the captor numbers from IAS to Fortpress
 * @param {*} req 
 * @param {*} res 
 */
const updatePlaceCaptorFromIasHandler = async (req, res) => {
    console.log('====updatePlacesHandler====')
    try {
        const bearerToken = req.headers["authorization"];
        const token = bearerToken?.split(' ')[1];
        if (token !== OPTION.IAS_REQUEST_TOKEN) {
            throw new Error('User not autorized', { cause: { httpCode: 401 } });
        }
        if (!req.get.captor_number || req.get.captor_number?.trim().length === 0) {
            throw new Error('A captor number value must be provided', { cause: { httpCode: 400 } });
        }

        const where = {
            harbour_id: harbourIdMapper[req.get.harbor_id].fp_id,
            number: req.get.number,
        };
        const captorNumber = (req.get.captor_number === 'null') ? null : req.get.captor_number?.trim();

        const updatedPlace = await updatePlacesV2(where, {captorNumber});
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

// /* API HANDLERS */
// /* ************** */

const harbourIdMapper = {
    '1': { name: 'Port Heraclea',fp_id: '4e.mx_85wK', ias_id: 1 },
    '4': { name: 'Gruissan',fp_id: '4e2cd2p6mt', ias_id: 4 },
    '5': { name: 'Palavas-Les-Flots',fp_id: 'NxfYN1MNNY', ias_id: 5 },
    '6': { name: 'Cap omega',fp_id: '', ias_id: 6 },
    '8': { name: 'Menton Garavan',fp_id: 'Nxs1tMY37Y', ias_id: 8 },
    '9': { name: 'Menton Vieux Port',fp_id: 'EgiqgIFh7K', ias_id: 9 },
    '10': { name: 'Leucate',fp_id: 'EgDGCtXVVK', ias_id: 10 },
    '12': { name: 'Port Carnon',fp_id: 'Nx6KHMP2mY', ias_id: 12 },
    '16': { name: 'Saint-Laurent ', fp_id: '4eG9_R4jHNF', ias_id: 16 },
    '19': { name: 'La Grande Motte ',fp_id: 'VetjeuxdVF', ias_id: 19 },
    '22': { name: 'Marina de Valencia',fp_id: 'Sld0Hl_BN5', ias_id: 22 },
    '24': { name: 'Beaulieu Plaisance',fp_id: '.xMO33Io', ias_id: 24 },
    '27': { name: 'Villefranche-sur-Mer',fp_id: 'VlKMiFWkNK', ias_id: 27 },
    '28': { name: 'Bonifacio Marina',fp_id: 'BxqaMWYBqc', ias_id: 28 },
    '29': { name: 'Ajaccio -  C. Ornano',fp_id: 'SlUyrmPHE9', ias_id: 29 },
    '30': { name: 'Porto-Vecchio',fp_id: 'HgfhlHtaq9', ias_id: 30 },
    '31': { name: 'La Napoule',fp_id: 'ElFV4x2R7Y', ias_id: 31 },
    '39': { name: 'Port-Ilon',fp_id: 'Sg4flgVeic', ias_id: 39 },
    '47': { name: 'Vieux Port',fp_id: 'NxbBL5Fr4K', ias_id: 47 },
    '48': { name: 'Santa Lucia',fp_id: 'Ng.zE6KrNt', ias_id: 48 },
    '51': { name: 'Saint-Tropez ',fp_id: 'NxGjeYPrNF', ias_id: 51 },
    '55': { name: 'Frontignan',fp_id: '4lzFJgcBVK', ias_id: 55 },
    '69': { name: 'Port  des Sablons',fp_id: 'NxcV6UaA7K', ias_id: 69 },
    '76': { name: 'Port la Vie ',fp_id: 'NlYh25kyNt', ias_id: 76 },
    '77': { name: 'Port la Forêt ',fp_id: '4xH6xtaIVt', ias_id: 77 },
    '82': { name: 'Marina de Deauville',fp_id: 'NxBCJUZP4F', ias_id: 82 },
    '91': { name: 'Port de Loctudy',fp_id: 'HxI0GnvrE5', ias_id: 91 },
    '99': { name: 'Port de Trébeurden',fp_id: 'Sg.FwnQxo5', ias_id: 99 },
    '102': { name: 'Marines de Cogolin',fp_id: 'NgrXhh0LNF', ias_id: 102 },
    '104': { name: "Port du Cap d'Ail",fp_id: 'BeqfYD1u45', ias_id: 104 },
    '105': { name: 'Rouen',fp_id: 'Sg4JETgai5', ias_id: 105 },
    '107': { name: 'Port Isle Adam', fp_id: 'rxzXyyZ6jq', ias_id: 107 },
    '108': { name: 'Port Cergy',fp_id: 'BlEflCXgi9', ias_id: 108 },
    '111': { name: 'Port Anse Aubran',fp_id: 'SlU1xbW6sc', ias_id: 111 },
    '154': { name: 'Saint Mandrier',fp_id: '4xv7h9R_yt', ias_id: 154 },
    '157': { name: 'La Seyne-sur-Mer', fp_id: 'Vgwd9iCOkK', ias_id: 157 },
    '158': { name: 'Toulon Vieille Darse', fp_id: 'VetL7I3G1F', ias_id: 158 },
    '159': { name: 'Toulon Darse Nord', fp_id: 'VgtmdRozJK', ias_id: 159 },
    '161': { name: 'Le Niel',fp_id: 'Veb_53BFSF', ias_id: 161 },
    '174': { name: 'Port les Issambres',fp_id: 'BxZUZXmxiq', ias_id: 174 },
    '178': { name: "Port d'Agay",fp_id: 'EgWks9ogWq', ias_id: 178 },
    '179': { name: 'Port de la Figueirette',fp_id: 'Bl3Zhaqrc7o', ias_id: 179 },
    '180': { name: 'Port de Théoule',fp_id: 'SxpZalOr9mi', ias_id: 180 },
    '195': { name: 'Macinaggio', fp_id: 'rxHL7ucAo9', ias_id: 195 },
    '202': { name: 'Propriano', fp_id: 'rl4ZBaUpjc', ias_id: 202 },
    '205': { name: 'Cargèse',fp_id: 'HeIrt89Ccc', ias_id: 205 },
    '208': { name: 'Port  Xavier Colonna', fp_id: 'rgLQHR8BE5', ias_id: 208 },
    '618': { name: 'St Louis du Mourillon',fp_id: 'EgPpAqCd1K', ias_id: 618 },
    
    // Below ports are not referenced in ias db
    // '0': { name: 'test port',fp_id: '', ias_id: 0 },
    // '0': { name: 'Port Boulouris', fp_id: '4lggFOoxWc', ias_id: 0 },
    // '0': { name: 'Port Gallice',fp_id: 'Bgd22Svr45', ias_id: 0 },
    // '??': { name: 'Les Ancres à Vis', fp_id: 'rx8ZUKsU4Wi', ias_id: 0 },
    // '??': { name: 'Beaulieu Plaisance', fp_id: 'rlV.xMO33Io', ias_id: 0 },
    // '??': { name: 'Marigot', fp_id: 'rgmlITNzoi', ias_id: 0 },
    // '??': { name: 'Port de Bouc', fp_id: 'rgLXUSuBN9', ias_id: 0 },
    // '??': { name: 'Port le Terondel',fp_id: 'Nevxl4kHZK', ias_id: 0 },
    // '??': { name: 'MARIBAY',fp_id: 'HxbfPuC1ic', ias_id: 0 },
    // '??': { name: 'Port de Fréjus',fp_id: 'SxNZc10mt39', ias_id: 0 },
}


exports.router = [{
    method: "POST",
    route: "/api/emplacement/places_from_ias",
    handler: updatePlaceCaptorFromIasHandler,
}];

exports.store = {
    getPlaces: getPlacesV2,
    updatePlaces: updatePlacesV2,
};

