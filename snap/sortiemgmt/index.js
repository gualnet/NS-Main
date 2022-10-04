const ENUM = require('../lib-js/enums');
const TYPES = require('../../types');
const { verifyRoleAccess } = require('../lib-js/verify');
const myLogger = require('../lib-js/myLogger');
const { errorHandler } = require('../lib-js/errorHandler');
const axios = require('axios');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

var _sortieCol = "sorties";
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
    if (!_req.post.category == "sorties" || !_req.post.category == "sortie") {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Catégorie invalide", "100", "1.0");
        return false;
    }
    if (_req.post.pj && !_req.post.pjname || _req.post.pjname.length < 1) {
        UTILS.httpUtil.dataError(_req, _res, "Error", "Nom de la pièce jointe requise", "100", "1.0");
        return false;
    }*/
    return true;
}

_sortieCol = "sortie";
async function getSortie() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, {}, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function createSortie(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Create(_sortieCol, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function updateSortie(_obj) {
    return new Promise(resolve => {
        STORE.db.linkdb.Update(_sortieCol, { id: _obj.id }, _obj, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieByHarbourId(_harbour_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { harbour_id: _harbour_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieByPlaceId(_place_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { place_id: _place_id }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieByPlaceIdAndEntre(_place_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { place_id: _place_id, entre: "empty" }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieById(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.FindById(_sortieCol, _id, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function delSortie(_id) {
    return new Promise(resolve => {
        STORE.db.linkdb.Delete(_sortieCol, { id: _id }, function (_err, _data) {
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

async function getChallenge() {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { challenge: true }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}

async function getChallengeSameDay(_place_id, _day, _month, _year) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, { place_id: _place_id, day: _day, month: _month, year:_year, challenge: true }, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
async function getSortieQuery(_query) {
    return new Promise(resolve => {
        STORE.db.linkdb.Find(_sortieCol, _query, null, function (_err, _data) {
            if (_data)
                resolve(_data);
            else
                resolve(_err);
        });
    });
}
exports.handler = async (req, res) => {
    var _sortie = await getSortie();
    res.end(JSON.stringify(_sortie));
    return;
}

// -----------------------
/**
 * 
 * @returns {Promise<Array<TYPES.T_ias_outing>>}
 */
const fetchOutigsDataFromIAS = async () => {
	const IAS_USER_TOKEN = OPTION.IAS_REQUEST_TOKEN;
	if (!IAS_USER_TOKEN) {
		throw new Error('No IAS USER TOKEN provided', {
			cause: {
				httpCode: 401,
				publicMsg: 'Unauthorized',
			}
		});
	}
	console.log('IAS_USER_TOKEN', IAS_USER_TOKEN);

	const portId = '1';
	const year = '2022';
	const searchBy = 'boat';
	const url = `https://api.nauticspot.io/fr/harbours/${portId}/activity-log-summaries?year=${year}&by=${searchBy}&`;
	const headers = {
		'X-Auth-Token': IAS_USER_TOKEN,
	};

	const response = await axios.get(url, { headers });
	return(response.data)
}

const fetchOutingsDetailsByBoatFromIAS = async (iasBoatId) => {
	const IAS_USER_TOKEN = OPTION.IAS_REQUEST_TOKEN;
	if (!IAS_USER_TOKEN) {
		throw new Error('No IAS USER TOKEN provided', {
			cause: {
				httpCode: 401,
				publicMsg: 'Unauthorized',
			}
		});
	}

	const portId = '1';
	const year = '2022';
	const url = `https://api.nauticspot.io/fr/harbours/${portId}/boats/${iasBoatId}/cavalaire-challenge-logs?year=${year}`;
	const headers = {
		'X-Auth-Token': IAS_USER_TOKEN,
	};

	const response = await axios.get(url, { headers });
	return(response.data)
}

const getIasOutigs = async (req, res) => {
	try {
		// TODO add auth function to allow only admin user
		const results = await fetchOutigsDataFromIAS();

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: results.length,
			sorties: results,
		}));
	} catch (error) {
		errorHandler(res, error);
	}
};

const getIasChallengesByBoatId = async (req, res) => {
	try {
		let iasBoatId = req.get.iasboatid;
		const fpBoatId = req.get.fpboatid;
		if (!iasBoatId && fpBoatId) {
			/**@type {TYPES.T_boat} */
			const [boat] = await SOTRE.API_NEXT.getElements(ENUM.TABLES.BOATS, { id: fpboatid });
			if (!boat) throw new Error(`Boat id [${fpboatid}]`, { cause: {
				publicMsg: 'Error bateau introuvable',
			}})
			if (!boat.ias_id) throw new Error(`Boat id [${fpboatid}] doesn't have a valide ias id [${boat.ias_id}]`, { cause: {
				publicMsg: 'Error bateau introuvable',
			}})
			iasBoatId = boat.ias_id;
		}
		const results = await fetchOutingsDetailsByBoatFromIAS(iasBoatId);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: results.length,
			sorties: results,
		}));
	} catch (error) {
		errorHandler(res, error);
	}
};

const getIasChallengesByUserId = async (req, res) => {
	try {
		const userId = req.get.userid;
		/**@type {TYPES.T_user[]} */
		const [user] = await STORE.API_NEXT.getElements(ENUM.TABLES.USERS, { id: userId });
		if (!user || !user.boat_id) throw new Error('User or user\'s boat id not found');
		/**@type {TYPES.T_boat[]} */
		const [boat] = await STORE.API_NEXT.getElements(ENUM.TABLES.BOATS, { id: user.boat_id });
		if (!boat || !boat.ias_id) throw new Error('Boat or ias boat id not found');
		const iasBoatId = boat.ias_id;
		const results = await fetchOutingsDetailsByBoatFromIAS(iasBoatId);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			count: results.length,
			sorties: results,
		}));
	} catch (error) {
		errorHandler(res, error);
	}
};

// -----------------------

async function getSortieHandler(req, res) {
    var _data = await getSortieById(req.get.id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}

async function getSortiesByHarbourIdHandler(req, res) {
    var _data = await getSortiesByHarbourId(req.param.harbour_id);
    if (typeof (_data) != "string") {
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
    }
    else {
        UTILS.httpUtil.dataError(req, res, "Error", _data, "100", "1.0");
        return;
    }
}
async function getChallengeHandler(req, res) {
    var _data = await getChallenge();
        UTILS.httpUtil.dataSuccess(req, res, "success", _data, "1.0");
        return;
}

async function getSortieUserHandler(req, res) {
	const userToken = req.param.userToken;
	try {
		if (userToken) {
			// Get user
			/** @type {Array<TYPES.T_user>} */
			const users = await STORE.API_NEXT.getElements('user', { token: userToken });
			const user = users[0];
			if (!user) {
				res.writeHead(403, 'Forbidden', { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({
					success: false,
					error: 'Invalid token',
				}));
				return;
			}

			// Get sorties
			/** @type {Array<TYPES.T_sortie>} */
			const sorties = await STORE.API_NEXT.getElements('sorties', { boat_id: user.boat_id });
			const validSorties = [];
			sorties.map(sortie => {
				const startDate = sortie.datetime_out;
				const challengeStartDate = new Date('01/01/2022').getTime();
				const challengeEndDate = new Date('04/15/2022').getTime();
				const challengeStartDate2 = new Date('10/10/2022').getTime();
				const challengeEndDate2 = new Date('12/31/2022').getTime();
				if (challengeStartDate < startDate && challengeEndDate > startDate) {
					validSorties.push(sortie);
				}
				if (challengeStartDate2 < startDate && challengeEndDate2 > startDate) {
					validSorties.push(sortie);
				}
			});
			res.end(JSON.stringify({
				success: true,
				count: validSorties.length,
				sorties: validSorties,
			}));
			
		}
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'sortiemgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

async function navilyHandler(req, res) {
    var promise = await UTILS.httpsUtil.httpReqPromise({
        "host": "www.navily.com",
        "path": "/fr/resaweb?port_id=" + req.get.port_id + "&customer_id=2063604034",
        "method": "GET"
    });
    var _data = await getChallenge();
    res.end(promise.data);
    return;

}

exports.router =
    [
        {
            route: "/api/sortie/",
            handler: getSortieHandler,
            method: "GET",
        },
        {
            route: "/api/sorties/:harbour_id",
            handler: getSortiesByHarbourIdHandler,
            method: "GET",
        },
        {
            route: "/api/challenges",
            handler: getChallengeHandler,
            method: "GET",
        },
        {
            route: "/api/sortie/:userToken",
            handler: getSortieUserHandler,
            method: "GET",
        },
        {
            route: "/api/navily",
            handler: navilyHandler,
            method: "GET"
        },
				{
					route: "/api/ias/sorties",
					handler: getIasOutigs,
					method: "GET"
				},
				{
					route: "/api/ias/challenges/boat",
					handler: getIasChallengesByBoatId,
					method: "GET"
				},
				{
					route: "/api/ias/challenges/user",
					handler: getIasChallengesByUserId,
					method: "GET"
				},
    ];

function dateDiffToString(a, b){

    // make checks to make sure a and b are not null
    // and that they are date | integers types

    diff = Math.abs(a - b);

    ms = diff % 1000;
    diff = (diff - ms) / 1000
    ss = diff % 60;
    diff = (diff - ss) / 60
    mm = diff % 60;
    diff = (diff - mm) / 60
    hh = diff % 24;
    days = (diff - hh) / 24

    return days + " jours et " + hh+":"+mm+":"+ss;

}


exports.plugin =
{
    title: "Gestion des sorties",
    desc: "",
    handler: async (req, res) => {
				var admin = await getAdminById(req.userCookie.data.id);
        var _role = admin.role;
        var _type = admin.data.type;
        var _entity_id = admin.data.entity_id;
        var _harbour_id = admin.data.harbour_id;

				if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)){
					res.writeHead(401);
					res.end('Accès non autorisé');
					return;
				}
				const CAVALAIRE_ENTITY_ID = 'ElzMVUL9DK'
				if (admin?.data?.roleBackOffice !== ROLES.SUPER_ADMIN && _entity_id !== CAVALAIRE_ENTITY_ID) {
					res.writeHead(401);
					res.end('Accès non autorisé');
					return;
				}

        if (req.method == "GET") {
            if (req.get.mode && req.get.mode == "delete" && req.get.sortie_id) {
                var currentSortie = await getSortieById(req.post.id);
                await delSortie(req.get.sortie_id);
            }
            else if (req.get.sortie_id) {
                await getSortieById(req.get.sortie_id);
            }
        }
        if (req.method == "POST") {
            if (req.post.id) {
                if (verifyPostReq(req, res)) {
                    var currentSortie = await getSortieById(req.post.id);
                    var _FD = req.post;
                    var sortie = await updateSortie(_FD);
                    //console.log(sortie);
                    if (sortie[0].id) {
                        UTILS.httpUtil.dataSuccess(req, res, "Success", "événement mis à jour", "1.0");
                        return;
                    } else {
                        UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'événement", "1.0");
                        return;
                    }
                }
            }
            res.end();
            return;

        }
        else {
					/**@type {string} */
					const indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
					res.setHeader("Content-Type", "text/html");
					res.end(indexHtml);
					return;
        }
    }
}
exports.store =
{
    getSortieByPlaceId: getSortieByPlaceId,
    createSortie: createSortie,
    updateSortie: updateSortie,
    getSortieByPlaceIdAndEntre: getSortieByPlaceIdAndEntre,
    getChallengeSameDay: getChallengeSameDay
}