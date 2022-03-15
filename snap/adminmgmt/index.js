//gestion des admin gestionnaire de ports


//set datatable cols
var _userCol = "user";
var _harbourCol = "harbour";
var _entityCol = "entity";

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^\d{10}$|^\d{9}$/;
    return re.test(String(phone).toLowerCase());
}

function verifyPostReq(_req, _res) {
    if (!_req.post.name || _req.post.name.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de l'entité", "100", "1.0");
        return false;
    }
    return true;
}

//db functions <
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

async function getAdmin() {
    return new Promise(resolve => {
        STORE.db.linkdbfp.Find(_userCol, { role: "user" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getAdminByLogin(_login) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.Find(_userCol, { login: _login }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delAdmin(_id) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.Delete(_userCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createAdmin(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.Create(_userCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateAdmin(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.Update(_userCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updateAdminData(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdbfp.Update(_userCol, { id: _obj.id }, { data: _obj.data }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getEntity() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_entityCol, {}, null, function (_err, _data) {
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
async function getHarbour() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_harbourCol, {}, null, function (_err, _data) {
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


async function getAdminByIdHandler(_req, _res) {
    var admin = await getAdminById(_req.param.admin_id);
    console.log(admin);
    if (admin.id) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", admin, "1.0");
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "error", "admin not found", "1.0");
        return;
    }
}

exports.router =
    [
        {
            on: true,
            route: "/api/admin/get/:admin_id",
            handler: getAdminByIdHandler,
            method: 'get'
        }
    ];

exports.handler = async (req, res) => {
    var _admin = await getAdmin();
    res.end(JSON.stringify(_admin));
    return;
}

function verifyAccess(_type, _res) {
    if (_type == 'harbour_manager') {
        _res.end("<p>Accès refusé</p>");
        return;
    }
}

exports.plugin =
{
    title: "Gestion des admins",
    desc: "",
    handler: async (req, res) => {
        //get user from FORTPRESS db <
        var admin;
        var _type;
        var _entity_id;
        var _harbour_id;
        if (req.userCookie.data.id) {
            console.log(req.userCookie.data.id);
            admin = await getAdminById(req.userCookie.data.id);
            if(admin.id) {
                if(admin.data.type)
                    _type = admin.data.type;
                if(admin.data.entity_id)
                    _entity_id = admin.data.entity_id;
                if(admin.data.harbour_id)
                    _harbour_id = admin.data.harbour_id;
            }
        }
        // >
        
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.admin_id) {
                verifyAccess(_type, res);
                await delAdmin(req.get.admin_id);
            }
            else if (req.get.admin_id) {
                verifyAccess(_type, res);
                await getAdminById(req.get.admin_id);
            } 
        }
        if (req.method == "POST") {
            
            if(req.post.mode == "get_session") {
                                    console.log(admin);
                if (!admin) {
                    console.log("test");
                    UTILS.httpUtil.dataError(req, res, "error", "No user session", "1.0");
                    return;
                } else {
                    delete admin.password;
                    delete admin.pw_type;
                    delete admin.id;
                    delete admin.login;
                    UTILS.httpUtil.dataSuccess(req, res, "User session active", admin, "1.0");
                    return;
                }
            }
            else if (req.post.id) {
                verifyAccess(_type, res);
                if (verifyPostReq(req, res)) {
                    var currentAdmin = await getAdminById(req.post.id);
                    if (currentAdmin.login != req.post.login) {
                        var _admin = await getAdminByLogin(req.post.login);
                        console.log(_admin)
                        if (_admin[0]) {
                            UTILS.httpUtil.dataError(req, res, "error", "Login déjà utilisé", "1.0");
                            return;
                        }
                    }
                    currentAdmin.data.harbour_id = JSON.parse(req.post.harbour_id);
                    if (typeof (await updateAdmin(currentAdmin)) != "string") {
                        UTILS.httpUtil.dataSuccess(req, res, "Entité mis à jour", "1.0");
                        return;
                    }
                }
            }
            else {
                verifyAccess(_type, res);
                if (verifyPostReq(req, res)) {
                    
                    // verify if login already used
                    var _admin = await getAdminByLogin(req.post.login);
                    if (req.post.login == _admin.login) {
                        UTILS.httpUtil.dataError(_req, _res, "error", "Login déjà utilisé", "1.0");
                        return;
                    }
                    
                    // set new user
                    var user = {
                        id: req.post.login,
                        login: req.post.login,
                        pw_type: 'sha512',
                        password: UTILS.Crypto.createSHA512(req.post.login + req.post.password),
                        name: req.post.name,
                        bio: '',
                        role: 'user',
                        data: { type: req.post.type, entity_id: req.post.entity_id, harbour_id: JSON.parse(req.post.harbour_id) },
                        link: [],
                        last_login: new Date(),
                        photo: '/fortpress_admin_assets/img/default.png',
                        date: Date.now()
                    };
                    
                    //create user
                    if (typeof (await createAdmin(user)) != "string") {
                        //send response
                        UTILS.httpUtil.dataSuccess(req, res, "Utilisateur créé", "1.0");
                        return;
                    }
                }
            }
        }
        else {
            verifyAccess(_type, res);
            
            //get html files
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _indexUserHtml = fs.readFileSync(path.join(__dirname, "index-user.html")).toString();
            var _adminHtml = fs.readFileSync(path.join(__dirname, "admin.html")).toString();
            
            
            var _admins = await getAdmin();
        
            //modify html dynamically <
            var _adminGen = "";
            for (var i = 0; i < _admins.length; i++) {
                if (_admins[i].data != '') {
                    var entity = await getEntityById(_admins[i].data.entity_id);
                    var typeTranslated;
                    if (_admins[i].data.type == "harbour_manager") {
                        typeTranslated = "Gestionnaire de port";
                    }

                    var userHarbours = _admins[i].data.harbour_id;
                    var harbours = await STORE.harbourmgmt.getHarbourByEntityId(_admins[i].data.entity_id);
                    var harbour_select = '<select id="harbour_list_' + _admins[i].id.replace(/\./g, "_").replace("@", "_at_") + '" class="form-control" style="width:250px;" name="harbour_id" multiple>';
                    var selected;
                    for (var b = 0; b < harbours.length; b++) {
                        for (var d = 0; d < userHarbours.length; d++) {
                            if (harbours[b].id == userHarbours[d]) {
                                selected = true;
                                d = userHarbours.length;
                            } else {
                                selected = false;
                            }
                        }
                        if (selected)
                            harbour_select += '<option value="' + harbours[b].id + '" selected="selected">' + harbours[b].name + '</option>';
                        else
                            harbour_select += '<option value="' + harbours[b].id + '">' + harbours[b].name + '</option>';
                    }
                    harbour_select += '</select>';


                    _adminGen += _adminHtml.replace(/__ID__/g, _admins[i].id)
                        .replace(/__FORMID__/g, _admins[i].id.replace(/\./g, "_").replace("@", "_at_"))
                        .replace(/__NAME__/g, _admins[i].name)
                        .replace(/__LOGIN__/g, _admins[i].login)
                        .replace(/__TYPE__/g, typeTranslated)
                        .replace(/__ENTITY_NAME__/g, entity.name)
                        .replace(/__HARBOUR_NAME__/g, harbour_select);
                }
                else {
                    _adminGen += _adminHtml.replace(/__ID__/g, _admins[i].id)
                        .replace(/__FORMID__/g, _admins[i].id.replace(/\./g, "_").replace("@", "_at_"))
                        .replace(/__NAME__/g, _admins[i].name)
                        .replace(/__LOGIN__/g, _admins[i].login)
                        .replace(/__TYPE__/g, "")
                        .replace(/__ENTITY_NAME__/g, "")
                        .replace(/__HARBOUR_NAME__/g, "");
                }
            }
            // >
            
            //set entity and harbour lists <
            var entites = await getEntity();
            var harbours = await getHarbour();
            if (entites[0] && harbours[0]) {
                var entitesOption;
                for (var i = 0; i < entites.length; i++) {
                    entitesOption += '<option type="checkbox" value="' + entites[i].id + '">' + entites[i].name + '</option>';
                }
                _indexHtml = _indexHtml.replace("__ADMINS__", _adminGen)
                    .replace('__SELECT_ENTITY__', entitesOption)
                    .replace('__FIRST_ENTITY__', entites[0].id)
                    .replace(/undefined/g, '');
            } else {
                _indexHtml = "Veuillez créer une entité et un port avant de créer les comptes gestionnaire";
            }
            // >

            // send html
            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}