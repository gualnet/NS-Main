var _securiteCol = "securite";
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
    console.log(_req.post)
    if (!_req.post.user_id || _req.post.user_id.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Utilisateur requis", "100", "1.0");
        return false;
    }
    return true;
}

async function getSecuriteById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_securiteCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getSecurite() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_securiteCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSecuritesByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_securiteCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSecuriteByUserIdAndHarbourId(_user_id, _harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_securiteCol, { user_id: _user_id, harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delSecurite(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_securiteCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createSecurite(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_securiteCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateSecurite(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_securiteCol, { id: _obj.id }, _obj, function (_err, _data) {
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

exports.handler = async (req, res) => {
    var _securite = await getSecurite();
    res.end(JSON.stringify(_securite));
    return;
}

async function getSecuriteHandler(req, res) {
    console.log(req.get.user_id);
    var _data = await getSecuriteByUserIdAndHarbourId(req.get.user_id, req.get.harbour_id);
    console.log(_data);
    if (_data[0]) {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", "Aucune securite trouvé", "100", "1.0");
        return;
    }
}

async function createSecuriteHandler(req, res) {
    verifyPostReq(req);
    req.post;
    req.post.date_start = Date.now();
    req.post.date = Date.now();
    req.post.status = "open";
    var securite = await createSecurite(req.post);
    if (securite.id) {
        var date = new Date(securite.date_start);
        var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

        var harbour = await STORE.harbourmgmt.getHarbourById(securite.harbour_id);
        var user = await STORE.usermgmt.getUserById(securite.user_id);
        var zone = await STORE.mapmgmt.getZoneById(securite.zone);
        var subject = "Incident N° " + securite.id + " " + user.first_name + " " + user.last_name + " déclaré le " + dateFormated;
                var body = "Incident N° " + securite.id
            + "<br/>Déclaré le : " + dateFormated
            + "<br/>Utilisateur : " + user.first_name + " " + user.last_name
            + "<br/>Zone : " + zone.name
            + "<br/>Déscription : <br/><br/>" + securite.description;
        await STORE.mailjet.sendHTML(harbour.id_entity, harbour.email, harbour.name, subject, body);
        UTILS.httpUtil.dataSuccess(req, res, "success", securite, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", "error", "100", "1.0");
        return;
    }
}

exports.router =
    [
        {
            route: "/api/get/securite",
            handler: getSecuriteHandler,
            method: "GET",
        },
        {
            route: "/api/create/securite",
            handler: createSecuriteHandler,
            method: "POST",
        },
    ];

exports.plugin =
{
    title: "Gestion Sécurité/Maintenance",
    desc: "",
    handler: async (req, res) => {

        var admin = await getAdminById(req.userCookie.data.id);
        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.securite_id) {
                console.log("eeeeeeeeeeeeeeeeeeeeeeeee");
                await delSecurite(req.get.securite_id);
            }
            else if (req.get.securite_id) {
                await getSecuriteById(req.get.securite_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                var currentSecurite = await getSecuriteById(req.post.id);
                var _FD = req.post;

                _FD.date_start = Date.parse(_FD.date_start);
                _FD.date_end = Date.parse(_FD.date_end);
                var securite = await updateSecurite(_FD);
                console.log(securite);
                if (securite[0].id) {
                    UTILS.httpUtil.dataSuccess(req, res, "Success", "Securite mis à jour", "1.0");
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

                        _FD.category = 'securite';
                        _FD.date_start = Date.parse(_FD.date_start);
                        _FD.date_end = Date.parse(_FD.date_end);
                        var securite = await createSecurite(_FD);
                        console.log(securite);
                        if (securite.id) {
                            UTILS.httpUtil.dataSuccess(req, res, "Success", "Securite créé", "1.0");
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
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _securiteHtml = fs.readFileSync(path.join(__dirname, "securite.html")).toString();

            var _Securites = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _Securites = _Securites.concat(await getSecuritesByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _Securites = await getSecurite();


            var _securiteGen = "";
            var statusoptions = "";
            for (var i = 0; i < _Securites.length; i++) {
                if (_Securites[i].category == "securite") {
                    _Securites[i].category = "événement";
                }

                var date = new Date(_Securites[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

                date = new Date(_Securites[i].date_start);
                var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                date = new Date(_Securites[i].date_end);
                var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Securites[i].harbour_id);
                var currentUser = await STORE.usermgmt.getUserById(_Securites[i].user_id);
                var currentZone = await STORE.mapmgmt.getZoneById(_Securites[i].zone);

                if (_Securites[i].status == "open") {
                    statusoptions = '<option value="open" selected>ouvert</option><option value="closed">clôturé</option>'
                }
                else {

                    statusoptions = '<option value="open">ouvert</option><option value="closed" selected>clôturé</option selected>'
                }
                _securiteGen += _securiteHtml.replace(/__ID__/g, _Securites[i].id)
                    .replace(/__FORMID__/g, _Securites[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__ZONE__/g, currentZone.name)
                    .replace(/__USER_NAME__/g, currentUser.id + "\\" + currentUser.first_name + " " + currentUser.last_name)
                    .replace(/__DESCRIPTION__/g, _Securites[i].description)
                    .replace(/__RESOLUTION__/g, _Securites[i].resolution)
                    .replace(/__DATE_START__/g, startDateFormated)
                    .replace(/__DATE_END__/g, endDateFormated)
                    .replace(/__STATUS__/g, statusoptions)
                    .replace(/__DATETIMEORDER__/g, _Securites[i].date)
            }
            _indexHtml = _indexHtml.replace("__SECURITES__", _securiteGen).replace(/undefined/g, '');

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
                console.log("ici");
                console.log(userHarbours);
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