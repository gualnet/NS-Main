//gestions des absences


//set datatable cols
var _absenceCol = "absences";
var _userCol = "user";


//verify if url start with https
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

//verify some data in post
function verifyPostReq(_req, _res) {
    if (!_req.post.boat_id || _req.post.boat_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Bateau requis", "100", "1.0");
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
    return true;
}

//db functions <
async function getAbsenceById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_absenceCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getAbsence() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_absenceCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getAbsencesByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_absenceCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getAbsenceByUserIdAndHarbourId(_user_id, _harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_absenceCol, { user_id: _user_id, harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delAbsence(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_absenceCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createAbsence(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_absenceCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateAbsence(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_absenceCol, { id: _obj.id }, _obj, function (_err, _data) {
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

//>

exports.handler = async (req, res) => {
    var _absence = await getAbsence();
    res.end(JSON.stringify(_absence));
    return;
}

//handler that return absence by user id and harbour id
async function getAbsenceHandler(req, res) {
    var _data = await getAbsenceByUserIdAndHarbourId(req.get.user_id, req.get.harbour_id);
    if (_data[0].id) {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", "Aucune absence trouvé", "100", "1.0");
        return;
    }
}

//handle absence declaration
async function createAbsenceHandler(req, res) {
    
    verifyPostReq(req);
    req.post.date = Date.now();
    
    var harbour = await STORE.harbourmgmt.getHarbourById(req.post.harbour_id);

    
    if (harbour) {
        var absence = await createAbsence(req.post);
        if (absence.id) {
            
            //get data from db
            var user = await STORE.usermgmt.getUserById(absence.user_id);
            var boat = await STORE.boatmgmt.getBoatById(absence.boat_id);
            var place = await STORE.mapmgmt.getPlaceById(boat.place_id);
            
            //prepare mail
            var subject =  "Absence N° " + absence.id + " " + user.first_name + " " + user.last_name + " déclaration d'absence du " + absence.date_start + " au " + absence.date_end;
            var body = "Absence N° " + absence.id 
                + "<br/>plaisancier : " + user.first_name + " " + user.last_name
                + "<br/>bateau : " + boat.name + ", immatriculé : " + boat.immatriculation
                + "<br/>numéro de place : " + place.number
                + "<br/>Absence du " + absence.date_start + " au " + absence.date_end;
                
            //send mail
            await STORE.mailjet.sendHTML(harbour.id_entity, harbour.email, harbour.name, subject, body);
            
            
            UTILS.httpUtil.dataSuccess(req, res, "success", absence, "1.0");
            return;
        }
        else {
            UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
            return;
        }
    } else {
        UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
        return;
    }
}

exports.router =
    [
        {
            route: "/api/get/absence",
            handler: getAbsenceHandler,
            method: "GET",
        },
        {
            route: "/api/create/absence",
            handler: createAbsenceHandler,
            method: "POST",
        },
    ];

exports.plugin =
{
    title: "Gestion des absences",
    desc: "",
    handler: async (req, res) => {
        //get users from FORTPRESS db <
        var admin = await getAdminById(req.userCookie.data.id);
        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;
        // >
        
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.absence_id) {
                console.log("eeeeeeeeeeeeeeeeeeeeeeeee");
                await delAbsence(req.get.absence_id);
            }
            else if (req.get.absence_id) {
                await getAbsenceById(req.get.absence_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (!req.post.date_start) {
                    UTILS.httpUtil.dataError(req, res, "Error", "Date de début requise", "100", "1.0");
                    return;
                }
                if (!req.post.date_end) {
                    UTILS.httpUtil.dataError(req, res, "Error", "Date de fin requis", "100", "1.0");
                    return;
                }
                var currentAbsence = await getAbsenceById(req.post.id);
                var _FD = req.post;


                var absence = await updateAbsence(_FD);
                console.log(absence);
                if (absence[0].id) {
                    UTILS.httpUtil.dataSuccess(req, res, "Success", "Absence mis à jour", "1.0");
                    return;
                } else {
                    UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
                    return;
                }
            }
            else {
                if (typeof req.body == "object" && req.multipart) {
                    if (verifyPostReq(req, res)) {
                        var _FD = req.post;

                        _FD.category = 'absence';
                        _FD.date_start = Date.parse(_FD.date_start);
                        _FD.date_end = Date.parse(_FD.date_end);
                        var absence = await createAbsence(_FD);
                        console.log(absence);
                        if (absence.id) {
                            UTILS.httpUtil.dataSuccess(req, res, "Success", "Absence créé", "1.0");
                            return;
                        } else {
                            UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'événement", "1.0");
                            return;
                        }
                    }
                }

            }
        }
        else {
            //get html files
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _absenceHtml = fs.readFileSync(path.join(__dirname, "absence.html")).toString();
            
            //get absences from user role
            var _Absences = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _Absences = _Absences.concat(await getAbsencesByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _Absences = await getAbsence();

            //modify html dynamically <
            var _absenceGen = "";
            for (var i = 0; i < _Absences.length; i++) {
                if (_Absences[i].category == "absence") {
                    _Absences[i].category = "événement";
                }

                var date = new Date(_Absences[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

                date = new Date(_Absences[i].date_start);
                var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                date = new Date(_Absences[i].date_end);
                var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Absences[i].harbour_id);
                var currentUser = await STORE.usermgmt.getUserById(_Absences[i].user_id);
                var currentBoat = await STORE.boatmgmt.getBoatById(_Absences[i].boat_id);
                var currentPlace = await STORE.mapmgmt.getPlaceById(currentBoat.place_id);

                _absenceGen += _absenceHtml.replace(/__ID__/g, _Absences[i].id)
                    .replace(/__FORMID__/g, _Absences[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__USER_NAME__/g, currentUser.id + "\\" + currentUser.first_name + " " + currentUser.last_name)
                    .replace(/__BOAT_NAME__/g, currentBoat.id + "\\" + currentBoat.name)
                    .replace(/__PLACE_NUMBER__/g, currentPlace.number)
                    .replace(/__DATE_START__/g, startDateFormated)
                    .replace(/__DATE_END__/g, endDateFormated)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _Absences[i].date)
            }
            _indexHtml = _indexHtml.replace("__ABSENCES__", _absenceGen).replace(/undefined/g, '');
            // >
            
            //set harbour lists from user role <
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

                for (var i = 0; i < userHarbours.length; i++) {
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            }
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);
            // >

            //send plugin html page
            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}