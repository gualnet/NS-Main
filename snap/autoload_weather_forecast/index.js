const fs = require('fs');
const path = require('path');
const Imap = require('imap'); // DOC: https://github.com/mscdex/node-imap
const { store } = require('../cloudinary');
const inspect = require('util').inspect;

const TYPES = require('../../types');

/** @type {Imap} */
let connexion;

const connectionOnReadyHandler = async () => {
	console.log('CONNEXION EVENT READY');
	try {
		const mailbox = await openBox('INBOX');
		console.log('mailbox', mailbox);
		// await fetchMessage('*');
	} catch (error) {
		console.log('[ERROR - 00]', error);
	}
};

/**
 * 
 * @param {string} message 
 */
const connectionOnAlertHandler = (message) => {
	console.log('CONNEXION EVENT ALERT');
	console.log('ALERT: ', message);

}

/**
 * 
 * @param {number} numNewMsgs 
 */
const connectionOnMailHandler = (numNewMsgs) => {
	console.log('CONNEXION EVENT ALERT');
	console.log('numNewMsgs', numNewMsgs);
}

/**
 * 
 * @param {Error} err 
 */
const connectionOnErrorHandler = (err) => {
	console.log('CONNEXION EVENT UPDATE');
	console.log('Error');
}

/**
 * 
 * @param {boolean} hadError 
 */
const connectionOnCloseHandler = (hadError) => {
	console.log('CONNEXION EVENT CLOSE');
}

const connectionOnEndHandler = () => {
	console.log('CONNEXION EVENT END');
}

/**
 * Async wrapper to imap getBoxes func
 * @returns {Promise<Imap.MailBoxes>}
 */
const getBoxes = async () => {
	console.log('getMailboxNames');
	return (new Promise((resolve, reject) => {
		connexion.getBoxes('', (err, boxes) => {
			if (err) {
				reject(err);
			} else {
				resolve(boxes);
			}
		})
	}))
};

/**
 * Async wrapper to imap openBox func
 * @param {string} boxName 
 * @returns {Promise<Imap.Box>}
 */
const openBox = async (boxName) => {
	console.log('openBox');
	return (new Promise((resolve, reject) => {
		connexion.openBox(boxName, (err, mailbox) => {
			if (err) {
				reject(err);
			} else {
				resolve(mailbox);
			}
		})
	}))
};

/**
 * 
 * @param {Imap.ImapMessage} msg 
 * @param {number} seqno 
 */
const fetchOnMessageHandler = (msg, seqno) => {
	const msgData = {};
	const prefix = `(#${seqno})`;
	console.log('Message seqno', seqno);

	// Message body event handler
	msg.on('body', (stream, info) => {
		// console.log('Message info', info)
		let buffer = '';
		stream.on('data', (chunk) => {
			buffer += chunk.toString('utf8');
		});
		stream.once('end', async () => {
			// console.log('Message END')
			if (info.which !== 'TEXT') {
				// Get the details of the email (From, To, Subjectm, Date)
				const headerContent = Imap.parseHeader(buffer);
				console.log(`${prefix} Parsed Header: ${inspect(headerContent)}`)
				msgData.header = headerContent;
			}
		});
	});
	msg.once('attributes', (attribute) => {
		// console.log('\n\n------------------')
		// console.log(`${prefix} Attributes ${inspect(attribute, false, 8)}`)
		// console.log('------------------')
		// Find attachements details in email attributes
		const attachments = findAttachmentParts(attribute.struct);
		console.log(`${prefix} found ${attachments.length} attachment(s)`)

		attachments.map(attachment => {
			if (!attachment.params?.name?.toLowerCase().includes('anglais')
			&& !attachment.params?.name?.toLowerCase().includes('italien')) {
				console.log(prefix + 'Fetching attachment %s', attachment.params.name);
				const f = connexion.fetch(attribute.uid, {
					bodies: [attachment.partID],
					struct: true,
				});
				//build function to process attachment message
				f.on('message', buildAttMessageFunction(attachment, msgData));
			} else {
				console.log(prefix + 'Skip attachment %s', attachment.params.name);
			}
		})
	});

	msg.on('end', async () => {
		console.log('\n------------------')
		console.log(`${prefix}-> END`);
		console.log('------------------\n\n')
	});
}

function findAttachmentParts(struct, attachments) {
	attachments = attachments || [];
	for (var i = 0, len = struct.length, r; i < len; ++i) {
		if (Array.isArray(struct[i])) {
			findAttachmentParts(struct[i], attachments);
		} else {
			if (struct[i].disposition && ['inline', 'attachment'].indexOf(struct[i].disposition.type.toLowerCase()) > -1) {
				attachments.push(struct[i]);
			}
		}
	}
	return attachments;
};

function buildAttMessageFunction(attachment, msgData) {
	const filename = attachment.params.name;
	const encoding = attachment.encoding;
	const header = msgData.header;

	return function (msg, seqno) {
		var prefix = '(#' + seqno + ') ';
		msg.on('body', async function (stream, info) {

			let buffer = '';
			stream.on('data', (chunk) => {
				buffer += chunk.toString('utf8');
			});
			stream.on('end', async () => {
				// upload file on cloudi
				console.log('\nUPLOAD TO CLOUDINARY', filename)
				const upload = await STORE.cloudinary.uploadFile(
					Buffer.from(buffer, encoding),
					filename,
					undefined,
					{
						cloudinaryPath: '/Nauticspot-Next/auto-weather-forecast',
						isFileNameUsed: true,
						// eraseLocal
					},
				);
				// console.log('upload',upload)
				registerWeatherForecastLinkToHarbour(upload.secure_url, upload.public_id, header);
			})
		});
		msg.once('end', function () {
			console.log(`${prefix} Attachment downloaded: ${filename}`);
		});
	};
};

/**
 * 
 * @param {string} msgSource 
 * @returns {Promise<void>}
 */
const fetchMessage = async (msgSource) => {
	return (new Promise((resolve, reject) => {
		const fetchReq = connexion.seq.fetch(msgSource, {
			bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
			struct: true,
		});
		fetchReq.addListener('message', fetchOnMessageHandler)
		fetchReq.addListener('error', (err) => {
			console.log('[ERROR - FETCH]', err);
			reject(err);
		})
		fetchReq.addListener('end', () => {
			resolve('fetch messages ended');
			connexion.seq.move(msgSource, 'INBOX/done', (err) => {
				console.log('[ERROR] MESSAGE MOVE', err);
			})
		})
	}))
};

const initialiseImapConnection = () => {
	console.log('initialiseImapConnection');

	// Create an imap connector
	const imap = new Imap({
		user: 'meteo@nauticspot.fr',
		password: 'N@uticspot21',
		host: 'imap.ionos.fr',
		port: 993,
		tls: true,
	});

	// subscibe event handlers
	imap.once('ready', connectionOnReadyHandler);
	imap.once('alert', connectionOnAlertHandler);
	imap.once('mail', connectionOnMailHandler);
	imap.once('expunge', (seqno) => {
		console.log('CONNEXION EVENT EXPUNGE', seqno);
	});
	imap.once('uidvalidity', (uidvalidity) => {
		console.log('CONNEXION EVENT UI VALIDITY');
	});
	imap.once('update', (seqno, info) => {
		console.log('CONNEXION EVENT UPDATE', seqno);
		console.log('[UPDATE]', info);
	});
	imap.once('error', connectionOnErrorHandler);
	imap.once('close', connectionOnCloseHandler);
	imap.once('end', connectionOnEndHandler);

	// init connection
	console.log('try open connection');
	imap.connect()
	return (imap);
}

const weatherAutoLoader = async (req, res) => {
	console.log('ENDPOINT [/api/weather/loader] => weatherAutoLoader');
	try {
		// initialiseImapConnection();
		// const boxes = await getBoxes();
		// console.log('BOXES', boxes);
		// console.log('INBOX', boxes['INBOX'].children);

		await fetchMessage('1:*');

		res.end(JSON.stringify({ success: true }));
	} catch (err) {
		console.error('[ERROR]', err);
		res.writeHead(500);
		res.end(JSON.stringify(err));
	}
}

const HEADER_TABLE = [ // From
	[ 'SPL PORTS DE MENTON', ['EgiqgIFh7K', 'Nxs1tMY37Y'] ],
	[ 'PORT DE PLAISANCE DE GRUISSAN', ['4e2cd2p6mt'] ],
	[ 'PORT LA NAPOULE CAPITAINERIE', ['ElFV4x2R7Y'] ],
	[ 'PORT CARNON', ['Nx6KHMP2mY'] ],
	[ 'REGIE DU PORT LEUCATE', ['EgDGCtXVVK'] ],
	[ 'Météo France Produits  <production.sud-est@meteo.fr>', ['BxqaMWYBqc'] ],
]

const registerWeatherForecastLinkToHarbour = async (secureUrl, publicId, emailHeaders) => {
	const emailFrom = emailHeaders.from[0];
	const emailTo = emailHeaders.to[0];
	// extract email
	/**@type {Array<TYPES.T_harbour['id']>} */
	let harbourId = undefined;
	HEADER_TABLE.map(entries => {
		if (emailFrom.includes(entries[0])) {
			harbourId = entries[1];
			console.log('MATCH', emailFrom, 'From', harbourId);
		}
		if (!harbourId && emailTo.includes(entries[0])) {
			harbourId = entries[1];
			console.log('MATCH', emailTo, 'To', harbourId);
		}
	})

	if (!harbourId) {
		console.log('[ERROR] NO harbour found',emailHeaders)
		return
	}
	try {
		/**@type {Array<Promise<TYPES.T_harbour>>} */
		const promises = [];
		harbourId.map(harbourId => {
			const date = new Date();
			/**@type {TYPES.T_weather} */
			const newWeatherObj = {
				harbour_id: harbourId,
				title: `Météo du ${date.toLocaleDateString().split('-').reverse().join('-')}`,
				img: secureUrl,
				cloudinary_img_public_id: publicId,
				date: Date.now(),
				created_at: Date.now(),
				updated_at: Date.now(),
			};
			promises.push(STORE.weathermgmt.createWeather(newWeatherObj));
		})
		const results = await Promise.all(promises);
		console.log('Weather object created:',results);
	} catch (error) {
		console.log('[ERROR]', error)
	}
}

exports.onLoad = () => {
	console.log('SNAP LOADED');
	connexion = initialiseImapConnection();
}
exports.onExit = () => {
	console.log('SNAP WILL EXIT');
	console.log('[INFO] Close IMAP connection')
	connexion.end();
}

exports.setup = {
	on: true,
	title: 'Auto Load Weather Forecast',
	description: 'Check the weather forcast mail box and upload the forecast for the targeted harbour',
	version: '0.0.0.a',
	api: true,
}

exports.handler = async (req, res) => {
	res.end('-= Auto Load Weather Forecast =-');
}

exports.router = [{
	on: true,
	route: "/api/weather/loader",
	method: "GET",
	handler: weatherAutoLoader,
}];
