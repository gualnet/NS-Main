var _harbourCol = "harbour";
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
    const re = /^-?\d{1,2}\.\d{1,}$/;
    return re.test(String(coord).toLowerCase());
}

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

function completePhonePrefix(prefix) {
    var patternPrefix = new RegExp(/^\+/)
    if (patternPrefix.test(prefix)) {
        return prefix
    } else {
        return '+' + prefix;
    }
}

function validateUrl(value) {
    var pattern = new RegExp('^(https?:\\/\\/)' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + //port
        '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i');
    return pattern.test(value);
}

function verifyPostReq(_req, _res) {
    if (!_req.post.name || _req.post.name.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de port requis", "100", "1.0");
        return false;
    }
    if (!_req.post.email || _req.post.email.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Email requis", "100", "1.0");
        return false;
    }
    if (!validateEmail(_req.post.email)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Email invalide", "100", "1.0");
        return false;
    }
    if (_req.post.email_concierge) {
        var mails = _req.post.email_concierge.split(";")
        for (var i = 0; i < mails.length; i++) {
            if (!validateEmail(mails[i])) {
                UTILS.httpUtil.dataError(_req, _res, "Error", "Email conciergerie invalide : " + mails[i], "100", "1.0");
                return false;
            }
        }
    }
    if (!_req.post.phone || _req.post.phone.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
        return false;
    }
    if (!_req.post.prefix || _req.post.prefix.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
        return false;
    }
    if (_req.post.phone_urgency) {
        if (!_req.post.prefix_urgency || _req.post.prefix_urgency.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du téléphone d'urgence requis", "100", "1.0");
            return false;
        }
    }
    if (!validatePhone(_req.post.phone)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
        return false;
    }
    if (!_req.post.latitude || _req.post.latitude.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Latitude requis", "100", "1.0");
        return false;
    }
    if (!validateGpsCoord(_req.post.latitude)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Latitude incorrect", "100", "1.0");
        return false;
    }
    if (!_req.post.longitude || _req.post.longitude.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Longitude requis", "100", "1.0");
        return false;
    }
    if (!validateGpsCoord(_req.post.longitude)) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Longitude incorrect", "100", "1.0");
        return false;
    }
    if (_req.post.website) {
        if (validateUrl(_req.post.website) != true) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "URL incorrect", "100", "1.0");
            return false;
        }
    }
    if (_req.post.touristwebsite) {
        if (validateUrl(_req.post.touristwebsite) != true) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "URL incorrect", "100", "1.0");
            return false;
        }
    }

    return true;
}

async function getEntityById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_enityCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

//bdd requests
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

async function getHarbourByEntityId(_entity_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_harbourCol, { id_entity: _entity_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function delHarbour(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_harbourCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createHarbour(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_harbourCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updateHarbour(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_harbourCol, { id: _obj.id }, _obj, function (_err, _data) {
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

//routes handlers
async function getHarbourList(req, res) {
    var harbours = await getHarbourByEntityId(req.param.entity_id);
    var harboursSimplified = [];
    for (var i = 0; i < harbours.length; i++) {
        harboursSimplified[i] = { name: harbours[i].name, id: harbours[i].id, img: harbours[i].img };
    }
    UTILS.httpUtil.dataSuccess(req, res, "harbours simplified list", harboursSimplified, "1.0");
    return;
}

async function getHarbourInfos(req, res) {
    var harbours = await getHarbourById(req.param.harbourid);
    UTILS.httpUtil.dataSuccess(req, res, "success, harbour infos", harbours, "1.0");
    return;
}
exports.store = 
{
    getHarbourByEntityId: getHarbourByEntityId,
    getHarbourById: getHarbourById,
    getHarbour: getHarbour
}
exports.router =
    [
        {
            on: true,
            route: "/api/getharbours/:entity_id",
            handler: getHarbourList,
            method: "GET",
        },
        {
            on: true,
            route: "/api/getharbour/:harbourid",
            handler: getHarbourInfos,
            method: "GET",
        },
    ];


exports.handler = async (req, res) => {
    var _harbour = await getHarbour();
    res.end(JSON.stringify(_harbour));
    return;
}

exports.plugin =
{
    title: "Gestion des ports",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.harbour_id) {
                //delete harbour
                var currentHarbour = await getHarbourById(req.get.harbour_id);
                if (currentHarbour.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_img_public_id);
                }
                if (currentHarbour.cloudinary_harbour_map_public_id) {
                    await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_harbour_map_public_id);
                }
                if (currentHarbour.cloudinary_price_list_public_id) {
                    await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_price_list_public_id);
                }
                await delHarbour(req.get.harbour_id);
            }
            else if (req.get.harbour_id) {
                await getHarbourById(req.get.harbour_id);
            }
            else if (req.get.harbourlist) {
                var harbourlist = await getHarbour();

                UTILS.httpUtil.dataSuccess(req, res, harbourlist, "1.0");
                return;
            }
        }
        if (req.method == "POST") {
            if (req.post.website)
                req.post.website = addProtocolToUrl(req.post.website);
            if (req.post.touristwebsite)
                req.post.touristwebsite = addProtocolToUrl(req.post.touristwebsite);

            if (req.post.erp_link)
                req.post.erp_link = addProtocolToUrl(req.post.erp_link);

            if (req.post.prefix)
                req.post.prefix = completePhonePrefix(req.post.prefix);
            if (req.post.prefix_urgency) {
                req.post.prefix_urgency = completePhonePrefix(req.post.prefix_urgency);
            }

            if (req.post.prefix && req.post.phone) {
                req.post.prefixed_phone = req.post.prefix + req.post.phone.replace(/^0/, '');
            }

            if (req.post.prefixed_phone_urgency && req.post.phone_urgency) {
                req.post.prefixed_phone_urgency = req.post.prefix + req.post.phone_urgency.replace(/^0/, '');
            }

            if (req.post.id) {
                //update harbour
                var currentHarbour = await getHarbourById(req.post.id);
                if (verifyPostReq(req, res)) {

                    //img gesture
                    if (req.post.img) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.img, req.field["img"].filename);
                        console.log(upload);
                        req.post.img = upload.secure_url;
                        req.post.cloudinary_img_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_img_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_img_public_id);
                        }
                    }

                    //harbour map gesture
                    if (req.post.harbour_map) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.harbour_map, req.field["harbour_map"].filename);
                        console.log(upload);
                        req.post.harbour_map = upload.secure_url;
                        req.post.cloudinary_harbour_map_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_harbour_map_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_harbour_map_public_id);
                        }
                    }

                    //price list gesture
                    if (req.post.price_list) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.price_list, req.field["price_list"].filename);
                        console.log(upload);
                        req.post.price_list = upload.secure_url;
                        req.post.cloudinary_price_list_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_price_list_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_price_list_public_id);
                        }
                    }

                    //pj gesture
                    if (req.post.pj) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.pj, req.field["pj"].filename);
                        console.log(upload);
                        req.post.pj = upload.secure_url;
                        req.post.cloudinary_pj_public_id = upload.public_id;
                        if (currentHarbour.cloudinary_pj_public_id) {
                            await STORE.cloudinary.deleteFile(currentHarbour.cloudinary_pj_public_id);
                        }
                    }

                    var harbour = await updateHarbour(req.post);
                    console.log(harbour);
                    if (harbour[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Port mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour du port", "1.0");
                        return;
                    }
                }
            }
            else {
                //create harbour
                req.post.date = Date.now();
                if (verifyPostReq(req, res)) {
                    //img gesture
                    if (req.post.img) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.img, req.field["img"].filename);
                        console.log(upload);
                        req.post.img = upload.secure_url;
                        req.post.cloudinary_img_public_id = upload.public_id;
                    }

                    //harbour map gesture
                    if (req.post.harbour_map) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.harbour_map, req.field["harbour_map"].filename);
                        console.log(upload);
                        req.post.harbour_map = upload.secure_url;
                        req.post.cloudinary_harbour_map_public_id = upload.public_id;
                    }

                    //price list gesture
                    if (req.post.price_list) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.price_list, req.field["price_list"].filename);
                        console.log(upload);
                        req.post.price_list = upload.secure_url;
                        req.post.cloudinary_price_list_public_id = upload.public_id;
                    }

                    //pj gesture
                    if (req.post.pj) {
                        var upload = await STORE.cloudinary.uploadFile(req.post.pj, req.field["pj"].filename);
                        console.log(upload);
                        req.post.pj = upload.secure_url;
                        req.post.cloudinary_pj_public_id = upload.pj;
                    }

                    var harbour = await createHarbour(req.post);
                    console.log(harbour);
                    if (harbour.id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Port créé", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création du port", "1.0");
                        return;
                    }
                }
            }
        }
        else {
            var _indexHtml;
            var _harbourHtml;
            var _harbours = [];

            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    _harbours[i] = await getHarbourById(_harbour_id[i]);
                }
                _indexHtml = fs.readFileSync(path.join(__dirname, "indexuser.html")).toString();
                _harbourHtml = fs.readFileSync(path.join(__dirname, "harbouruser.html")).toString();
            }
            else if (_role == "admin") {
                _harbours = await getHarbour();
                _harbourHtml = fs.readFileSync(path.join(__dirname, "harbour.html")).toString();
                _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            }
            console.log(_harbours);

            var _harbourGen = "";
            for (var i = 0; i < _harbours.length; i++) {
                _harbourGen += _harbourHtml.replace(/__ID__/g, _harbours[i].id)
                    .replace(/__FORMID__/g, _harbours[i].id.replace(/\./g, "_"))
                    .replace(/__ID_ENTITY__/g, _harbours[i].id_entity)
                    .replace(/__NAME__/g, _harbours[i].name)
                    .replace(/__EMAIL__/g, _harbours[i].email)
                    .replace(/__PREFIX__/g, _harbours[i].prefix)
                    .replace(/__PHONE__/g, _harbours[i].phone)
                    .replace(/__PREFIX_URGENCY__/g, _harbours[i].prefix_urgency)
                    .replace(/__PHONE_URGENCY__/g, _harbours[i].phone_urgency)
                    .replace(/__ADDRESS__/g, _harbours[i].address)
                    .replace(/__LATITUDE__/g, _harbours[i].latitude)
                    .replace(/__LONGITUDE__/g, _harbours[i].longitude)
                    .replace(/__LUNDI__/g, _harbours[i].lundi)
                    .replace(/__MARDI__/g, _harbours[i].mardi)
                    .replace(/__MERCREDI__/g, _harbours[i].mercredi)
                    .replace(/__JEUDI__/g, _harbours[i].jeudi)
                    .replace(/__VENDREDI__/g, _harbours[i].vendredi)
                    .replace(/__SAMEDI__/g, _harbours[i].samedi)
                    .replace(/__DIMANCHE__/g, _harbours[i].dimanche)
                    .replace(/__WEBSITE__/g, _harbours[i].website)
                    .replace(/__TOURISTWEBSITE__/g, _harbours[i].touristwebsite)
                    .replace(/__TECHNICAL_INFORMATIONS__/g, _harbours[i].technical_informations)
                    .replace(/__VFH__/g, _harbours[i].vfh)
                    .replace(/__PLACES__/g, _harbours[i].places)
                    .replace(/__BUOY__/g, _harbours[i].buoy)
                    .replace(/__TIRANTDEAU__/g, _harbours[i].tirantdeau)
                    .replace(/__LONGMAX__/g, _harbours[i].longmax)
                    .replace(/__ELECTRICITY__/g, _harbours[i].electricity)
                    .replace(/__WATER__/g, _harbours[i].water)
                    .replace(/__DOUCHES__/g, _harbours[i].showers)
                    .replace(/__TOILET__/g, _harbours[i].toilet)
                    .replace(/__SANITARY_CODE__/g, _harbours[i].sanitary_code)
                    .replace(/__FUEL__/g, _harbours[i].fuel)
                    .replace(/__WIFI__/g, _harbours[i].wifi)
                    .replace(/__WIFI_PASS__/g, _harbours[i].wifi_pass)
                    .replace(/__IMG__/g, _harbours[i].img)
                    .replace(/__HARBOUR_MAP__/g, _harbours[i].harbour_map)
                    .replace(/__PRICE_LIST__/g, _harbours[i].price_list)
                    .replace(/__ERP_LINK__/g, _harbours[i].erp_link)
                    .replace(/__PJ__/g, _harbours[i].pj)
                    .replace(/__PJ_NAME__/g, _harbours[i].pj_name)
                    .replace(/__EMAIL_CONCIERGE__/g, _harbours[i].email_concierge)
                    .replace(/__NAVILY_ID__/g, _harbours[i].navily_id)
            }
            _indexHtml = _indexHtml.replace("__HARBOURS__", _harbourGen).replace(/undefined/g, '');
            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}