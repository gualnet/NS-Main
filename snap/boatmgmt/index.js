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
    if (!_req.post.harbourid || _req.post.harbourid.length < 1) {
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

//db functions <
async function getBoatById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_boatCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getBoatByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boatCol, { harbour: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getBoatByUserIdAndHarbourId(_user_id, _harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boatCol, { user: _user_id, harbour: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getBoatByPlaceId(_place_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boatCol, { place_id: _place_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getBoat() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_boatCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
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
    _req.post.date = Date.now();
    delete _req.post.ponton_id;
    var boat = await createBoat(_req.post);
    boat.enabled = false;
    UTILS.httpUtil.dataSuccess(_req, _res, "Bateau enregistré", "1.0")
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
    console.log(_req.post);
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
        console.log(boat);
        UTILS.httpUtil.dataSuccess(_req, _res, "Bateau mis à jour", "1.0")
        return;

    } else {
        delete _req.post.token;
        _req.post.user = user[0].id;
        _req.post.date = Date.now();

        var boat = await createBoat(_req.post);
        console.log("bateau créer");
        console.log(boat);
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
    if (_req.get.user_id && _req.get.harbour_id) {
        var boats = await getBoatByUserIdAndHarbourId(_req.get.user_id, _req.get.harbour_id);
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
        
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;
        
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.boat_id) {
                await delBoat(req.get.boat_id);
            }
            else if (req.get.boat_id) {
                await getBoatById(req.get.boat_id);
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
            
            var _boats = [];

            //get boats from user role
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _boats = _boats.concat(await getBoatByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _boats = await getBoat();

            //modify html dynamically <
            var _boatGen = "";
            for (var i = 0; i < _boats.length; i++) {
                
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_boats[i].harbour);
                var places = await STORE.mapmgmt.getPlaceByHarbourId(_boats[i].harbour);
                
                // set places lists
                var places_select = "";
                for (var p = 0; p < places.length; p++) {
                    if (places[p] || _boats[i]) {
                        if (places[p].id == _boats[i].place_id) {
                            places_select += '<option value="' + places[p].id + '" selected>' + places[p].number + '</option>'
                        } else {
                            places_select += '<option value="' + places[p].id + '">' + places[p].number + '</option>'
                        }
                    }
                }

                var currentUser = await STORE.usermgmt.getUserById(_boats[i].user);

                _boatGen += _boatHtml.replace(/__ID__/g, _boats[i].id)
                    .replace(/__FORMID__/g, _boats[i].id.replace(/\./g, "_"))
                    .replace(/__NAME__/g, _boats[i].name)
                    .replace(/__PLACE__/g, places_select)
                    .replace(/__USER__/g, _boats[i].user + "\\" + currentUser.first_name + " " + currentUser.last_name)
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__IMMATRICULATION__/g, _boats[i].immatriculation)
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
    getBoatById: getBoatById,
    getBoatByUserIdAndHarbourId: getBoatByUserIdAndHarbourId,
    getBoatByPlaceId: getBoatByPlaceId,
    updateBoat: updateBoat
}