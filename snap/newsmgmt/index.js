var _newCol = "news";
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
    /*
    if (!_req.post.category == "news" || !_req.post.category == "event") {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
        return false;
    }*/
    if (_req.post.pj) {
        if (!_req.post.pjname || _req.post.pjname.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de la pièce jointe requise", "100", "1.0");
            return false;

        }
    }
    return true;
}

async function getNewById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_newCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getNew() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_newCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getNewsByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_newCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delNew(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_newCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createNew(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_newCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateNew(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_newCol, { id: _obj.id }, _obj, function (_err, _data) {
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
    var _new = await getNew();
    res.end(JSON.stringify(_new));
    return;
}

async function getNewHandler(req, res) {
    var _data = await getNewById(req.param.news_id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}

async function getNewsByHarbourIdHandler(req, res) {
    var _data = await getNewsByHarbourId(req.param.harbour_id);
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
            route: "/api/new/:news_id",
            handler: getNewHandler,
            method: "GET",
        },
        {
            route: "/api/news/:harbour_id",
            handler: getNewsByHarbourIdHandler,
            method: "GET",
        },
    ];

exports.plugin =
{
    title: "Gestion des actualités",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.new_id) {

                var currentNew = await getNewById(req.post.id);
                if (currentNew.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentNew.cloudinary_img_public_id);
                }
                if (currentNew.cloudinary_pj_public_id) {
                    await STORE.cloudinary.deleteFile(currentNew.cloudinary_pj_public_id);
                }
                await delNew(req.get.new_id);
            }
            else if (req.get.new_id) {
                await getNewById(req.get.new_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {

                    var currentNew = await getNewById(req.post.id);
                    var _FD = req.post;

                    _FD.date = Date.now();

                    //img gesture
                    if (_FD.img) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);;
                        console.log(upload);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                        if (currentNew.cloudinary_img_public_id) {
                            await STORE.cloudinary.deleteFile(currentNew.cloudinary_img_public_id);
                        }

                    }

                    //pj gesture
                    if (_FD.pj) {
                        console.log(_FD.pj);
                        var upload = await STORE.cloudinary.uploadFile(_FD.pj, req.field["pj"].filename, "slug");
                        console.log(upload);
                        _FD.pj = upload.secure_url;
                        _FD.cloudinary_pj_public_id = upload.public_id;
                        if (currentNew.cloudinary_pj_public_id) {
                            await STORE.cloudinary.deleteFile(currentNew.cloudinary_pj_public_id);
                        }
                    }

                    var news = await updateNew(_FD);
                    console.log(news);
                    if (news[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Actualité mise à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'actualité", "1.0");
                        return;
                    }
                }
            }
            else {
                if (typeof req.body == "object" && req.multipart) {
                    if (verifyPostReq(req, res)) {
                        var _FD = req.post;

                        _FD.date = Date.now();
                        _FD.category = 'news';

                        //img gesture
                        if (_FD.img) {
                            var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                            console.log(upload);
                            _FD.img = upload.secure_url;
                            _FD.cloudinary_img_public_id = upload.public_id;
                        }

                        //pj gesture
                        if (_FD.pj) {
                            console.log(_FD.pj);
                            var upload = await STORE.cloudinary.uploadFile(_FD.pj, req.field["pj"].filename, "slug");
                            console.log(upload);
                            _FD.pj = upload.secure_url;
                            _FD.cloudinary_pj_public_id = upload.public_id;
                        }

                        var news = await createNew(_FD);
                        console.log(news);
                        if (news.id) {
                            UTILS.httpUtil.dataSuccess(req, res, "Success", "Actualité mis à jour", "1.0");
                            return;
                        } else {
                            UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'actualité", "1.0");
                            return;
                        }
                    }
                }
            }
        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _newHtml = fs.readFileSync(path.join(__dirname, "news.html")).toString();
            var _News = [];
            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _News = _News.concat(await getNewsByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _News = await getNew();

            var _newGen = "";
            for (var i = 0; i < _News.length; i++) {
                if (_News[i].category == "news")
                    _News[i].category = "actualité";
                else if (_News[i].category == "event")
                    _News[i].category = "évennement";

                var date = new Date(_News[i].date);
                var dateFormated = [("0" + (date.getDate())).slice(-2), ("0" + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [("0" + (date.getHours())).slice(-2), ("0" + (date.getMinutes())).slice(-2), ("0" + (date.getSeconds())).slice(-2)].join(':');
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_News[i].harbour_id);

                _newGen += _newHtml.replace(/__ID__/g, _News[i].id)
                    .replace(/__FORMID__/g, _News[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, _News[i].category)
                    .replace(/__EDITOR_DESC_ID__/g, "editor_desc_" + _News[i].id.replace(/\./g, "_"))
                    .replace(/__DESCRIPTION__/g, _News[i].description)
                    .replace(/__EDITOR_ID__/g, "editor_" + _News[i].id.replace(/\./g, "_"))
                    .replace(/__CONTENT__/g, _News[i].content)
                    .replace(/__TITLE__/g, _News[i].title)
                    .replace(/__PJNAME__/g, _News[i].pjname)
                    .replace(/__PJ__/g, _News[i].pj)
                    .replace(/__IMG__/g, _News[i].img)
                    .replace(/__DATE__/g, dateFormated)
                    .replace(/__DATETIMEORDER__/g, _News[i].date)
            }
            _indexHtml = _indexHtml.replace("__NEWS__", _newGen).replace(/undefined/g, '');

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