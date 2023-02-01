
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
	console.log('END')
	return true;
};

const uploadFileWrapper = async (fileRaw, FileName, cloudinaryPath) => {
	console.log('Upload attachment on cloudinary');
	const option = {
		isFileNameUsed: true,
		cloudinaryPath,
	}
	const upload = await STORE.cloudinary.uploadFile(fileRaw, FileName, "slug", option);
	if (upload.name === 'Error') {
		throw new Error(upload.message, { cause: upload });
	}
	console.log('Upload attachment OK\n', upload);
	return upload;
};

/* ************** */
/* DB HANDLERS V2 */

/**
 * 
 * @param {*} searchOpt 
 * @returns {Promise<TYPES.T_news[]>}
 */
const getNewsV2 = async (searchOpt) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.info('[INFO] Search new with params', searchOpt);
	const findNewsResp = await DB_NS.news.find(searchOpt);
	if (findNewsResp.error) {
		throw new Error(findNewsResp.message, { cause: findNewsResp });
	}

	const news = findNewsResp.data;
	console.info('[INFO] Found', news.length, 'news.');
	return (news);
}

/**
 * 
 * @param {Partial<Omit<TYPES.T_news, "id">>} obj
 * @returns {Promise<TYPES.T_news>}
 */
const createNewsV2 = async (obj) => {
	console.log('====createNewsV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createNewsResp = await DB_NS.news.create(obj);
	if (createNewsResp.error) {
		console.error(createNewsResp);
		throw new Error(createNewsResp, { cause: createNewsResp });
	}
	const news = createNewsResp.data;
	console.log(`Created newd:`, news);
	return news;
};

/**
 * 
 * @param {Pick<TYPES.T_news, "id">} where 
 * @param {Partial<TYPES.T_news>} updates 
 * @returns {Promise<TYPES.T_news[]>}
 */
const updateNewsV2 = async (where, updates) => {
	console.log('====updateNewsV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update news where: ', where);
	console.log('Update news with: ', updates);
	const updateNewsResp = await DB_NS.news.update(where, updates);
	if (updateNewsResp.error) {
		throw new Error(updateNewsResp.message, { cause: updateNewsResp });
	}
	const news = updateNewsResp.data;
	console.log(`${news.length} new(s) Updated`);
	return news;
};

/**
 * 
 * @param {Pick<TYPES.T_news, "id">} where 
 * @returns {Promise<TYPES.T_news[]>}
 */
const deleteNewsV2 = async (where = {}) => {
	console.log('====deleteNewsV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte news where: ', where);
	const deleteNewsResp = await DB_NS.news.delete(where);
	if (deleteNewsResp.error) {
		console.error('deleteNewsResp', deleteNewsResp)
		throw new Error(deleteNewsResp.message, { cause: deleteNewsResp });
	}
	const news = deleteNewsResp.data;
	console.log(`Deleted ${news.length} new(s) items`, news);
	return news;
}

/* DB HANDLERS V2 */
/* ************** */

/* ************ */
/* API HANDLERS */

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
};

/* API HANDLERS */
/* ************ */

/* *************** */
/* PLUGIN HANDLERS */

const pluginPostCreateNewsHandler = async (req, res) => {
	try {
		if (!verifyPostReq(req, res)) {
			return;
		}
		/**@type {Omit<TYPES.T_news, "id">} */
		const newNews = {
			category: req.post.category || 'news',
			cloudinary_img_public_id: null,
			cloudinary_pj_public_id: null,
			content: req.post.content || null,
			date: Date.now(),
			description: req.post.description || null,
			harbour_id: req.post.harbour_id || null,
			img: null,
			pj: null,
			pjname: req.post.pjname || null,
			title: req.post.title || null,
		};

		//img gesture
		if (req.post.img) {
			const cloudinaryPath = `Nauticspot-Next/${newNews.harbour_id}/news-images/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newNews.img = uploadDetails.secure_url;
			newNews.cloudinary_img_public_id = uploadDetails.public_id;
		}

		//pj gesture
		if (req.post.pj) {
			const cloudinaryPath = `Nauticspot-Next/${newNews.harbour_id}/news-pj/`;
			const imgData = req.post.pj;
			const imgFilename = req.field["pj"].filename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newNews.pj = uploadDetails.secure_url;
			newNews.cloudinary_pj_public_id = uploadDetails.public_id;
		}

		const createdNews = await createNewsV2(newNews);
		console.log('createdNews', createdNews);
		if (!createdNews?.id) {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'actualité", "1.0");
			return;
		}
		UTILS.httpUtil.dataSuccess(req, res, "Success", "Actualité créée", "1.0");
	} catch (error) {
		console.error(error);
		if (error.message.includes('File size too large')) {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur: La taille de l'image dépasse la taille maximale permise.", "400", "1.0");
			return;
		} else if (error.message.includes('Invalid image file')) {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur: Le type du fichier \'image\' est invalide.", "400", "1.0");
			return;
		}

		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'actualité", "500", "1.0");
	}
};

const pluginPostUpdateNewsHandler = async (req, res) => {
	console.log('====pluginPostUpdateNewsHandler====');
	console.log('req.post', req.post);
	try {
		if (!verifyPostReq(req, res)) {
			return;
		}

		const newsId = req.post.id;
		delete req.post.id;
		const foundNews = await getNewsV2({ id: newsId });
		if (foundNews.length < 1) {
			UTILS.httpUtil.dataError(req, res, "Error", "News id not avalaible", "1.0");
		}
		const currentNew = foundNews[0];
		const newsUpdates = req.post;

		//img gesture
		if (newsUpdates.img) {
			console.log('Upload image on cloudinary');
			const cloudinaryPath = `Nauticspot-Next/${newNews.harbour_id}/news-images/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			console.log('Upload image OK\n', uploadDetails);
			newsUpdates.img = uploadDetails.secure_url;
			newsUpdates.cloudinary_img_public_id = uploadDetails.public_id;
			if (currentNew.cloudinary_img_public_id) {
				await STORE.cloudinary.deleteFile(currentNew.cloudinary_img_public_id);
			}
		}

		//pj gesture
		if (newsUpdates.pj) {
			console.log('Upload attachment on cloudinary');
			const cloudinaryPath = `Nauticspot-Next/${newNews.harbour_id}/news-pj/`;
			const imgData = req.post.pj;
			const imgFilename = req.field["pj"].filename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			console.log('Upload attachment OK\n', uploadDetails);
			newsUpdates.pj = uploadDetails.secure_url;
			newsUpdates.cloudinary_pj_public_id = uploadDetails.public_id;
			if (currentNew.cloudinary_pj_public_id) {
				await STORE.cloudinary.deleteFile(currentNew.cloudinary_pj_public_id);
			}
		}

		const [updatedNews] = await updateNewsV2({ id: newsId }, newsUpdates);
		console.log('updatedNews', updatedNews);
		if (!updatedNews?.id) {
			console.log('COUCOU 1')
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'actualité", "1.0");
			return;
		}
		UTILS.httpUtil.dataSuccess(req, res, "Success", "Actualité mise à jour", "1.0");
	} catch (error) {
		console.error(error);
		if (error.message.includes('File size too large')) {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur: La taille de l'image dépasse la taille maximale permise.", "400", "1.0");
			return;
		} else if (error.message.includes('Invalid image file')) {
			UTILS.httpUtil.dataError(req, res, "Error", "Erreur: Le type du fichier \'image\' est invalide.", "400", "1.0");
			return;
		}

		UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la création de l'actualité", "500", "1.0");
	}
};

/* PLUGIN HANDLERS */
/* *************** */

exports.handler = async (req, res) => {
	var _new = await getNewsV2({});
	res.end(JSON.stringify(_new));
	return;
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
		console.log('NEWSMGMT HANDLER')
		console.log('REQUEST METHOD: ', req.method);
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		/**@type {TYPES.T_SCHEMA['fortpress']} */
		const DB_FP = SCHEMA.fortpress;

		const findAdminResp = await DB_FP.user.find({ id: req.userCookie.data.id }, { raw: 1 });
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

		if (!verifyRoleAccess(admin?.data?.roleBackOffice, AUTHORIZED_ROLES)) {
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
			console.log('REQUEST GET PARAM: ', req.get);
			if (req.get.mode && req.get.mode == "delete" && req.get.new_id) {
				/**@type {TYPES.T_news} */
				let currentNew = {};
				try {
					const foundNews = await getNewsV2({ id: req.get.new_id });
					currentNew = foundNews[0];
					if (currentNew) {
						if (currentNew?.cloudinary_img_public_id) {
							await STORE.cloudinary.deleteFile(currentNew.cloudinary_img_public_id);
						}
						if (currentNew?.cloudinary_pj_public_id) {
							await STORE.cloudinary.deleteFile(currentNew.cloudinary_pj_public_id);
						}
						await deleteNewsV2({ id: req.get.new_id });
					}
				} catch (error) {
					console.log('[ERROR]', error);
					UTILS.httpUtil.dataError(req, res, "Error", "Erreur lors de la mise à jour de l'actualité", "1.0");
					return;
				}


			}
		}
		if (req.method == "POST") {
			if (req.post.id) {
				await pluginPostUpdateNewsHandler(req, res);
			}
			else {
				await pluginPostCreateNewsHandler(req, res);
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


			let _newGen = "";
			for (var i = 0; i < _News.length; i++) {
				if (_News[i].category === "news")
					_News[i].category = "actualité";
				else if (_News[i].category === "event")
					_News[i].category = "évennement";

				const [currentHarbour] = await STORE.harbourmgmt.getHarbours({ id: _News[i].harbour_id });
				console.log('NEWS NAME', _News[i].title, _News[i].id, _News[i].harbour_id)
				console.log('currentHarbour', currentHarbour.id)

				let formatedDate = '-';
				if (_News[i].created_at || _News[i].date) {
					const dateObj = new Date(_News[i].created_at || _News[i].date)
					const splited = dateObj.toISOString().split('T'); // => [2022-03-22]T[09:47:51.062Z]
					const date = splited[0];
					const heure = splited[1].split('.')[0]; // => [09:47:51].[062Z]
					formatedDate = `${date} à ${heure}`;
				}

				_newGen += _newHtml.replace(/__ID__/g, _News[i].id)
					.replace(/__FORMID__/g, _News[i].id.replace(/\./g, "_"))
					.replace(/__HARBOUR_NAME__/g, currentHarbour?.name)
					.replace(/__HARBOUR_ID__/g, currentHarbour?.id)
					.replace(/__CATEGORY__/g, _News[i].category)
					.replace(/__EDITOR_DESC_ID__/g, "editor_desc_" + _News[i].id.replace(/\./g, "_"))
					.replace(/__DESCRIPTION__/g, _News[i].description)
					.replace(/__EDITOR_ID__/g, "editor_" + _News[i].id.replace(/\./g, "_"))
					.replace(/__CONTENT__/g, _News[i].content)
					.replace(/__TITLE__/g, _News[i].title)
					.replace(/__PJNAME__/g, _News[i].pjname)
					.replace(/__PJ__/g, _News[i].pj)
					.replace(/__IMG__/g, _News[i].img)
					.replace(/__DATE__/g, formatedDate)
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

				const getHarbourPromises = await _harbour_id.map(harbourId => STORE.harbourmgmt.getHarbours({ id: harbourId }));
				let userHarbours = await Promise.all(getHarbourPromises);
				userHarbours = userHarbours.flat()
				userHarbours.map(userHarbour => {
					harbour_select += '<option value="' + userHarbour.id + '">' + userHarbour.name + '</option>';
				});

				harbour_select += '</select></div></div>';
			} else if (_role == "admin") {
				harbour_select = '<div class="col-12">'
					+ '<div class= "form-group" >'
					+ '<label class="form-label">Sélection du port</label>'
					+ '<select class="form-control" style="width:250px;" name="harbour_id">';
				userHarbours = await STORE.harbourmgmt.getHarbours({});
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