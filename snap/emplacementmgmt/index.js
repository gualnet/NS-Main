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
    if (!_req.post.harbourid || _req.post.harbourid.length < 1) {
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
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.zone_id) {
                await delZone(req.get.zone_id);
            } else if (req.get.mode && req.get.mode == "delete" && req.get.place_id) {
                await delPlace(req.get.place_id);
            }
        }
        if (req.method == "POST") {
            console.log(req.post);
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
                console.log(zonesArray);
                var zonesJson = {};
                let createdZones = [];
                for (var i = 1; i < zonesArray.length - 1; i++) {
                    let zoneInfo = zonesArray[i].split(';');
                    let doublonZone = await getPontonZoneByHarbourIdAndName(req.post.harbour_id, zoneInfo[0]);
                    if (!doublonZone[0]) {
                        let id = makeid(10) + '_' + Date.now();
                        let zone = { id: id, harbour_id: req.post.harbour_id, name: zoneInfo[0], type: "ponton" }
                        //consolezonesArray
                        createdZones.push(await createZone(zone));
                    }
                }
                UTILS.httpUtil.dataSuccess(req, res, "success", "zones added", createdZones, '1.0');
                return;
            } else if (req.post.type == 'csvplace') {

                var placesArray = req.post.csvplaces.replace(/\n/g, '').split('\r');
                console.log(placesArray);
                var placesJson = {};
                let createdPlaces = [];
                for (var i = 1; i < placesArray.length - 1; i++) {
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
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id" id="harbour_id">';
                for (var i = 0; i < _harbour_id.length; i++) {
                    userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id" id="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();
                console.log("ici");
                console.log(userHarbours);
                for (var i = 0; i < userHarbours.length; i++) {
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            }
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_PLACE_INPUT__', harbour_select.replace('id="harbour_id"', 'id="harbourid_place"'));
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_PONTON_INPUT__', harbour_select.replace('id="harbour_id"', 'id="harbourid_ponton"'));



            _places = await getPlaceByHarbourId(userHarbours[0].id);
            _zones = await getPontonZoneByHarbourId(userHarbours[0].id);
            console.log(_places);

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
