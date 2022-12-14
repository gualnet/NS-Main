const TYPES = require('../../types');
const ENUM = require('../lib-js/enums');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');
const {errorHandler} = require('../lib-js/errorHandler');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

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
    // if (!_req.post.date_end) {
    //     UTILS.httpUtil.dataError(_req, _res, "Error", "Date de fin requis", "100", "1.0");
    //     return false;
    // }
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

const getEventv2 = async (searchOpt) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const findEventsResp = await DB_NS.events.find(searchOpt, { raw: 1 });
	console.log('findEventsResp', findEventsResp);
	if (findEventsResp.error) {
		console.error(findEventsResp);
		throw new Error(findEventsResp.message, { cause: findEventsResp });
	}

	return (findEventsResp.data);
}

async function getEvent(searchOpt) {
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

const createEventV2 = async (obj) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createEventResp = await DB_NS.events.create(obj);
	if (createEventResp.error) {
		throw new Error(createEventResp, { cause: createEventResp });
	}
	return createEventResp.data;
};

const createNewEventHandler = async (req, res) => {
	console.log('===createNewEventHandler===');
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		// CHECK IF TITLE ALREADY EXISTS
		const findEventsResp = await DB_NS.events.find({ title: req.post.title }, { raw: 1 });
		if (findEventsResp.error) {
			throw new Error(findEventsResp.message, { cause: {findEventsResp} });
		} else if (findEventsResp.data?.length > 0) {
			throw new Error("This event title already exists", { cause: { httpCode: "400" } });
		}

		/**@type {TYPES.T_event} */
		const newEvent = {
			title: req.post.title,
			description: req.post.description,
			content: req.post.content,
			img: req.post.img,
			harbour_id: req.post.harbour_id,
			category: req.post.category,
			cloudinary_img_public_id: req.post.cloudinary_img_public_id,
			date_start: req.post.date_start,
			date_end: req.post.date_end,
			created_at: new Date(Date.now()).getTime(),
			date: new Date(Date.now()).getTime(),
		}

		const createdEvent = await createEventV2(newEvent);
		console.log('createdEvent',createdEvent);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			event: createdEvent,
		}));
	} catch (error) {
		errorHandler(res, error);
	}
};

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
				{
					method: "POST",
					route: "/api/event",
					handler: createNewEventHandler,
				},
    ];

exports.plugin =
{
    title: "Gestion des événements",
    desc: "",
    handler: async (req, res) => {
				// var admin = await getAdminById(req.userCookie.data.id);
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
            else if (_role == "admin") {
							try {
								_Events = await getEventv2({});
							} catch (error) {
								console.error(error);
								UTILS.httpUtil.dataError(req, res, "Error", error, "1.0");
								return;
							}
						}


            var _eventGen = "";
            for (var i = 0; i < _Events.length; i++) {
                if (_Events[i].category == "event") {
                    _Events[i].category = "événement";
                }

                let formatedDate = '-';
                if (_Events[i].date) {
                    const dateObj = new Date(_Events[i].date)
                    const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
                    const date = splited[0]; 
                    const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
                    formatedDate = `${date} à ${heure}`;
                }

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
                    .replace(/__DATE__/g, formatedDate)
                    .replace(/__DATETIMEORDER__/g, _Events[i].date)
            }
            _indexHtml = _indexHtml.replace("__EVENTS__", _eventGen).replace(/undefined/g, '');

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