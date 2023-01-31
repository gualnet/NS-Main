
const ENUM = require('../lib-js/enums');
const TYPES = require('../../types');
const ENUMS = require('../lib-js/enums');
const myLogger = require('../lib-js/myLogger');

const ROLES = ENUM.rolesBackOffice;
const AUTHORIZED_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.ADMIN_MULTIPORTS,
	ROLES.AGENT_SUPERVISEUR,
	ROLES.AGENT_ADMINISTRATEUR,
	ROLES.AGENT_CAPITAINERIE,
];

exports.setup = {
	on: true,
	title: 'Offres Plaisanciers',
	description: "A plugin to manage the the offers",
	version: '1.0.0',
};

exports.handler = async (req, res) => {
	res.end('Hello Snap!');
}

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
 * @returns {Promise<TYPES.T_offer[]>}
 */
const getOffersV2 = async (searchOpt) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Find offers params', searchOpt);
	const getOffersV2Resp = await DB_NS.offers.find(searchOpt);
	if (getOffersV2Resp.error) {
		throw new Error(getOffersV2Resp.message, { cause: getOffersV2Resp });
	}

	const offers = getOffersV2Resp.data;
	console.log(`Number of offers found: `, offers.length);
	return offers;
};

/**
 * 
 * @param {Partial<Omit<TYPES.T_offer, "id">>} obj
 * @returns {Promise<TYPES.T_offer>}
 */
const createOffersV2 = async (obj) => {
	console.log('====createOffersV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	const createOffersResp = await DB_NS.offers.create(obj);
	if (createOffersResp.error) {
		throw new Error(createOffersResp, { cause: createOffersResp });
	}
	const offers = createOffersResp.data;
	console.log(`Found ${offers.length} offer(s) items`);
	return offers;
};

/**
 * 
 * @param {Pick<TYPES.T_offer, "id">} where 
 * @param {Partial<TYPES.T_offer>} updates 
 * @returns {Promise<TYPES.T_offer[]>}
 */
const updateOffersV2 = async (where, updates) => {
	console.log('====updateOffersV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Update offers where: ', where);
	console.log('Update offers with: ', updates);
	const updateOffersResp = await DB_NS.offers.update(where, updates);
	if (updateOffersResp.error) {
		console.error(error);
		throw new Error(updateOffersResp.message, { cause: updateOffersResp });
	}
	const offers = updateOffersResp.data;
	console.log(`${offers.length} offer(s) Updated`);
	return offers;
};

/**
 * 
 * @param {Pick<TYPES.T_offer, "id">} where 
 * @returns {Promise<TYPES.T_offer[]>}
 */
const deleteOffersV2 = async (where = {}) => {
	console.log('====deleteOffersV2====');
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	if (Object.keys(where).length !== 1 || !where.id) {
		throw new Error('Wrong parameter: ' + where);
	}

	console.log('Delte Offers where: ', where);
	const deleteOffersResp = await DB_NS.offers.delete(where);
	if (deleteOffersResp.error) {
		console.error('deleteOffersResp', deleteOffersResp)
		throw new Error(deleteOffersResp.message, { cause: deleteOffersResp });
	}
	const offers = deleteOffersResp.data;
	console.log(`Deleted ${offers.length} offer(s) items`, offers);
	return offers;
}

/* DB HANDLERS V2 */
/* ************** */

/* ************** */
/* API HANDLERS */

const CLOUDINARY_PATH = '/Nauticspot-Next';
const createOfferHandler = async (req, res) => {
	console.log('===== OFFERS - createOfferHandler=====')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		// ! AUTH WILL COME ONE DAY
		const newOffer = {
			created_at: new Date().toLocaleString(),
			title: req.body?.title || null,
			description: req.body?.description || null,
			content: req.body?.content || null,
			date_start: req.body?.date_start || null,
			date_end: req.body?.date_end || null,
			img: null,
			pjName: req.body?.pjName || null,
			pj: null,
			harbour_id: req.body?.harbour_id || null,
		}

		if (req.post.img) {
			const cloudinaryPath = `Nauticspot-Next/${newOffer.harbour_id}/offers-images/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newOffer.img = uploadDetails.secure_url;
			newOffer.cloudinary_img_public_id = uploadDetails.public_id;
		}

		if (newOffer.pj) {
			const cloudinaryPath = `Nauticspot-Next/${newOffer.harbour_id}/offers-attachment/`;
			const imgData = req.post.img;
			const imgFilename = req.field["img"].filename;
			if (!newOffer.pjName) newOffer.pjName = imgFilename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			newOffer.pj = uploadDetails.secure_url;
			newOffer.cloudinary_pj_public_id = uploadDetails.public_id;
		}

		if (newOffer.description === '<p><br></p>') {
			newOffer.description = '';
		} else {
			newOffer.description = newOffer.description?.replaceAll('<p>', '').replaceAll('</p>', '\n');
		}
		if (newOffer.content === '<p><br></p>') {
			newOffer.content = '';
		} else {
			newOffer.content = newOffer.content?.replaceAll('<p>', '').replaceAll('</p>', '\n');
		}

		const createdOffer = await createOffersV2(newOffer);
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: createdOffer,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'offersmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const updateOfferHandler = async (req, res) => {
	console.log('===== OFFERS - updateOfferHandler=====')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const { offerId } = req.param
		const offer = {
			title: req.body.title || null,
			description: req.body.description || null,
			content: req.body.content || null,
			date_start: req.body.date_start || null,
			date_end: req.body.date_end || null,
			// img: req.body.img || null,
			updated_at: new Date().toLocaleString(),
		}


		if (req.body.img && !req.body.img.includes('https://res.cloudinary.com')) {
			const cloudinaryPath = `Nauticspot-Next/${newOffer.harbour_id}/offers-images/`;
			const imgData = req.body.img;
			const imgFilename = req.field["img"].filename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			offer.img = uploadDetails.secure_url;
			offer.cloudinary_img_public_id = uploadDetails.public_id;
		}

		if (req.body.pj && !req.body.pj.includes('https://res.cloudinary.com')) {
			const cloudinaryPath = `Nauticspot-Next/${newOffer.harbour_id}/offers-attachment/`;
			const imgData = req.body.img;
			const imgFilename = req.field["img"].filename;
			if (!newOffer.pjName) newOffer.pjName = imgFilename;
			const uploadDetails = await uploadFileWrapper(imgData, imgFilename, cloudinaryPath);
			offer.pj = uploadDetails.secure_url;
			offer.cloudinary_pj_public_id = uploadDetails.public_id;
		}

		const updatedOffers = await updateOffersV2({ id: offerId }, offer);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: updatedOffers,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'offersmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deleteOfferHandler = async (req, res) => {
	console.log('===== OFFERS - deleteOfferHandler=====')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;

		const { offerId } = req.param;

		const deletedOffers = await deleteOffersV2({ id: offerId });

		const promises = [];
		if (deletedOffers[0].cloudinary_img_public_id) {
			const filePublicId = deletedOffers[0].cloudinary_img_public_id;
			promises.push(await STORE.cloudinary.deleteFile(filePublicId));
		}
		if (deletedOffers[0].cloudinary_pj_public_id) {
			const filePublicId = deletedOffers[0].cloudinary_pj_public_id;
			promises.push(await STORE.cloudinary.deleteFile(filePublicId));
		}
		const results = await Promise.all(promises).catch(error => {
			// catch any arror from the deletion process to avoid interupting the main process
			myLogger.logError(error, { module: 'offersmgmt' });
		});
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: deletedOffers,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'offersmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
}

const getOfferByIdHandler = async (req, res) => {
	try {
		const offerId = req.param.offerId
		const offer = await getOffersV2({ id: offerId });
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: offer.length,
			offer: offer,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'offersmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const getOffersByHarbourIdHandler = async (req, res) => {
	try {
		console.log('=====getOffersByHarbourIdHandler=====')

		const harbourId = req.param.harbourId
		const offers = await getOffersV2({ harbour_id: harbourId });
		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: offers.length,
			offers: offers,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'offersmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

/* API HANDLERS */
/* ************** */

/* *************** */
/* PLUGIN HANDLERS */

const serveIndexPageHandler = async (req, res) => {
	try {
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
		const adminUser = findAdminResp.data[0];
		if (adminUser.data.entity_id === 'SlEgXL3EGoi') {
			res.writeHead(401);
			res.end('Accès non autorisé');
			return;
		}

		// get harbours according to user role
		/**@type {Array<TYPES.T_harbour>} */
		let userHarbours = [];
		if (adminUser.role === 'admin') {
			userHarbours = await STORE.harbourmgmt.getHarbours({});
			userHarbours = userHarbours.sort((a, b) => a.name > b.name ? 1 : -1);
		} else if (adminUser.role === 'user') {
			const userHabourIds = adminUser.data.harbour_id;
			const promises = [];
			userHabourIds.map(harbourId => {
				promises.push(STORE.harbourmgmt.getHarbours({ id: harbourId }));
			});
			const harbours = await Promise.all(promises);
			userHarbours.push(...harbours.flat());
		}

		let harbourSelectHtml = '';
		userHarbours.map((harbour, idx) => {
			if (idx === 0) {
				harbourSelectHtml += `<option id="opt_${harbour.id}" value="${harbour.id}" selected>${harbour.name}</option>`;
			} else {
				harbourSelectHtml += `<option id="opt_${harbour.id}" value="${harbour.id}">${harbour.name}</option>`;
			}
		});

		let indexHtml = fs.readFileSync(path.join(__dirname, "index.html")).toString();
		indexHtml = indexHtml
			.replace('__HARBOUR_SELECT_OPTIONS__', harbourSelectHtml)
			.replace('__SELECTED_HARBOUR_ID__', userHarbours[0].id || 'null');

		res.setHeader("Content-Type", "text/html");
		res.end(indexHtml);
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'offersmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

/* PLUGIN HANDLERS */
/* *************** */

exports.router = [
	{
		route: "/api/offers/:offerId",
		handler: getOfferByIdHandler,
		method: "GET",
	},
	{
		route: "/api/offers/harbour/:harbourId",
		handler: getOffersByHarbourIdHandler,
		method: "GET",
	},
	{
		route: "/api/offers",
		handler: createOfferHandler,
		method: "POST",
	},
	{
		route: "/api/offers/:offerId",
		handler: updateOfferHandler,
		method: "PUT",
	},
	{
		route: "/api/offers/:offerId",
		handler: deleteOfferHandler,
		method: "DELETE",
	},
];

exports.plugin = {
	handler: serveIndexPageHandler,
}