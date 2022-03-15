var _sortieCol = "sorties";
var _userCol = "user";



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
    if (!_req.post.description || _req.post.description.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Description requise", "100", "1.0");
        return false;
    }
    if (_req.post.description.length > 255) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "La description ne doit pas dépasser 255 caractères", "100", "1.0");
        return false;
    }
    if (!_req.post.harbour_id || _req.post.harbour_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Id du port requis", "100", "1.0");
        return false;
    }
    if (!_req.post.date_start) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Date de début requise", "100", "1.0");
        return false;
    }
    if (!_req.post.date_end) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Date de fin requis", "100", "1.0");
        return false;
    }
    /*
    if (!_req.post.category == "sorties" || !_req.post.category == "sortie") {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
        return false;
    }
    if (_req.post.pj && !_req.post.pjname || _req.post.pjname.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de la pièce jointe requise", "100", "1.0");
        return false;
    }*/
    return true;
}

_sortieCol = "sortie";
async function getSortie() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function createSortie(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_sortieCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updateSortie(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_sortieCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieByPlaceId(_place_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { place_id: _place_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieByPlaceIdAndEntre(_place_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { place_id: _place_id, entre: "empty" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_sortieCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delSortie(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_sortieCol, { id: _id }, function (_err, _data) {
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

async function getChallenge() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { challenge: true }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getChallengeSameDay(_place_id, _day, _month, _year) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { place_id: _place_id, day: _day, month: _month, year:_year, challenge: true }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieQuery(_query) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, _query, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
exports.handler = async (req, res) => {
    var _sortie = await getSortie();
    res.end(JSON.stringify(_sortie));
    return;
}

async function getSortieHandler(req, res) {
    var _data = await getSortieById(req.get.id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}

async function getSortiesByHarbourIdHandler(req, res) {
    var _data = await getSortiesByHarbourId(req.param.harbour_id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}
async function getChallengeHandler(req, res) {
    var _data = await getChallenge();
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;

}
async function getSortieUserHandler(req, res) {
    if(req.post.token) {
        let user = await STORE.usermgmt.getUserByToken(req.post.token);
        let date = new Date(Date.now());
        
        console.log(user);
        if(user[0]) {
            user = user[0];
            let userSorties = [];
            
            const _sorties = await getSortieQuery({year: date.getFullYear()});
            console.log(_sorties);
            for(var i = 0; i < _sorties.length; i++) {
                if(_sorties[i].user_ids[0]) {
                    for (var u = 0; u < _sorties[i].user_ids.length; u++) {
                        if(_sorties[i].user_ids[u] == user.id) {
                            _sorties[i].place = await STORE.mapmgmt.getPlaceById(_sorties[i].place_id);
                            for(var b = 0; b < _sorties[i].boat_ids.length; b++){
                                let boat = await STORE.boatmgmt.getBoatById(_sorties[i].boat_ids[b]);
                                console.log(boat)
                               if(boat.user == user.id) {
                                    _sorties[i].boat = boat;
                                    break;
                               }
                            }
                            userSorties.push(_sorties[i]);
                            break;
                        }
                    }
                }
                //await delSortie(_sorties[i].id);
            }
            if(userSorties[0]) {
                UTILS.httpUtil.dataSuccess(req, res, "success", userSorties, "1.0");
                return;
            } else {
                UTILS.httpUtil.dataError(req, res, "No sorties found", "404", "1.0");
                return;
            }
        } else {
            UTILS.httpUtil.dataError(req, res, "invalid token", "403", "1.0");
            return;
        }
    }else {
        UTILS.httpUtil.dataError(req, res, "No token", "403", "1.0");
        return;
    }
    res.end();
    return;
}
async function navilyHandler(req, res) {
    var promise = await UTILS.httpsUtil.httpReqPromise({
        "host": "www.navily.com",
        "path": "/fr/resaweb?port_id=" + req.get.port_id + "&customer_id=2063604034",
        "method": "GET"
    });
    var _data = await getChallenge();
    res.end(promise.data);
    return;

}

exports.router =
    [
        {
            route: "/api/sortie/",
            handler: getSortieHandler,
            method: "GET",
        },
        {
            route: "/api/sorties/:harbour_id",
            handler: getSortiesByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/challenges",
            handler: getChallengeHandler,
            method: "GET",
        },
        {
            route: "/api/sortie/user",
            handler: getSortieUserHandler,
            method: "POST",
        },
        {
            route: "/api/navily",
            handler: navilyHandler,
            method: "GET"
        },
    ];
    
function dateDiffToString(a, b){

    // make checks to make sure a and b are not null
    // and that they are date | integers types

    diff = Math.abs(a - b);

    ms = diff % 1000;
    diff = (diff - ms) / 1000
    ss = diff % 60;
    diff = (diff - ss) / 60
    mm = diff % 60;
    diff = (diff - mm) / 60
    hh = diff % 24;
    days = (diff - hh) / 24

    return days + " jours et " + hh+":"+mm+":"+ss;

}

exports.plugin =
{
    title: "Gestion des sorties",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.sortie_id) {
                var currentSortie = await getSortieById(req.post.id);
                await delSortie(req.get.sortie_id);
            }
            else if (req.get.sortie_id) {
                await getSortieById(req.get.sortie_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
                    var currentSortie = await getSortieById(req.post.id);
                    var _FD = req.post;



                    var sortie = await updateSortie(_FD);
                    //console.log(sortie);
                    if (sortie[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "événement mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
                        return;
                    }
                }
            }
            res.end();
            return;

        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _sortieHtml = fs.readFileSync(path.join(__dirname, "sortie.html")).toString();

            var _Sorties = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _Sorties = _Sorties.concat(await getSortieByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _Sorties = await getSortie();


            var _sortieGen = "";
            for (var i = 0; i < _Sorties.length; i++) {
                var place = await STORE.mapmgmt.getPlaceById(_Sorties[i].place_id);
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Sorties[i].harbour_id);
                var boat = await STORE.boatmgmt.getBoatByPlaceId(_Sorties[i].place_id);
                var currentUser;
                if(boat[0]) {
                    var currentUser = await STORE.usermgmt.getUserById(boat[0].user);
                    
                    if(currentUser)
                        currentUser = currentUser.id + "\\" + currentUser.first_name + " " + currentUser.last_name;
                    else
                        currentUser = "aucun";
                        
                    boat = boat[0].id + "\\" + boat[0].name;
                } else {
                    currentUser = "aucun";
                    boat = "aucun bateau attaché à cette place";
                }
                    console.log(_Sorties[i].sorti + " " + _Sorties[i].entre);
                var dateSortie = new Date(_Sorties[i].sorti);
                console.log(dateSortie);
                var dateSortieFormated = [("0" + (dateSortie.getDate())).slice(-2), ("0" + (dateSortie.getMonth() + 1)).slice(-2), dateSortie.getFullYear()].join('-') + ' ' + [("0" + (dateSortie.getHours())).slice(-2), ("0" + (dateSortie.getMinutes())).slice(-2), ("0" + (dateSortie.getSeconds())).slice(-2)].join(':');

                
                var dateEntre;
                var dateEntreFormated;
                let duree;
                if(_Sorties[i].entre != "empty" && _Sorties[i].entre != null) {
                    dateEntre = new Date(_Sorties[i].entre);
                    dateEntreFormated = [("0" + (dateEntre.getDate())).slice(-2), ("0" + (dateEntre.getMonth() + 1)).slice(-2), dateEntre.getFullYear()].join('-') + ' ' + [("0" + (dateEntre.getHours())).slice(-2), ("0" + (dateEntre.getMinutes())).slice(-2), ("0" + (dateEntre.getSeconds())).slice(-2)].join(':');
                    duree = dateDiffToString(dateSortie, dateEntre)
                } else {
                    dateEntreFormated = "aucun"
                    duree = dateDiffToString(dateSortie, new Date(Date.now()));
                }

                let challenge = "";
                if (_Sorties[i].challenge) {
                    challenge = "oui";
                } else {
                    challenge = "non";
                }


                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Sorties[i].harbour_id);

                _sortieGen += _sortieHtml.replace(/__ID__/g, _Sorties[i].id)
                    .replace(/__FORMID__/g, _Sorties[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__NUMERO_PLACE__/g, place.number)
                    .replace(/__USER__/g, currentUser)
                    .replace(/__BOAT__/g, boat)
                    .replace(/__SORTIE__/g, dateSortieFormated)
                    .replace(/__ENTRE__/g, dateEntreFormated)
                    .replace(/__DUREE__/g, duree)
                    .replace(/__CHALLENGE__/g, challenge)
                    .replace(/__DATETIMEORDER__/g, _Sorties[i].sortie)
            }
            _indexHtml = _indexHtml.replace("__EVENTS__", _sortieGen).replace(/undefined/g, '');

            var userHarbours = [];
            var harbour_select;
            if (_role == "user") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';
                for (var i = 0; i < _harbour_id.length; i++) {
                    userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Séléction du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();
                //console.log("ici");
                //console.log(userHarbours);
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
    getSortieByPlaceId: getSortieByPlaceId,
    createSortie: createSortie,
    updateSortie: updateSortie,
    getSortieByPlaceIdAndEntre: getSortieByPlaceIdAndEntre,
    getChallengeSameDay: getChallengeSameDay
}