
const TYPES = require('../../types');
const ENUMS = require('../lib-js/enums');
const myLogger = require('../lib-js/myLogger');

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
		const adminUserId = req.userCookie.data.id;
		const adminUser = await getAdminById(adminUserId);
		if (!adminUser) {
			res.writeHead(401, 'Not Authorized', { 'Content-Type': 'application/json' });
			res.end('Not Authorized');
		}

		// get harbours according to user role
		/**@type {Array<TYPES.T_harbour>} */
		let userHarbours = [];
		if (adminUser.role === 'admin') {
			userHarbours = await STORE.API_NEXT.getElements(ENUMS.TABLES.HARBOURS, {});
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
		myLogger.logError(error, { module: 'XXXmgmt' })
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
		const userCookie = req.userCookie;
		console.log('userCookie', userCookie);

		console.log('req.param', req.param)
		const offerId = req.param.offerId

		let offer = await STORE.API_NEXT.getElements(ENUMS.TABLES.OFFERS, { id: offerId });
		console.log('offer', offer);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: offer.length,
			offer: offer,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'XXXmgmt' })
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
		const userCookie = req.userCookie;
		// console.log('userCookie', userCookie);

		// console.log('req.param', req.param)
		const harbourId = req.param.harbourId

		let offers = await STORE.API_NEXT.getElements(ENUMS.TABLES.OFFERS, { harbour_id: harbourId });
		// console.log('offers', offers);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			count: offers.length,
			offers: offers,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'XXXmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const createOfferHandler = async (req, res) => {
	try {
		console.log('createOfferHandler');
		// console.log('req.body', req.body);
		// console.log('req.FIELD', req.field)

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
			harbour_id: req.body?.harbour_id || null,
		}

		if (newOffer.img) {
			const upload = await STORE.cloudinary.uploadFile(newOffer.img, req.field["img"].filename);
			console.log(upload);
			newOffer.img = upload.secure_url;
			newOffer.cloudinary_img_public_id = upload.public_id;
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

		let offer = await STORE.API_NEXT.createElement(ENUMS.TABLES.OFFERS, newOffer);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: offer,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'XXXmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const updateOfferHandler = async (req, res) => {
	try {
		console.log('updateOfferHandler');

		// console.log('\n========req.field=========\n', req.field);
		// console.log('\n========req.param=========\n', req.param);
		// console.log('\n========req.body=========\n', req.body);
		const { offerId } = req.param
		// console.log('offerId', offerId);

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
			const upload = await STORE.cloudinary.uploadFile(req.body.img, req.field["img"].filename);
			console.log(upload);
			offer.img = upload.secure_url;
			offer.cloudinary_img_public_id = upload.public_id;
		}
		const updatedObj = await STORE.API_NEXT.updateElement(ENUMS.TABLES.OFFERS, { id: offerId }, offer);
		console.log('updatedObj', updatedObj);

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: updatedObj,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'XXXmgmt' })
		const errorHttpCode = error.cause?.httpCode || 500;
		res.writeHead(errorHttpCode, '', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: false,
			error: error.toString(),
		}));
	}
};

const deleteOfferHandler = async (req, res) => {
	try {
		console.log('req.param', req.param);
		const { offerId } = req.param;

		let deletedObj = await STORE.API_NEXT.deleteElement(ENUMS.TABLES.OFFERS, { id: offerId });

		res.writeHead(200, 'Success', { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({
			success: true,
			offer: deletedObj,
		}));
	} catch (error) {
		console.error('[ERROR]', error);
		myLogger.logError(error, { module: 'XXXmgmt' })
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