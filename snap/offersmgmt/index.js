
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

async function getAdminById(_id) {
	return new Promise(resolve => {
		STORE.db.linkdbfp.FindById('user', _id, null, function (_err, _data) {
			if (_data)
				resolve(_data);
			else
				resolve(_err);
		});
	});
}

const serveIndexPageHandler = async (req, res) => {
	try {
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
			userHarbours = await STORE.API_NEXT.getElements(ENUMS.TABLES.HARBOURS, {});
			userHarbours = userHarbours.sort((a, b) => a.name > b.name ? 1 : -1);
		} else if (adminUser.role === 'user') {
			const userHabourIds = adminUser.data.harbour_id;
			const promises = [];
			userHabourIds.map(harbourId => {
				promises.push(STORE.API_NEXT.getElements(ENUMS.TABLES.HARBOURS, { id: harbourId }));
			});
			const [harbours] = await Promise.all(promises);
			userHarbours.push(...harbours);
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

exports.plugin = {
	handler: serveIndexPageHandler,
}

const getOfferByIdHandler = async (req, res) => {
	try {
		const offerId = req.param.offerId
		const offer = await findOffers({ id: offerId });
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

/**
 * 
 * @param {*} searchOpt 
 * @returns {Promise<TYPES.T_offer[]>}
 */
const findOffers = async (searchOpt) => {
	/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
	const DB_NS = SCHEMA.NAUTICSPOT;

	console.log('Find offers params', searchOpt);
	const findOffersResp = await DB_NS.offers.find(searchOpt, { raw: 1 });
	if (findOffersResp.error) {
		throw new Error(findOffersResp.message, { cause: findOffersResp });
	}

	const offers = findOffersResp.data;
	console.log(`Number of offers found: `, offers.length);
	return offers;
};

const getOffersByHarbourIdHandler = async (req, res) => {
	try {
		console.log('=====getOffersByHarbourIdHandler=====')

		const harbourId = req.param.harbourId
		const offers = await findOffers({ harbour_id: harbourId });
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

const CLOUDINARY_PATH = '/Nauticspot-Next';
const createOfferHandler = async (req, res) => {
	console.log('===== OFFERS - createOfferHandler=====')
	try {
		/**@type {TYPES.T_SCHEMA['NAUTICSPOT']} */
		const DB_NS = SCHEMA.NAUTICSPOT;
		// ! AUTH WILL COME ONE DAY
		// console.log('req.headers', req.headers);
		// console.log('req.userCookie', req.userCookie);
		const newOffer = {
			created_at: new Date().toLocaleString(),
			title: req.body?.title || null,
			description: req.body?.description || null,
			content: req.body?.content || null,
			date_start: req.body?.date_start || null,
			date_end: req.body?.date_end || null,
			img: req.body?.img || null,
			pjName: req.body?.pjName || null,
			pj: req.body?.pj || null,
			harbour_id: req.body?.harbour_id || null,
		}

		if (newOffer.img) {
			const opt = {
				cloudinaryPath: `${CLOUDINARY_PATH}/offers-images`,
				isFileNameUsed: true,
			}
			const upload = await STORE.cloudinary.uploadFile(newOffer.img, req.field["img"].filename, opt);
			console.log(upload);
			newOffer.img = upload.secure_url;
			newOffer.cloudinary_img_public_id = upload.public_id;
		}

		if (newOffer.pj) {
			const opt = {
				cloudinaryPath: `${CLOUDINARY_PATH}/offers-attachments`,
				isFileNameUsed: true,
			};
			if (!newOffer.pjName) newOffer.pjName = req.field["pj"].filename;
			var upload = await STORE.cloudinary.uploadFile(newOffer.pj, newOffer.pjName, "slug", opt);;
			newOffer.pj = upload.secure_url;
			newOffer.cloudinary_pj_public_id = upload.public_id;
		} else {
			newOffer.pjName = null;
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

		const createOfferResp = await DB_NS.offers.create(newOffer, { raw: 1 });
		if (createOfferResp.error) {
			throw new Error(createOfferResp?.message, { cause: createOfferResp });
		}
		const createdOffer = createOfferResp.data;

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
			const opt = {
				cloudinaryPath: `${CLOUDINARY_PATH}/offers-images`,
				isFileNameUsed: true,
			}
			const upload = await STORE.cloudinary.uploadFile(req.body.img, req.field["img"].filename, opt);
			offer.img = upload.secure_url;
			offer.cloudinary_img_public_id = upload.public_id;
		}

		if (req.body.pjName) {
			offer.pjName = req.body.pjName;
		}

		if (req.body.pj && !req.body.pj.includes('https://res.cloudinary.com')) {
			const opt = {
				cloudinaryPath: `${CLOUDINARY_PATH}/offers-attachments`,
				isFileNameUsed: true,
			};
			const upload = await STORE.cloudinary.uploadFile(req.body.pj, offer.pjName, opt);
			offer.pj = upload.secure_url;
			offer.cloudinary_pj_public_id = upload.public_id;
		}

		const updateOffersResp = await DB_NS.offers.update({ id: offerId }, offer, { raw: 1 });
		if (updateOffersResp.error) {
			throw new Error(updateOffersResp?.message, { cause: updateOffersResp });
		}
		const updatedOffers = updateOffersResp.data;

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

		const deleteOffersResp = await DB_NS.offers.delete({ id: offerId });
		if (deleteOffersResp.error) {
			throw new Error(deleteOffersResp?.message, { cause: deleteOffersResp });
		}
		const deletedOffers = deleteOffersResp.data;

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