//gestions des communications


//set datatable cols
var _comCol = "coms";
var _userCol = "user";
var _harbourCol = "harbour";
var _entityCol = "entity";


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
    if (!_req.post.title || _req.post.title.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Titre requis", "100", "1.0");
        return false;
    }
    if (!_req.post.message || _req.post.message.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Message requis", "100", "1.0");
        return false;
    }
    return true;
}

//db functions <
async function getComById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_comCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getEntityById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_entityCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getCom() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_comCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getComsByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_comCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delCom(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_comCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createCom(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_comCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createUser(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_userCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUser(_query) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, _query, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByCategory(_category) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { category: _category }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByCategoryAndHarbourId(_category, _harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { category: _category, harbourid: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateCom(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_comCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateUser(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_userCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByOnesignalId(_onesignal_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { onesignal_userid: _onesignal_id, category: "visitor" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_userCol, _id, null, function (_err, _data) {
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

async function getHarbourById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_harbourCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
// >


//handler that get a communication
async function getComHandler(req, res) {
    if(req.get.comid && req.get.userid) {
        var _data = await getComById(req.get.comid);
        if(_data.read_id) {
            var ids = _data.read_id.filter(id => id == req.get.userid)
            if(!ids[0]){
                _data.read_id.push(req.get.userid);
                _data = await updateCom(_data);
            }
        }

        if (_data.id) {
            UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
            return;
        }
        else {
            UTILS.httpUtil.dataError(req, res, "Error", "", "100", "1.0");
            return;
        }
    }
}

//handler to verify if user as unread communcation
async function isUnreadComsHandler(_req, _res) {
    var _com = await getCom();
           
    var user = await getUser({id: _req.get.id});
    var haveUnreadNotifications = false;

    if(user[0]) {
        user = user[0];
        console.log(user);
        for (var i = 0; i < _com.length; i++) {
            if (_com[i].users_id && haveUnreadNotifications == false) {
                for (var k = 0; k < _com[i].users_id.length; k++) {
                    if (_com[i].users_id[k] == user.id) {
                        if(_com[i].read_id) {
                            if(_com[i].read_id[0]) {
                            var filteredComs = _com.filter(word => word == user.id)
                            if(filteredComs[0]) {
                                haveUnreadNotifications = true;
                                break;
                            }
                        }
                        } else {
                            haveUnreadNotifications = true;
                            break;

                        }
                    }
                }
            }
        }

        UTILS.httpUtil.dataSuccess(_req, _res, "success test", haveUnreadNotifications, "1.0");
        return;
    } else {

        UTILS.httpUtil.dataError(_req, _res, "Error", haveUnreadNotifications, "1.0");
        return;
    }
}

// get all communcations from user id
async function getComsHandler(_req, _res) {
    var _coms = await getCom();
    var _user_coms = []
    var comsCount = 0;
    for (var i = 0; i < _coms.length; i++) {
        if (_coms[i].users_id && _req.get.id) {
            for (var k = 0; k < _coms[i].users_id.length; k++) {
                if (_coms[i].users_id[k] == _req.get.id) {
                    _user_coms[comsCount] = _coms[i];
                    comsCount++;
                }
            }
        } else if (!_coms[i].users_id && !_coms[i].harbour_id) {
            _user_coms[comsCount] = _coms[i];
            comsCount++;
        } else if (_coms[i].harbour_id == _req.get.harbour_id && !_req.get.id) {
            _user_coms[comsCount] = _coms[i];
            comsCount++;
        }
    }
    UTILS.httpUtil.dataSuccess(_req, _res, "success", _user_coms, "1.0");
    return;
}

//send a onesignal notification, return response from onesignal and list of sent users
async function sendNotification(_notification) {

    var harbour = await getHarbourById(_notification.harbour_id);
    var entity = await getEntityById(harbour.id_entity);


    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": entity.onesignal_auth
    };


    var message = {
        app_id: entity.onesignal_app_id,
        headings: { "en": _notification.title },
        contents: { "en": _notification.message.replace(/<[^>]+>/g, '') },
        url: _notification.notification_link,
        include_player_ids: []
    };

    //select id of user of harbour with a onesignal id <
    _notification.users_id = []
    if (_notification.user_category == "all") {


        var users = await getUser({harbourid: _notification.harbour_id});

        if(users[0]) {
            var k = 0;
            for (var i = 0; i < users.length; i++) {
                if (users[i].onesignal_userid) {
                    if (Array.isArray(users[i].onesignal_userid)) {

                        for (var d = 0; d < users[i].onesignal_userid.length; d++) {
                            if(users[i].onesignal_userid[d] && users[i].onesignal_userid[d] != null && users[i].onesignal_userid[d] != 'null') {
                                message.include_player_ids.push(users[i].onesignal_userid[d]);
                            }
                        }  
                        _notification.users_id.push(users[i].id);
                    } else if (users[i].onesignal_userid != null && users[i].onesignal_userid != 'null') {
                        message.include_player_ids.push(users[i].onesignal_userid);
                        _notification.users_id.push(users[i].id);
                    }
                }
            }

        }
    } else if (_notification.user_category == "visitor") {
        message.include_player_ids = [];
        _notification.users_id = [];

        if (_notification.harbour_id)
            var users = await getUserByCategoryAndHarbourId(_notification.user_category, _notification.harbour_id);
        else
            var users = await getUserByCategory(_notification.user_category);

        var k = 0;
        for (var i = 0; i < users.length; i++) {

            if (users[i].onesignal_userid) {
                message.include_player_ids.push(users[i].onesignal_userid);
                _notification.users_id.push(users[i].id);
            }
        }

    } else if (_notification.user_category == "yachtsman") {
        
        message.include_player_ids = [];
        _notification.users_id = [];
        
        if (_notification.harbour_id)
            var users = await getUserByCategoryAndHarbourId(_notification.user_category, _notification.harbour_id);
        else
            var users = await getUserByCategory(_notification.user_category);

        var k = 0;
        for (var i = 0; i < users.length; i++) {
            if (users[i].onesignal_userid) {
                if(Array.isArray(users[i].onesignal_userid)) {
                    for(var oid = 0; oid < users[i].onesignal_userid.length; oid++) {
                        if(users[i].onesignal_userid[oid] && users[i].onesignal_userid[oid] != null && users[i].onesignal_userid[oid] != 'null') {
                            message.include_player_ids.push(users[i].onesignal_userid[oid]);
                            _notification.users_id.push(users[i].id);
                        }
                    }
                }else if (users[i].onesignal_userid != null && users[i].onesignal_userid != 'null') {
                    message.include_player_ids.push(users[i].onesignal_userid);
                    _notification.users_id.push(users[i].id);
                }
            }
        }
        console.log(message.include_player_ids);
    } else
        return false;
    // >
    
    //send notification to onesignal
    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers,
        data: JSON.stringify(message)
    };
    var promise = await UTILS.httpsUtil.httpReqPromise(options);
    
    
    if (users)
        return { response: promise, users: _notification.users_id };
    else
        return { response: promise, users: null };
}

//Handler to register a new onesignal id
async function registerOneSignalUserIdHandler(_req, _res) {

    //get current user if user id in request
    var currentUser;        
    if (_req.get.userid) {
        currentUser = await getUserById(_req.get.userid);
    }
        
    //if user is not a visitor
    if (_req.get.userid && _req.get.onesignal_userid && _req.get.onesignal_userid != null && currentUser.category != "visitor") {
        var newosid = _req.get.onesignal_userid;
        var user = await getUserById(_req.get.userid);
        //if user already have a onsesignal id
        if(user.id) {
            if(user.onesignal_userid) {
                
                if(Array.isArray(user.onesignal_userid)) {
                    for (var i = 0; i < user.onesignal_userid.length; i++) {

                        if (user.onesignal_userid[i] == newosid) {

                            UTILS.httpUtil.dataError(_req, _res, "Error", "osid déjà attribué", "1.0");
                            return;
                        }
                    }
                    
                    user.onesignal_userid.push(_req.get.onesignal_userid);

                    let promise = await updateUser(user);

                    delete promise.password;
                    UTILS.httpUtil.dataSuccess(_req, _res, "success", promise, "1.0");
                    return;
                }
            //if user don't have a onsesignal id
            } else {
                user.onesignal_userid = [_req.get.onesignal_userid];
                let promise = await updateUser(user);
                delete promise.password;
                UTILS.httpUtil.dataSuccess(_req, _res, "success", promise, "1.0");
                return;
            }
        }
    // if user a visitor
    } else if (_req.get.onesignal_userid && _req.get.harbourid) {

        let user = await getUserByOnesignalId(_req.get.onesignal_userid);
        // if onesignal id not in db
        if (!user[0]) {
            let promise = await createUser({ onesignal_userid: _req.get.onesignal_userid, category: "visitor", harbourid: _req.get.harbourid });
            UTILS.httpUtil.dataSuccess(_req, _res, "success", promise, "1.0");
            return;
        //change harbour if in db
        } else {
            let update = {};
            update.id = user[0].id;
            update.harbourid = _req.get.harbourid;
            var promise = await updateUser(update);

            UTILS.httpUtil.dataSuccess(_req, _res, "Onesignal Userid visitor already in db", promise, "1.0");
            return;
        }
    }
}

exports.router =
    [
        {
            route: "/api/register/onesignal/userid",
            handler: registerOneSignalUserIdHandler,
            method: "GET"
        },
        {
            route: "/api/com",
            handler: getComHandler,
            method: "GET",
        },
        {
            route: "/api/coms",
            handler: getComsHandler,
            method: "GET",
        },
        {
            route:"/api/coms/isunread",
            handler: isUnreadComsHandler,
            method: "GET"
        }
    ];

exports.plugin =
{
    title: "Gestion des communications",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.com_id) {
                var currentCom = await getComById(req.post.id);
                if (currentCom.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentCom.cloudinary_img_public_id);
                }
                if (currentCom.cloudinary_pj_public_id) {
                    await STORE.cloudinary.deleteFile(currentCom.cloudinary_pj_public_id);
                }
                await delCom(req.get.com_id);
            }
            else if (req.get.com_id) {
                await getComById(req.get.com_id);
            }
        }
        if (req.method == "POST") {

            if (req.post.id) {
                if (verifyPostReq(req, res)) {

                    var currentCom = await getComById(req.post.id);
                    var _FD = req.post;

                    if (_FD.link)
                        _FD.link = addProtocolToUrl(_FD.link);

                    //img gesture
                    if (_FD.img) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                        if (currentCom.cloudinary_img_public_id) {
                            await STORE.cloudinary.deleteFile(currentCom.cloudinary_img_public_id);
                        }

                    }

                    //pj gesture
                    if (_FD.pj) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.pj, req.field["pj"].filename, "slug");;
                        _FD.pj = upload.secure_url;
                        _FD.cloudinary_pj_public_id = upload.public_id;
                        if (currentCom.cloudinary_pj_public_id) {
                            await STORE.cloudinary.deleteFile(currentCom.cloudinary_pj_public_id);
                        }
                    }

                    var com = await updateCom(_FD);
                    if (com[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Notification mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de la notification", "1.0");
                        return;
                    }
                }
            }
            else {
                if (typeof req.body == "object" && req.multipart) {
                    if (verifyPostReq(req, res)) {

                        var _FD = req.post;

                        if (_FD.link)
                            _FD.link = addProtocolToUrl(_FD.link);

                        _FD.date = Date.now();

                        //img gesture
                        if (_FD.img) {
                            var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                            _FD.img = upload.secure_url;
                            _FD.cloudinary_img_public_id = upload.public_id;

                        }

                        //pj gesture
                        if (_FD.pj) {
                            var upload = await STORE.cloudinary.uploadFile(_FD.pj, req.field["pj"].filename, "slug");;
                            _FD.pj = upload.secure_url;
                            _FD.cloudinary_pj_public_id = upload.public_id;
                        }

                        _FD.id = UTILS.UID.generate();
                        _FD.notification_link = "/notification?id=" + _FD.id;

                        _FD.read_id = [];

                        var promise = await sendNotification(_FD);
                        if (promise.response) {
                            if (promise.users_id)
                                _FD.users_id = promise.users_id;


                            var com = await createCom(_FD);
                            console.log(com);
                            if (com.id) {
                                UTILS.httpUtil.dataSuccess(req, res, "Success", "Notification envoyé", "1.0");
                                return;
                            } else {
                                UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de l'enregistrement de la notification", "1.0");
                                return;
                            }

                        }
                        else {
                            UTILS.httpUtil.dataError(req, res, "erreur lors de l'envoi de la notification", "1.0");
                            return;
                        }
                    }
                }
            }
        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _comHtml = fs.readFileSync(path.join(__dirname, "com.html")).toString();
            var _Coms;
            if (_type == "harbour_manager")
                _Coms = await getComsByHarbourId(_harbour_id);
            else
                _Coms = await getCom();

            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _Coms = _Coms.concat(await getComsByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _Coms = await getCom();


            var _comGen = "";
            for (var i = 0; i < _Coms.length; i++) {
                if (_Coms[i].category == "weather") {
                    _Coms[i].category = "Météo";
                } else if (_Coms[i].category == "event") {
                    _Coms[i].category = "Événement";
                } else if (_Coms[i].category == "maintenance") {
                    _Coms[i].category = "Travaux";
                } else if (_Coms[i].category == "security") {
                    _Coms[i].category = "Sécurité";
                } else if (_Coms[i].category == "other") {
                    _Coms[i].category = "Autre";
                }

                if (_Coms[i].user_category == "all") {
                    _Coms[i].user_category = "Tous";
                } else if (_Coms[i].user_category == "yatchsman") {
                    _Coms[i].user_category = "Plaisanciers";
                } else if (_Coms[i].user_category == "visitor") {
                    _Coms[i].user_category = "Visiteurs";
                }

                var date = new Date(_Coms[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');

                date = new Date(_Coms[i].date_start);
                var startDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');
                date = new Date(_Coms[i].date_end);
                var endDateFormated = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + (date.getDate())).slice(-2)].join('-');

                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_Coms[i].harbour_id);

                _comGen += _comHtml.replace(/__ID__/g, _Coms[i].id)
                    .replace(/__FORMID__/g, _Coms[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, _Coms[i].category)
                    .replace(/__USER_CATEGORY__/g, _Coms[i].user_category)
                    .replace(/__EDITOR_ID__/g, "editor_" + _Coms[i].id.replace(/\./g, "_"))
                    .replace(/__MESSAGE__/g, _Coms[i].message)
                    .replace(/__LINK_NAME__/g, _Coms[i].link_name)
                    .replace(/__LINK__/g, _Coms[i].link)
                    .replace(/__TITLE__/g, _Coms[i].title)
                    .replace(/__PJNAME__/g, _Coms[i].pjname)
                    .replace(/__PJ__/g, _Coms[i].pj)
                    .replace(/__IMG__/g, _Coms[i].img)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _Coms[i].date)
            }
            _indexHtml = _indexHtml.replace("__COMS__", _comGen).replace(/undefined/g, '');

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


            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}