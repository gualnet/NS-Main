var _mapCol = "map";
var _boueeCol = "bouee";
var _placeCol = "place";
var _zoneCol = "zone";

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

    return result;
}

function addProtocolToUrl(url) {
    var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol


    if (patternProtocol.test(url)) {

        return url;
    } else {

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

async function getMapById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_mapCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}


async function getMap() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_mapCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}



async function getMapByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_mapCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delMap(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_mapCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createMap(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_mapCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateMap(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_mapCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

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

async function getBouee() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boueeCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function createBouee(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_boueeCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updateBouee(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_boueeCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getBoueeByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boueeCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getBoueeByCaptorNumber(_captorNumber) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boueeCol, { captorNumber: _captorNumber }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delBouee(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_boueeCol, { id: _id }, function (_err, _data) {
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

async function getPontonsByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_zoneCol, { harbour_id: _harbour_id, type: "ponton" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getPlaceByPontonAndHarbourId(_ponton_id, _harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_placeCol, { harbour_id: _harbour_id, pontonId : _ponton_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

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

async function getMapByHarbourIdHandler(_req, _res) {

    var map = await getMapByHarbourId(_req.get.harbour_id);

    if (map[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", map[0]);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Plan introuvable", "404", "1.0");
        return false;
    }
}


async function captorPlaceHandler(_req, _res) {
   // console.log("api sensor called");
    if (_req.post) {
        let _data = _req.post;
        //console.log(_data);
        if(_data.devid || _data.devid.length > 1) {
            let place = await getPlaceByCaptorNumber(_data.devid);
            if(place[0]) {
                place = place[0];
                if (_data.payload.index1 && place.minSeuil && place.maxSeuil) {
                    if (_data.payload.index1 > place.minSeuil && _data.payload.index1 < place.maxSeuil) {
                        UTILS.httpUtil.dataError(_req, _res, "Error", "outside min seuil and max seuil");
                        return;
                    }
                }
                
                
                place.status = _data.payload.presence;
                if(place.status == 1) {
                    place.occupation = "occupied";
                    let sortie = await STORE.sortiemgmt.getSortieByPlaceIdAndEntre(place.id);
                    //console.log("sorties vides pour entre");
                   // console.log(sortie);
                    if(sortie[0]) {
                        for(var i = 0; i < sortie.length; i++){
                            if(sortie[i].entre == "empty") {
                                sortie[i].entre = Date.now();
                                
                                let sorti = new Date(sortie[i].sorti);
                                let entre = new Date(sortie[i].entre);
                                
                                let sortieMonth = sorti.getMonth() + 1;
                                let sortieDay = sorti.getDay() + 1;
                                let sortieYear = sorti.getFullYear();
                                let entreYear = entre.getFullYear();
                                let entreHour = entre.getHours();
                                
                                let saison = 0;
                               
                                if(sortieYear == entreYear && entreHour < 2 || entreHour >= 5) {
                                    
                                    if (sortieMonth >= 1 && sortieMonth <= 3 || sortieMonth == 4 && sortieDay <= 15) {
                                        saison = 1
                                    } else if (sortieMonth >= 10 && sortieMonth <= 12) {
                                        saison = 2
                                    }
                                    if (saison != 0) {
                                        
                                        let sameDayPastChallenges = await STORE.sortiemgmt.getChallengeSameDay(place.id, sortieDay, sortieMonth, sortieYear);
                                        let elapsedTimeMs = Math.abs(sortie[i].sorti - sortie[i].entre);
                                        console.log("tesssss");
                                        console.log(sameDayPastChallenges.length);
                                        if(elapsedTimeMs / 60000 >= 50 && sameDayPastChallenges.length <= 1) {
                                            
                                            sortie[i].challenge = true
                                            sortie[i].year = sortieYear;
                                            sortie[i].day = sortieDay
                                            sortie[i].month = sortieMonth;
                                            sortie[i].saison = saison;
                                        }
                                    }
                                }
                                
                                let updatedSortie = await STORE.sortiemgmt.updateSortie(sortie[i]);
                                console.log(updatedSortie);
                                break;
                            }
                        }
                    }    
                } else if(place.status == 0) {
                    place.occupation = "empty";
                    let sortie = await STORE.sortiemgmt.getSortieByPlaceIdAndEntre(place.id);
                    //console.log("sorties vides");
                   // console.log(sortie);
                    if(!sortie[0]) {
                        console.log("test");
                       let boat = await STORE.boatmgmt.getBoatByPlaceId(place.id);
                       //console.log(boat);
                       let boatId = [];
                        let userId = [];
                        if(boat[0]) {
                            for (var i = 0; i < boat.length; i++) {
                                boatId[i] = boat[i].id;
                                userId[i] = boat[i].user
                            }
                        }
                        let dateSortie = Date.now();
                        let sorti = new Date(dateSortie);
                        let sortieMonth = sorti.getMonth() + 1;
                            let sortieDay = sorti.getDay() + 1;
                            let sortieYear = sorti.getFullYear();
                            let saison = 0;
                                

                            if (sortieMonth >= 1 && sortieMonth <= 3 || sortieMonth == 4 && sortieDay <= 15) {
                                        saison = 1
                                    } else if (sortieMonth >= 10 && sortieMonth <= 12) {
                                        saison = 2
                                    }
                                    
                            let sortie = await STORE.sortiemgmt.createSortie({harbour_id : place.harbour_id, place_id : place.id, boat_ids: boatId, user_ids: userId, year: sortieYear, month : sortieMonth, day: sortieDay, saion: saison, sorti : dateSortie - 100800000, entre: "empty", challenge: false});
                            //console.log("test sortieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
                            //console.log(sortie);
                        
                    }
                } else {
                    place.occupation = "error";
                }
                //console.log(sortie);
               /* if (place.captorNumber == "002115")
                    place.nb_sorti = [];
                */
                let updatedPlace = await updatePlace(place);
                if(updatedPlace[0]) {
                    UTILS.httpUtil.dataSuccess(_req, _res, "success", updatedPlace[0]);
                    return;
                } else {
                    UTILS.httpUtil.dataError(_req, _res, "Error", "Error while updating");
                return;
                }
            } else {
                    UTILS.httpUtil.dataError(_req, _res, "Error", "Device not found : " + _data.devid);
                    return;
            }
        } else {
            UTILS.httpUtil.dataError(_req, _res, "Error", "No devid");
            return;
        }
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Aucune donnée reçue");
        return;
    }
    res.end();
    return;
}

async function captorHandler(_req, _res) {
    if (_req.post) {
        console.log(_req.post);
        let data = Object.keys(_req.post);
        data = JSON.parse(data[0])
        console.log(data);
        
        if(data[0]) {
            console.log("dev id");
            console.log(data[0].devid);
            
            if(data[0].devid) {
                
                bouee = await getBoueeByCaptorNumber(data[0].devid);
                console.log("boueeeeeeeeeeeeeeeeeeeeeeee")
                console.log(bouee)
                if(bouee[0]) {
                    
                bouee[0].status = data[0].presence_w_delai;
                console.log(bouee);
                let updatedBouee = await updateBouee(bouee[0]);
                console.log("update boueeeeeeeeeeeeeeeeeeeeeeee")
                console.log(updatedBouee);
                }
            }
        }
        //console.log(_req.post.time);
        //_req.post[0]
        UTILS.httpUtil.dataSuccess(_req, _res, "success", _req.post);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Aucune donnée reçue");
        return;
    }
}

async function getPlaceByHarbourIdHandler(_req, _res) {

    var places = await getPlaceByHarbourId(_req.get.harbour_id);
    if (places[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", places);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Places introuvables", "404", "1.0");
        return false;
    }

}

async function getPlaceByHarbourAndPontonIdHandler(_req, _res) {
    console.log(_req.get);
    var places = await getPlaceByPontonAndHarbourId(_req.get.ponton_id ,_req.get.harbour_id);
    if (places[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", places);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Places introuvables", "404", "1.0");
        return false;
    }

}

async function getEmplacementsByHarbourIdHandler(_req, _res) {
    if (_req.get.harbour_id) {
        var data = [];
        var zones = await getZoneByHarbourId(_req.get.harbour_id);
        var places = await getPlaceByHarbourId(_req.get.harbour_id);
        var bouees = await getBoueeByHarbourId(_req.get.harbour_id);
        console.log("test")
            data[0] = bouees;
            data[1] = places;

        if(data[0] || data[1]) {
            UTILS.httpUtil.dataSuccess(_req, _res, "success", data);
            return;
        } else {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Emplacements introuvables", "404", "1.0");
            return false;
        }
          
    }
    res.end();
    return;
}
async function getBoueeByHarbourIdHandler(_req, _res) {

    var bouees = await getBoueeByHarbourId(_req.get.harbour_id);
    //console.log(bouees);
    if (bouees[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", bouees);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Bouees introuvables", "404", "1.0");
        return false;
    }
}

async function getZoneByHarbourIdHandler(_req, _res) {

    var zones = await getZoneByHarbourId(_req.get.harbour_id);
    if (zones[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", zones);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Zones introuvables", "404", "1.0");
        return false;
    }

}

async function getPontonsByHarbourIdHandler(_req, _res) {

    var zones = await getPontonsByHarbourId(_req.get.harbour_id);
    if (zones[0]) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", zones);
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Zones introuvables", "404", "1.0");
        return false;
    }

}

exports.handler = async (req, res) => {
    var _map = await getMap();
    res.end(JSON.stringify(_map));
    return;
}

exports.router =
    [
        {
            route: "/api/map",
            handler: getMapByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/places",
            handler: getPlaceByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/placesbyponton",
            handler: getPlaceByHarbourAndPontonIdHandler,
            method: "GET",
        },
        {
            route: "/api/bouees",
            handler: getBoueeByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/emplacements",
            handler: getEmplacementsByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/zones",
            handler: getZoneByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/pontons",
            handler: getPontonsByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/captor",
            handler: captorHandler,
            method: "POST"
        },
        {
            route: "/api/sensor/place",
            handler: captorPlaceHandler,
            method: "POST"
        },
        {
            route: "/api/sensor/get",
            handler: getBoueeByHarbourIdHandler,
            method: "POST"
        }

    ];

exports.plugin =
{
    title: "Gestion des plans d'eau",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.harbour_id) {
                var zones = await getZoneByHarbourId(req.get.harbour_id);
                var places = await getPlaceByHarbourId(req.get.harbour_id);
                var bouees = await getBoueeByHarbourId(req.get.harbour_id);
                var svg = await getMapByHarbourId(req.get.harbour_id);




                if (svg[0]) {
                    UTILS.httpUtil.dataSuccess(req, res, "Plan récupéré", { zones: zones, places: places, bouees: bouees, svg: svg }, "1.0");
                    return;
                } else {
                    UTILS.httpUtil.dataError(req, res, "Aucun plan trouvé", "1.0");
                    return;

                }

            }
            else if (req.get.mode && req.get.mode == "delete" && req.get.map_id) {
                var currentMap = await getMapById(req.get.map_id);
                if (currentMap.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentMap.cloudinary_img_public_id);
                }
                await delMap(req.get.map_id);
            }
            else if (req.get.map_id) {
                await getMapById(req.get.map_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
                    if (typeof (await updateMap(req.post)) != "string") {
                        UTILS.httpUtil.dataSuccess(req, res, "Map mis à jour", "1.0");
                        return;
                    }
                }
            }
            else {
                var updateMode = false;
                var deleteMode = false;
                var _FD = req.post;
                _FD.date = Date.now();



                var createdZones = [];
                var updatedZones = [];
                var deletedZones = [];
                var zones = Object.entries(_FD.zones);
                var currentZones = await getZoneByHarbourId(req.post.harbour_id);
                //create or update a zone
                for (var z = 0; z < zones.length; z++) {
                    updateMode = false;
                    for (var i = 0; i < currentZones.length; i++) {
                        if (currentZones[i].id == zones[z][1].id) {
                            updateMode = true
                            break;
                        }
                    }
                    if (updateMode) {
                        updatedZones.push(await updateZone(zones[z][1]));
                    } else {
                        createdZones.push(await createZone(zones[z][1]));
                    }
                }
                //delete unfound zones in sent zones
                var currentZones = await getZoneByHarbourId(req.post.harbour_id);
                for (var i = 0; i < currentZones.length; i++) {
                    deleteMode = true;
                    for (var z = 0; z < zones.length; z++) {
                        if (currentZones[i].id == zones[z][1].id) {
                            deleteMode = false;
                            break;
                        }
                    }

                    if (deleteMode == true) {
                        deletedZones.push(await delZone(currentZones[i].id));
                    }

                }


                var createdPlaces = [];
                var updatedPlaces = [];
                var deletedPlaces = [];
                var places = Object.entries(_FD.places);


                var currentPlaces = await getPlaceByHarbourId(req.post.harbour_id);
                for (var z = 0; z < places.length; z++) {
                    updateMode = false;
                    for (var i = 0; i < currentPlaces.length; i++) {
                        if (currentPlaces[i].id == places[z][1].id) {
                            updateMode = true
                            break;
                        }
                    }
                    if (updateMode == true) {
                        updatedPlaces.push(await updatePlace(places[z][1]));
                    } else {
                        createdPlaces.push(await createPlace(places[z][1]));
                    }
                }
                //delete unfound places in sent places
                var currentPlaces = await getPlaceByHarbourId(req.post.harbour_id);
                for (var i = 0; i < currentPlaces.length; i++) {
                    deleteMode = true;
                    for (var z = 0; z < places.length; z++) {
                        if (currentPlaces[i].id == places[z][1].id) {
                            deleteMode = false;
                            break;
                        }
                    }

                    if (deleteMode == true) {
                        deletedPlaces.push(await delPlace(currentPlaces[i].id));
                    }

                }



                var createdBouees = [];
                var updatedBouees = [];
                var deletedBouees = [];
                var bouees = Object.entries(_FD.bouees);
                var currentBouees = await getBoueeByHarbourId(req.post.harbour_id);

                for (var z = 0; z < bouees.length; z++) {
                    updateMode = false;
                    for (var i = 0; i < currentBouees.length; i++) {
                        if (currentBouees[i].id == bouees[z][1].id) {
                            updateMode = true
                            break;
                        }
                    }
                    if (updateMode) {
                        updatedBouees.push(await updateBouee(bouees[z][1]));
                    } else {
                        createdBouees.push(await createBouee(bouees[z][1]));
                    }
                }
                //delete unfound bouees in sent bouees
                var currentBouees = await getBoueeByHarbourId(req.post.harbour_id);
                for (var i = 0; i < currentBouees.length; i++) {
                    deleteMode = true;
                    for (var z = 0; z < bouees.length; z++) {
                        if (currentBouees[i].id == bouees[z][1].id) {
                            deleteMode = false;
                            break;
                        }
                    }

                    if (deleteMode == true) {
                        deletedBouees.push(await delBouee(currentBouees[i].id));
                    }

                }


                var currentMap = await getMapByHarbourId(req.post.harbour_id);
                if (!currentMap[0]) {
                    var map = await createMap({ harbour_id: _FD.harbour_id, map: _FD.svg, date: _FD.date });


                    if (map.id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Plan créer", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de l'enregistrement du plan", "1.0");
                        return;
                    }
                }
                else {
                    if (!zones[0] && !places[0] && !places[0]) {
                        var delmap = await delMap(currentMap[0].id);
                        console.log("map suppriemr? " + delmap)
                        UTILS.httpUtil.dataError(req, res, "Error", "Aucun élément dans le plan, supression effectué du plan d'eau.", "1.0");
                        return;

                    } else {
                        var map = await updateMap({ id: currentMap[0].id, harbour_id: _FD.harbour_id, map: _FD.svg, date: _FD.date });
                        if (map[0]) {
                            UTILS.httpUtil.dataSuccess(req, res, "Success", "Plan mis à jour", "1.0");
                            return;
                        } else {
                            UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de l'enregistrement du plan", "1.0");
                            return;
                        }
                    }
                }
            }
        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _mapHtml = fs.readFileSync(path.join(__dirname, "map.html")).toString();
            var _maps;

            function reformatDate(_date) {
                var split = _date.split(" ");
                var reformat = split[0].split("-")
                reformat = reformat[2] + reformat[1] + reformat[0] + split[1];

                return reformat;
            }

            if (_type == 'harbour_manager')
                _maps = await getMapByHarbourId(_harbour_id);
            else
                _maps = await getMap();

            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _maps = _maps.concat(await getMapByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _maps = await getMap();

            var _mapGen = "";
            for (var i = 0; i < _maps.length; i++) {
                var date = new Date(_maps[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_maps[i].harbour_id);

                _mapGen += _mapHtml.replace(/__ID__/g, _maps[i].id)
                    .replace(/__FORMID__/g, _maps[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, _maps[i].category)
                    .replace(/__BULLETIN__/g, _maps[i].img)
                    .replace(/__TITLE__/g, _maps[i].title)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _maps[i].date)
            }
            _indexHtml = _indexHtml.replace("__MAP__", _mapGen).replace(/undefined/g, '');


            var userHarbours = [];
            var harbour_select;
            if (_role == "user") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" id="harbour_id" name="harbour_id">';
                for (var i = 0; i < _harbour_id.length; i++) {
                    userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" id="harbour_id" name="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();


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
exports.store =
{
    getPlaceByHarbourId: getPlaceByHarbourId,
    getPlaceById: getPlaceById,
    getZoneById: getZoneById
}
