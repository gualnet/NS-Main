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
			if (info.which !== 'TEXT') {
				const headerContent = Imap.parseHeader(buffer);
				console.log(`${prefix} Parsed Header: ${inspect(headerContent)}`)
				msgData.header = headerContent;
			} else {
				const isAttachmentPart = buffer.split('Content-Disposition: attachment;').length > 1 ? true : false;
				if (isAttachmentPart) {
					const attachmentData = getBodyAttachementData(buffer);
					console.log(`${prefix} --> attachmentData filename`, attachmentData.fileName);
					msgData.fileName = attachmentData.fileName;
					msgData.content = attachmentData.content;

					// upload file on cloudi
					const filePath = path.join(__dirname, msgData?.fileName || 'noname.doc');
					console.log(prefix,'filePath', filePath);
					console.log('\nUPLOAD TO CLOUDINARY', msgData.fileName)
					const upload = await STORE.cloudinary.uploadFile(
						Buffer.from(msgData.content, 'base64'),
						msgData.fileName,
						undefined,
						{ cloudinaryPath: '/test/' },
					);
					// console.log('upload', upload)
					registerWeatherForecastLinkToHarbour(upload.secure_url, upload.public_id, msgData.header.from)
				}
			}
		});
	});
	msg.once('attributes', (attribute) => {
		console.log('\n\n------------------')
		console.log(`${prefix} Attributes ${inspect(attribute, false, 8)}`)
		console.log('------------------')
	})

	msg.on('end', async () => {
		console.log('\n------------------')
		console.log(`${prefix}-> END`);
		console.log('------------------')
		console.log('------------------\n\n')
	});
}

/**
 * @param {string} body 
 * @returns {{ fileName: string, content: string }}
 */
const getBodyAttachementData = (body) => {
	const attachementPart = body.split('Content-Disposition: attachment;')[1];
	const strArr = attachementPart.split('\r\n');
	// strArr[0]) // filename="bulletin_Port5jours_20220505.pdf";
	// strArr[1]) // size=971845; creation-date="Thu, 05 May 2022 05:01:18 GMT";
	// strArr[2]) // modification-date="Thu, 05 May 2022 06:54:01 GMT"
	// strArr[3]) // Content-ID: <97203D7240D4194697E993AFEE549C06@EURPRD10.PROD.OUTLOOK.COM>
	// strArr[4]) // Content-Transfer-Encoding: base64
	// strArr[5]) // \n
	// strArr[6]) // First line of our attachment content
	// strArr[...]) // content of our attachment
	// strArr[strArr.length -4]) // Last line of our attachement content
	const fileName = strArr[0].split('=')[1]?.replaceAll("\"", '').replace(";", '');
	const content = strArr.slice(6, (strArr.length - 3)).join('');
	return ({ fileName, content });
}

/**
 * 
 * @param {string} msgSource 
 * @returns {Promise<void>}
 */
const fetchMessage = async (msgSource) => {
	console.log('fetchMessage', msgSource);
	return (new Promise((resolve, reject) => {
		const fetchReq = connexion.seq.fetch(msgSource, {
			bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
		});
		// console.log('fetchReq', fetchReq)
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
	console.log('weatherAutoLoader');
	try {
		// initialiseImapConnection();

		// const boxes = await getBoxes();
		// console.log('BOXES', boxes)
		// console.log('INBOX', boxes['INBOX'].children)

		await fetchMessage('1:*');

		res.end(JSON.stringify({ success: true }));
	} catch (err) {
		console.error('[ERROR]', err);
		res.writeHead(500);
		res.end(JSON.stringify(err));
	}
}

const domainTable = {
	"portlanapoule.com": 'ElFV4x2R7Y',
}

const registerWeatherForecastLinkToHarbour = async (secureUrl, publicId, emailStr) => {
	console.log('registerWeatherForecastLinkToHarbour')
	console.log('secureUrl', secureUrl);
	console.log('publicId', publicId);
	console.log('emailStr', emailStr);
	// extract email
	let emailDomain = emailStr[0].split('@')[1].replace('>', '');
	console.log('001 -> emailDomain', emailDomain);


	/**@type {Array<TYPES.T_harbour>} */
	const [harbour] = await STORE.harbourmgmt.getHarboursWhere({ id: domainTable[emailDomain] });
	if (!harbour) {
		console.log('[ERROR] NO harbour found')
		return
	}
	console.log('[INFO] harbour found', harbour.name);
	const date = new Date();
	/**@type {TYPES.T_weather} */
	const newWeatherObj = {
		harbour_id: harbour.id,
		title: `Météo du ${date.getDate()}`,
		img: secureUrl,
		cloudinary_img_public_id: publicId,
		date: Date.now(),
		created_at: Date.now(),
		updated_at: Date.now(),
	};
	const weather = await STORE.weathermgmt.createWeather(newWeatherObj)
	console.log('weather', weather)

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

