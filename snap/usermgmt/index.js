var _userCol = "user";
var _mailCol = "mail";
var _userFpCol = "user";


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

async function getUser() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getUserByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { harbourid: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getUserByToken(_token) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { token: _token }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function verifyIfExistInUsers(_email, _phone) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, { email: _email, phone: _phone }, null, function (_err, _data) {
            console.log(_data);
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function findByColl(_request) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_userCol, _request, null, function (_err, _data) {
            console.log(_data);
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delUser(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_userCol, { id: _id }, function (_err, _data) {
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

async function createMail(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_mailCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getMail() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_mailCol, {}, null, function (_err, _data) {
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

async function getMailByHarbourAndMail(_harbour_id, _email) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_mailCol, { harbour_id: _harbour_id, email: _email }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getMailByHarbour(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_mailCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
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

//routes handlers
async function addUserHandler(req, res) {
    if (req.post.prefix) {
        req.post.prefix = completePhonePrefix(req.post.prefix);
    }
    if (verifyPostReq(req, res, false)) {
        var user = req.post;

        user.prefixed_phone = user.prefix + user.phone.replace(/^0/, '');
        var promiseEmail = await findByColl({ email: user.email });
        var promisePhone = await findByColl({ phone: user.phone });
        if (promiseEmail[0] || promisePhone[0]) {
            UTILS.httpUtil.dataError(req, res, "Error", "Email ou téléphone déjà enregistré", "1.0");
            return;
        } else {
            delete user.password_confirm;
            user.id = UTILS.UID.generate();
            user.password = UTILS.Crypto.createSHA512(user.id + user.password);
            user.date = Date.now();
            user.token = UTILS.Crypto.createSHA512(user.id + user.date + user.first_name);
            if (await createUser(user)) {
                UTILS.httpUtil.dataSuccess(req, res, "success, user registered", { id: user.id, harbourid: user.harbourid, token: user.token }, "1.0");
                return;
            }
            else {
                UTILS.httpUtil.dataError(req, res, "Error", "utilisateur non enregistré", "1.0");
                return;
            }
        }
    }
}

async function getUserInfos(_req, _res) {
    if (_req.post.token) {
        var user = await findByColl({ "token": _req.post.token })
        if (user[0]) {
            delete user[0].password;
            UTILS.httpUtil.dataSuccess(_req, _res, "User", user[0], "1.0");
            return;
        } else {
            UTILS.httpUtil.dataError(_req, _res, "User not found", null, "1.0");
            return;
        }
    }
}

async function loginHandler(req, res) {
    var user = await findByColl({ "email": req.post.email });

    if (user[0]) {
        user = user[0];
        var password = UTILS.Crypto.createSHA512(user.id + req.post.password);
        if (user.password == password) {
            user.token = UTILS.Crypto.createSHA512(user.id + new Date() + user.first_name);
            await updateUser(user);
            UTILS.httpUtil.dataSuccess(req, res, "success, user logged", { id: user.id, harbourid: user.harbourid, token: user.token }, "1.0");
            return;
        } else {
            UTILS.httpUtil.dataError(req, res, "Erreur", "Identifiants incorrects", null, "1.0");
            return;
        }
    } else {
        UTILS.httpUtil.dataError(req, res, "Erreur", "Identifiants incorrects", null, "1.0");
        return;
    }
}

async function userSessionHandler(_req, _res) {
    if (_req.post.token) {
        var user = await findByColl({ "token": _req.post.token })
        if (user[0]) {
            UTILS.httpUtil.dataSuccess(_req, _res, "Success", "User authentified", null, "1.0");
            return;
        } else {
            UTILS.httpUtil.dataError(_req, _res, "Error", "User not authentified", null, "1.0");
            return;
        }
    } else {
        UTILS.httpUtil.dataError(_req, _res, "Error", "User not authentified", null, "1.0");
        return;
    }
}

async function updateUserHandler(_req, _res) {
    console.log(_req.post);
    if (_req.post.prefix) {
        _req.post.prefix = completePhonePrefix(_req.post.prefix);
    }
    if (_req.post.token) {
        var user = await findByColl({ "token": _req.post.token })

        if (user[0]) {
            var update = _req.post;
            update.prefixed_phone = user.prefix + user.phone.replace(/^0/, '');
            console.log(update.prefixed_number);
            update.id = user[0].id;
            console.log(update);
            promise = await updateUser(update);
            UTILS.httpUtil.dataSuccess(_req, _res, "User authentified", null, "1.0");
            return;
        } else {
            UTILS.httpUtil.dataError(_req, _res, 'error', "Vous devez créer un compte pour paramétrer votre profil.", null, "1.0");
            return;
        }
    } else {
        UTILS.httpUtil.dataError(_req, _res, "error", "Vous devez créer un compte pour paramétrer votre profil.", null, "1.0");
        return;
    }
}


async function createMailHandler(_req, _res) {
    console.log(_req);
    var admin = await getAdminById(_req.userCookie.data.id);
    var _type = admin.data.split('|')[0];
    var _entity_id = admin.data.split('|')[1];
    var _harbour_id = admin.data.split('|')[2];

    if (_type == 'harbour_manager') {
        _req.post.harbour_id = _harbour_id;
    }

    var mailsArray = _req.post.csvmails.replace(/\n/g, '').split('\r');
    console.log(mailsArray);
    var mailsJson = {};
    for (var i = 1; i < mailsArray.length; i++) {
        STORE.db.linkdb.Create(_mailCol, { email: mailsArray[i], harbour_id: _req.post.harbour_id }, function (_err, _data) {
            if (!_data) {
                UTILS.httpUtil.dataError(_req, _res, "error", _err, null, "1.0");
                return;
            }
        })
    }
    UTILS.httpUtil.dataSuccess(_req, _res, "success", "mails added", null, '1.0');
    return;
}


async function verifyMailHandler(_req, _res) {
    var mails = await getMailByHarbour(_req.post.harbourid);
    console.log(mails);
    if (mails.length > 0) {
        var mail = await getMailByHarbourAndMail(_req.post.harbourid, _req.post.email);
        console.log(mail);
        if (mail[0]) {
            UTILS.httpUtil.dataSuccess(_req, _res, "success", "No mail in base required", null, '1.0');
            return;
        } else {
            UTILS.httpUtil.dataError(_req, _res, "error", "Vous n'êtes pas dans la base mail du port.", null, "1.0");
            return;
        }
    } else {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", "No mail in base required", null, '1.0');
        return;
    }
}


async function updateMailHandler(_req, _res) {
    if (typeof (await updateMail(req.post)) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "Utilisateur mis à jour", "1.0");
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "error", "error while insterting in database", null, "1.0");
        return;
    }
}
async function verifyUserFormHandler(_req, _res) {
    if (verifyPostReq(_req.data)) {
        UTILS.httpUtil.dataSuccess(_req, _res, 'success', 'no error in form data', '1.0');
        return;
    }
}
exports.router =
    [
        {
            on: true,
            route: "/api/adduser",
            handler: addUserHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/updateuser",
            handler: updateUserHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/login",
            handler: loginHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/user/session",
            handler: userSessionHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/getuser",
            handler: getUserInfos,
            method: "POST",
        },
        {
            on: true,
            route: "/api/verify/user/form",
            handler: verifyUserFormHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/create/mail",
            handler: createMailHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/verify/mail",
            handler: verifyMailHandler,
            method: "POST",
        },
        {
            on: true,
            route: "/api/update/mail",
            handler: updateMailHandler,
            method: "POST",
        },
    ];


exports.handler = async (req, res) => {
    var _user = await getUser();
    res.end(JSON.stringify(_user));
    return;
}

exports.plugin =
{
    title: "Gestion des utilisateurs",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.user_id) {
                await delUser(req.get.user_id);
            } else if (req.get.mode && req.get.mode == "delete" && req.get.mail_id) {
                await delMail(req.get.mail_id);
            }
            else if (req.get.user_id) {
                await getUserById(req.get.user_id);
            }
            else if (req.get.userlist) {
                var userlist = await getUser();
                UTILS.httpUtil.dataSuccess(req, res, userlist, "1.0");
                return;
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (typeof (await updateUser(req.post)) != "string") {
                    UTILS.httpUtil.dataSuccess(req, res, "Mail mis à jour", "1.0");
                    return;
                }
            } else if (req.post.type = 'mail') {
                if (_type == 'harbour_manager') {
                    req.post.harbour_id = _harbour_id;
                }

                var mailsArray = req.post.csvmails.replace(/\n/g, '').split('\r');
                console.log(mailsArray);
                var mailsJson = {};
                for (var i = 1; i < mailsArray.length; i++) {
                    STORE.db.linkdb.Create(_mailCol, { email: mailsArray[i], harbour_id: req.post.harbour_id }, function (_err, _data) {
                        if (!_data) {
                            UTILS.httpUtil.dataError(req, res, "error", _err, null, "1.0");
                            return;
                        }
                    })
                }
                UTILS.httpUtil.dataSuccess(req, res, "success", "mails added", null, '1.0');
                return;
            }
        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _userHtml = fs.readFileSync(path.join(__dirname, "user.html")).toString();
            var _mailHtml = fs.readFileSync(path.join(__dirname, "mail.html")).toString();
            var _users = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _users = _users.concat(await getUserByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _users = await getUser();



            console.log(_users);
            var _userGen = "";
            for (var i = 0; i < _users.length; i++) {
                if (_users[i].category != "visitor") {
                    var date = new Date(_users[i].date);
                    var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');
                    var currentHarbour = await STORE.harbourmgmt.getHarbourById(_users[i].harbour_id);


                    _userGen += _userHtml.replace(/__ID__/g, _users[i].id)
                        .replace(/__FORMID__/g, _users[i].id.replace(/\./g, "_"))
                        .replace(/__CATEGORY__/g, _users[i].category)
                        .replace(/__FIRST_NAME__/g, _users[i].first_name)
                        .replace(/__LAST_NAME__/g, _users[i].last_name)
                        .replace(/__EMAIL__/g, _users[i].email)
                        .replace(/__PHONE__/g, _users[i].prefixed_phone)
                        .replace(/__DATETIMEORDER__/g, _users[i].date)
                        .replace(/__DATE__/g, dateFormated)
                        .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                        .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                        .replace(/__CONTRACT_NUMBER__/g, _users[i].contract_number)
                        .replace(/__IS_RESIDENT__/g, _users[i].is_resident)
                }
            }
            var _mails = [];

            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _mails = _mails.concat(await getUserByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _mails = await getMail();

            var _mailGen = "";
            for (var i = 0; i < _mails.length; i++) {
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_mails[i].harbour_id);
                _mailGen += _mailHtml.replace(/__ID__/g, _mails[i].id)
                    .replace(/__FORMID__/g, _mails[i].id.replace(/\./g, "_"))
                    .replace(/__EMAIL__/g, _mails[i].email)
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
            }

            _indexHtml = _indexHtml.replace("__USERS__", _userGen);
            _indexHtml = _indexHtml.replace("__MAILS__", _mailGen).replace(/undefined/g, '');

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
exports.store =
{
    getUserById: getUserById,
    getUserByToken: getUserByToken
}
