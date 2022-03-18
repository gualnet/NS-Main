var _partnerCol = "partner";
var _userCol = "user";

var path_to_img = path.resolve(path.join(CONF.instance.static, "img", "partner"));

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    // console.log(result);
    return result;
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^\d{10}$|^\d{9}$/;
    return re.test(String(phone).toLowerCase());
}

function addProtocolToUrl(url) {
    var patternProtocol = new RegExp('^(https?:\\/\\/)') // protocol
    // console.log(url);
    // console.log(patternProtocol.test(url));
    if (patternProtocol.test(url)) {
        // console.log(url);
        return url;
    } else {
        // console.log(url);
        return ("https://" + url);
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

function completePhonePrefix(prefix) {
    var patternPrefix = new RegExp(/^\+/)
    if (patternPrefix.test(prefix)) {
        return prefix
    } else {
        return '+' + prefix;
    }
}

function verifyPostReq(_req, _res) {
    if (!_req.post.name || _req.post.name.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom du partenaire requis", "100", "1.0");
        return false;
    }
    if (!_req.post.address || _req.post.address.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Adresse requise", "100", "1.0");
        return false;
    }
    /*
        if (!_req.post.category || _req.post.category.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Cat�gorie requise", "100", "1.0");
            return false;
        }
        if (!_req.post.subcategory || _req.post.subcategory.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Sous cat�gorie requise", "100", "1.0");
            return false;
        }
    if (_req.post.email) {
        if (!validateEmail(_req.post.email)) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Email incorrect", "100", "1.0");
            return false;
        }
    }
    if (_req.post.phone) {
        if (!validatePhone(_req.post.phone)) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
            return false;
        }
    }
    */
    if (_req.post.phone) {
        if (!_req.post.prefix || _req.post.prefix.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Préfixe du numéro de téléphone requis", "100", "1.0");
            return false;
        }
        if (!_req.post.phone || _req.post.phone.length < 1) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone requis", "100", "1.0");
            return false;
        }
        if (!validatePhone(_req.post.phone)) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "Numéro de téléphone incorrect", "100", "1.0");
            return false;
        }
    }
    if (_req.post.website) {
        if (validateUrl(_req.post.website) != true) {
            UTILS.httpUtil.dataError(_req, _res, "Error", "URL incorrect", "100", "1.0");
            return false;
        }
    }
    return true;
}

async function getPartnerById(_id) {
    // console.log(_id);
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_partnerCol, _id, null, function (_err, _data) {
            if (_data) {
                // console.log(_data);
                resolve(_data);
            }
            else
                resolve(_err);
        });
    });
}


async function getPartner() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_partnerCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getPartnerByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_partnerCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getPartnerBySearch(_search) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_partnerCol, _search, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}


async function delPartner(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_partnerCol, { id: _id }, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function createPartner(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_partnerCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function updatePartner(_obj) {
    // console.log('updatePartner', _obj);
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_partnerCol, { id: _obj.id }, _obj, function (_err, _data) {
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
//route handlers
async function getPartnerBySearchHandler(_req, _res) {
    var partner = await getPartnerBySearch({ harbour_id: _req.param.harbour_id, category: _req.param.category, subcategory: _req.param.subcategory })
    // console.log('partner>', partner);
    if (partner) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", partner, "1.0");
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "error", "no partner found", "1.0")
        return;
    }
}

async function getPartnerByIdHandler(_req, _res) {
    var partner = await getPartnerById(_req.param.id);
    // console.log(_req.param.id);
    // console.log(partner);
    if (partner.id) {
        UTILS.httpUtil.dataSuccess(_req, _res, "success", partner, "1.0");
        return;
    } else {
        UTILS.httpUtil.dataError(_req, _res, "error", "no partner found", "1.0")
        return;
    }
}

async function getPartnersByHarbourHandler(_req, _res) {

    if (_req.get.harbour_id) {
        var _partners = await getPartnerByHarbourId(_req.get.harbour_id);

        if (_partners[0]) {
            // for (var i = 0; i > _partners[i].length; i++) {
            //     // console.log('ici' + _partners[i]);
            // }
            var _harbour = await STORE.harbourmgmt.getHarbourById(_req.get.harbour_id);
            var _partnerHtml = fs.readFileSync(path.join(__dirname, "partner.html")).toString();
            UTILS.httpUtil.dataSuccess(_req, _res, "success", { html: _partnerHtml, partners: _partners, harbour: _harbour }, "1.0");
            return;
        } else {
            UTILS.httpUtil.dataError(_req, _res, "error", "no partner found", "1.0")
        }
    } else UTILS.httpUtil.dataError(_req, _res, "error", "no harbour id", "1.0")
}

async function getActivePartnersCategoryHandler(_req, _res) {
    var partners = await getPartnerByHarbourId(_req.param.harbour_id);
    // console.log('Partners00', partners)
    var data = { activeCategories: {}, activeSubCategories: {} };
    for (var i = 0; i < partners.length; i++) {
        switch (partners[i].category) {
            case "harbourlife":
                data.activeCategories.harbourlife = true;
                break;
            case "experience":
                data.activeCategories.experience = true;
                break;
            case "discovery":
                data.activeCategories.discovery = true;
                break;
        }


        //discovery 	divertissement
        switch (partners[i].subcategory) {
            case "sos":
                data.activeSubCategories.sos = true;
                break;
            case "maintenance":
                data.activeSubCategories.maintenance = true;
                break;
            case "bricolage":
                data.activeSubCategories.bricolage = true;
                break;
            case "sante":
                data.activeSubCategories.sante = true;
                break;
            case "annonce":
                data.activeSubCategories.annonce = true;
                break;
            case "laverie":
                data.activeSubCategories.laverie = true;
                break;
            case "transport":
                data.activeSubCategories.transport = true;
                break;
            case "boutique":
                data.activeSubCategories.boutique = true;
                break;
            case "alimentation":
                data.activeSubCategories.alimentation = true;
                break;
            case "vieportautre":
                data.activeSubCategories.vieportautre = true;
                break;
            case "nautic":
                data.activeSubCategories.nautic = true;
                break;
            case "terrestres":
                data.activeSubCategories.terrestres = true;
                break;
            case "association":
                data.activeSubCategories.association = true;
                break;
            case "equipbourse":
                data.activeSubCategories.equipbourse = true;
                break;
            case "experienceautre":
                data.activeSubCategories.experienceautre = true;
                break;
            case "restaurant":
                data.activeSubCategories.restaurant = true;
                break;
            case "bar":
                data.activeSubCategories.bar = true;
                break;
            case "culture":
                data.activeSubCategories.culture = true;
                break;
            case "divertissement":
                data.activeSubCategories.divertissement = true;
                break;
            case "detente":
                data.activeSubCategories.detente = true;
                break;
            case "decouverteautre":
                data.activeSubCategories.decouverteautre = true;
                break;
            case 'vendeurLoueurHl':
                data.activeSubCategories.vendeurLoueurHl = true;
                break;
            case 'vendeurLoueurEx':
                data.activeSubCategories.vendeurLoueurEx = true;
                break;
        }
    }
    UTILS.httpUtil.dataSuccess(_req, _res, "success", data, "1.0");
    return;
}

exports.router =
    [
        {
            on: true,
            route: "/api/getpartner/:id",
            handler: getPartnerByIdHandler,
            method: "GET"
        },
        {
            on: true,
            route: "/api/partner/:harbour_id/:category/:subcategory",
            handler: getPartnerBySearchHandler,
            method: "GET"
        },
        {
            on: true,
            route: "/api/partner/active/:harbour_id",
            handler: getActivePartnersCategoryHandler,
            method: "GET"
        },
        {
            on: true,
            route: "/api/partners/",
            handler: getPartnersByHarbourHandler,
            method: "GET"
        }
    ];

exports.handler = async (req, res) => {
    var _partner = await getPartner();
    res.end(JSON.stringify(_partner));
    return;
}

exports.plugin =
{
    title: "Gestion des partenaires",
    desc: "",
    handler: async (req, res) => {
        var admin = await getAdminById(req.userCookie.data.id);
        var _type = admin.data.type;
        var _role = admin.role;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;
        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.partner_id) {
                var currentPartner = await getPartnerById(req.get.id);
                if (currentPartner.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentPartner.cloudinary_img_public_id);
                }
                await delPartner(req.get.partner_id);
            }
            else if (req.get.partner_id) {
                await getPartnerById(req.get.partner_id);
            }
        }
        if (req.method == "POST") {
            console.log("ici meme 0");
            console.log(req.post);
            if (req.post.id) {
                if (req.post.website)
                    req.post.website = addProtocolToUrl(req.post.website);
                if (verifyPostReq(req, res)) {
                    var _FD = req.post;

                    var currentPartner = await getPartnerById(req.post.id);

                    if (_FD.prefix && _FD.phone) {
                        _FD.prefix = completePhonePrefix(_FD.prefix);
                        _FD.prefixed_phone = _FD.prefix + _FD.phone.replace(/^0/, '');
                        // console.log(_FD.prefixed_number);
                    }

                    //img gesture
                    if (_FD.img) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                        // console.log(upload);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                        if (currentPartner.cloudinary_img_public_id) {
                            await STORE.cloudinary.deleteFile(currentPartner.cloudinary_img_public_id);
                        }
                    }

                    var partner = await updatePartner(_FD);
                    // console.log(partner);
                    if (partner[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Partenaire mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour du partenaire", "1.0");
                        return;
                    }
                }
            }
            else {
                if (req.post.website)
                    req.post.website = addProtocolToUrl(req.post.website);
                if (verifyPostReq(req, res)) {
                    var _FD = req.post;
                    _FD.date = Date.now();

                    if (_FD.prefix && _FD.phone) {
                        _FD.prefix = completePhonePrefix(_FD.prefix);
                        _FD.prefixed_phone = _FD.prefix + _FD.phone.replace(/^0/, '');
                        // console.log(_FD.prefixed_number);
                    }

                    //img gesture
                    if (_FD.img) {
                        var upload = await STORE.cloudinary.uploadFile(_FD.img, req.field["img"].filename);
                        console.log(upload);
                        _FD.img = upload.secure_url;
                        _FD.cloudinary_img_public_id = upload.public_id;
                    }

                    var partner = await createPartner(_FD);
                    // console.log(partner);
                    if (partner.id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "Partenaire créé", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création du partenaire", "1.0");
                        return;
                    }
                }
            }
        }
        else {
            var _indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
            var _partnerHtml = fs.readFileSync(path.join(__dirname, "partner.html")).toString();
            var _partners = [];

            var userHarbours = [];
            var harbour_select;
            if (_role == "user") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" style="width:250px;" id="sharbour_id" name="harbour_id">';
                for (var i = 0; i < _harbour_id.length; i++) {
                    userHarbours[i] = await STORE.harbourmgmt.getHarbourById(_harbour_id[i]);
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" style="width:250px;" id="sharbour_id" name="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();
                // console.log("ici");
                // console.log(userHarbours);
                for (var i = 0; i < userHarbours.length; i++) {
                    harbour_select += '<option value="' + userHarbours[i].id + '">' + userHarbours[i].name + '</option>';
                }
                harbour_select += '</select></div></div>';
            }
            _indexHtml = _indexHtml.replace('__HARBOUR_ID_INPUT__', harbour_select);


            if (_role == "user") {
                for (var i = 0; i < _harbour_id.length; i++) {
                    // ! TEST ONLY
                    if (!userHarbours[0]) harbour_id[0] = 'SlLLJ.5utq'

                    _partners = _partners.concat(await getPartnerByHarbourId(_harbour_id[i]));
                }
            }
            else if (_role == "admin")
                _partners = await getPartnerByHarbourId(userHarbours[0].id);

            var categories = `
                <option value="harbourlife">Vie au port</option>
                <option value="experience">Experiences</option>
                <option value="discovery">Découvertes</option>
            `;
            var subcategories = {
                harbourlife: '<option value="sos">S.O.S.</option>'
                    + '<option value="maintenance">Maintenance</option>'
                    + '<option value="bricolage">Bricolage</option>'
                    + '<option value="sante">Santé</option>'
                    + '<option value="annonce">Annonce</option>'
                    + '<option value="laverie">Laverie</option>'
                    + '<option value="transport">Transport</option>'
                    + '<option value="alimentation">Alimentation</option>'
                    + '<option value="boutique">Boutique</option>'
                    + '<option value="vendeurLoueurHl">Vendeur / Loueur</option>'
                    + '<option value="vieportautre">Autre</option>',
                experience: '<option value="nautic">Activités nautiques</option>'
                    + '<option value="terrestres">Activités terrestres</option>'
                    + '<option value="association">Association</option>'
                    + '<option value="equipbourse">Bourse aux équipiers</option>'
                    + '<option value="vendeurLoueurEx">Vendeur / Loueur</option>'
                    + '<option value="experienceautre">Autre</option>',
                discovery: '<option value="restaurant">Restaurants</option>'
                    + '<option value="bar">Bar</option>'
                    + '<option value="culture">Culture</option>'
                    + '<option value="divertissement">Loisirs</option>'
                    + '<option value="detente">Détente</option>'
                    + '<option value="decouverteautre">Autre</option>',
            };

            var _partnerGen = "";
            for (var i = 0; i < _partners.length; i++) {
                var currentHarbour = await STORE.harbourmgmt.getHarbourById(_partners[i].harbour_id);
                _partnerGen += _partnerHtml.replace(/__ID__/g, _partners[i].id)
                    .replace(/__FORMID__/g, _partners[i].id.replace(/\./g, "_"))
                    .replace(/__HARBOUR_NAME__/g, currentHarbour.name)
                    .replace(/__HARBOUR_ID__/g, currentHarbour.id)
                    .replace(/__CATEGORY__/g, categories)
                    .replace(`option value="${_partners[i].category}"`, `option value=${_partners[i].category} selected`)
                    .replace(/__SUBCATEGORY__/g, subcategories[_partners[i].category])
                    .replace(`option value="${_partners[i].subcategory}"`, `option value=${_partners[i].subcategory} selected`)
                    .replace(/__NAME__/g, _partners[i].name)
                    .replace(/__EDITOR_ID__/g, "editor_" + _partners[i].id.replace(/\./g, "_"))
                    .replace(/__DESCRIPTION__/g, _partners[i].description)
                    .replace(/__EMAIL__/g, _partners[i].email)
                    .replace(/__PREFIX__/g, _partners[i].prefix)
                    .replace(/__PHONE__/g, _partners[i].phone)
                    .replace(/__IMG__/g, _partners[i].img)
                    .replace(/__WEBSITE__/g, _partners[i].website)
                    .replace(/__ADDRESS__/g, _partners[i].address)
            }
            _indexHtml = _indexHtml.replace("__PARTNERS__", _partnerGen).replace(/undefined/g, '');



            res.setHeader("Content-Type", "text/html");
            res.end(_indexHtml);
            return;
        }
    }
}