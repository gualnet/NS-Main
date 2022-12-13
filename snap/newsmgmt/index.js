
const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

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

/**
 * 
 * @param {*} searchOpt 
 * @returns {Promise<TYPES.T_news[]>}
 */
async function getNewsV2(searchOpt) {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.info('[INFO] Search new with params', searchOpt);
	const findNewsResp = await DB_NS.news.find(searchOpt, { raw: 1 });
	if (findNewsResp.error) {
		throw new Error(findNewsResp.message, { cause: findNewsResp });
	}

	const news = findNewsResp.data;
	console.info('[INFO] Found', news.length, 'news.');
	return(news);
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
    var _new = await getNewsV2({});
    res.end(JSON.stringify(_new));
    return;
}

async function getNewHandler(req, res) {
	try {
		const news = await getNewsV2({ id: req.param.news_id });
		UTILS.httpUtil.dataSuccess(req, res, "success", news[0], "1.0");
		return;
	} catch (error) {
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la recuperation des actualités", "100", "1.0");
	}
}

async function getNewsByHarbourIdHandler(req, res) {
	try {
		const news = await getNewsV2({ harbour_id: req.param.harbour_id });
		UTILS.httpUtil.dataSuccess(req, res, "success", news, "1.0");
		return;
	} catch (error) {
		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la recuperation des actualités", "100", "1.0");
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
			/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
			const DB_NS = SCHEMA.NAUTICSPOT;
			/**@type {TYPES.T_SCHEMA['fortpress']} */
			const DB_FP = SCHEMA.fortpress;

			const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: true });
			if (findAdminResp.error) {
				console.error(findAdminResp.error);
				res.writeHead(500);
				res.end('Internal Error');
				return;
			} else if (findAdminResp.data.length < 1) {
				console.error('No dashboard user found');
				res.writeHead(401);
				res.end('Accès non autorisé');
				return;
			}
			const admin = findAdminResp.data[0];

        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

				if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)){
					res.writeHead(401);
					res.end('Accès non autorisé');
					return;
				}
				if (_entity_id === 'SlEgXL3EGoi') { // No Access for Marigot users
					res.writeHead(401);
					res.end('Accès non autorisé');
					return;
				}

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.new_id) {
							/**@type {TYPES.T_news} */
							let currentNew = {};
							try {
								const foundNews = await getNewsV2({ id: req.post.id });
								currentNew = foundNews[0];
							} catch (error) {
								UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'actualité", "1.0");
								return;
							}

                if (currentNew.cloudinary_img_public_id) {
                    await STORE.cloudinary.deleteFile(currentNew.cloudinary_img_public_id);
                }
                if (currentNew.cloudinary_pj_public_id) {
                    await STORE.cloudinary.deleteFile(currentNew.cloudinary_pj_public_id);
                }
                await delNew(req.get.new_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
									/**@type {TYPES.T_news} */
									let currentNew = {};
									try {
										const foundNews = await getNewsV2({ id: req.post.id });
										currentNew = foundNews[0];
									} catch (error) {
										UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'actualité", "1.0");
										return;
									}

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

						try {
							if (_role == "user") {
								for (var i = 0; i < _harbour_id.length; i++) {
									_News = _News.concat(await getNewsV2({ harbour_id: _harbour_id[i] }));
								}
							}
							else if (_role == "admin") {
								_News = await getNewsV2({});
							}
						} catch (error) {
							console.error('[ERROR]', error);
							res.setHeader("Content-Type", "text/html");
							_indexHtml = _indexHtml
								.replace('__NEWS__', '')
								.replace('<div id="harbourError"></div>', '<div id="harbourError" class="alert alert-danger">Erreur lors de la récupération des actualités.</div>')
							res.end(_indexHtml);
							return;
						}
            

            var _newGen = "";
            for (var i = 0; i < _News.length; i++) {
                if (_News[i].category === "news")
                    _News[i].category = "actualité";
                else if (_News[i].category === "event")
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
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';

                const getHarbourPromises = await _harbour_id.map(harbour => STORE.harbourmgmt.getHarbourById(harbour))
                const userHarbours = await Promise.all(getHarbourPromises);
                userHarbours.map(userHarbour => {
                    harbour_select += '<option value="' + userHarbour.id + '">' + userHarbour.name + '</option>';
                });

                harbour_select += '</select></div></div>';
            } else if (_role == "admin") {
                harbour_select = '<div class="col-12">'
                    + '<div class= "form-group" >'
                    + '<label class="form-label">Sélection du port</label>'
                    + '<select class="form-control" style="width:250px;" name="harbour_id">';
                userHarbours = await STORE.harbourmgmt.getHarbour();
                userHarbours.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);

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
