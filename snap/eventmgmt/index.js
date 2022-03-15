var _eventCol = "events";
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
    if (!_req.post.category == "events" || !_req.post.category == "event") {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
        return false;
    }
    if (_req.post.pj && !_req.post.pjname || _req.post.pjname.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de la pièce jointe requise", "100", "1.0");
        return false;
    }*/
    return true;
}

async function getEventById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_eventCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getEvent() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_eventCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getEventsByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_eventCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delEvent(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_eventCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createEvent(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_eventCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateEvent(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_eventCol, { id: _obj.id }, _obj, function (_err, _data) {
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
    var _event = await getEvent();
    res.end(JSON.stringify(_event));
    return;
}

async function getEventHandler(req, res) {
    var _data = await getEventById(req.get.id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}

async function getEventsByHarbourIdHandler(req, res) {
    var _data = await getEventsByHarbourId(req.param.harbour_id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}

exports.router =
    [
        {
            route: "/api/event/",
            handler: getEventHandler,
            method: "GET",
        },
        {
            route: "/api/events/:harbour_id",
            handler: getEventsByHarbourIdHandler,
            method: "GET",
        },
    ];

exports.plugin =
{
    title: "Gestion des événements",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.event_id) {
                var currentEvent = await getEventById(req.post.id);
                if (currentEvent.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentEvent.cloudinary_img_public_id);
                }
                if (currentEvent.cloudinary_pj_public_id) {
                    await STORE.cloudinary.deleteFile(currentEvent.cloudinary_pj_public_id);
                }
                await delEvent(req.get.event_id);
            }
            else if (req.get.event_id) {
                await getEventById(req.get.event_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
                    var currentEvent = await getEventById(req.post.id);
                    var _FD = req.post;
                    _FD.date = Date.now();

                    _FD.date_start = Date.parse(_FD.date_start);
                    _FD.date_end = Date.parse(_FD.date_end);

                    //img gesture
                    if (_FD.img) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                        console.log(upload);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                        if (currentEvent.cloudinary_img_public_id) {
                            await STORE.cloudinary.deleteFile(currentEvent.cloudinary_img_public_id);
                        }

                    }

                    //pj gesture
                    if (_FD.pj) {
                        console.log(_FD.pj);
                        var upload = await STORE.cloudinary.uploadFile(_FD.pj, req.field["pj"].filename, "slug");;
                        console.log(upload);
                        _FD.pj = upload.secure_url;
                        _FD.cloudinary_pj_public_id = upload.public_id;
                        if (currentEvent.cloudinary_pj_public_id) {
                            await STORE.cloudinary.deleteFile(currentEvent.cloudinary_pj_public_id);
                        }
                    }

                    var event = await updateEvent(_FD);
                    console.log(event);
                    if (event[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "événement mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
                        return;
                    }
                }
            }
            else {
                if (typeof req.body == "object" && req.multipart) {
                    if (verifyPostReq(req, res)) {
                        var _FD = req.post;

                        _FD.date = Date.now();
                        _FD.category = 'event';
                        _FD.date_start = Date.parse(_FD.date_start);
                        _FD.date_end = Date.parse(_FD.date_end);

                        //img gesture
                        if (_FD.img) {
                            var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                            console.log(upload);
                            _FD.img = upload.secure_url;
                            _FD.cloudinary_img_public_id = upload.public_id;
                        }

                        //pj gesture
                        if (_FD.pj) {
                            var upload = await STORE.cloudinary.uploadFile(_FD.pj, req.field["pj"].filename, "slug");
                            console.log(upload);
                            _FD.pj = upload.secure_url;
                            _FD.cloudinary_pj_public_id = upload.public_id;
                        }

                        var event = await createEvent(_FD);
                        console.log(event);
                        if (event.id) {
                            UTILS.httpUtil.dataSuccess(req, res, "Success", "Event créé", "1.0");
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
            var _eventHtml = fs.readFileSync(path.join(__dirname, "event.html")).toString();

            var _Events = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _Events = _Events.concat(await getEventsByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _Events = await getEvent();


            var _eventGen = "";
            for (var i = 0; i < _Events.length; i++) {
                if (_Events[i].category == "event") {
                    _Events[i].category = "événement";
                }

                var date = new Date(_Events[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

                date = new Date(_Events[i].date_start);
                var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                date = new Date(_Events[i].date_end);
                var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Events[i].harbour_id);

                _eventGen += _eventHtml.replace(/__ID__/g, _Events[i].id)
                    .replace(/__FORMID__/g, _Events[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, _Events[i].category)
                    .replace(/__EDITOR_DESC_ID__/g, "editor_desc_" + _Events[i].id.replace(/\./g, "_"))
                    .replace(/__DESCRIPTION__/g, _Events[i].description)
                    .replace(/__EDITOR_ID__/g, "editor_" + _Events[i].id.replace(/\./g, "_"))
                    .replace(/__CONTENT__/g, _Events[i].content)
                    .replace(/__TITLE__/g, _Events[i].title)
                    .replace(/__DATE_START__/g, startDateFormated)
                    .replace(/__DATE_END__/g, endDateFormated)
                    .replace(/__PJNAME__/g, _Events[i].pjname)
                    .replace(/__PJ__/g, _Events[i].pj)
                    .replace(/__IMG__/g, _Events[i].img)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _Events[i].date)
            }
            _indexHtml = _indexHtml.replace("__EVENTS__", _eventGen).replace(/undefined/g, '');

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