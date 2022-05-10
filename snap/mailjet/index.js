//"bcfc7e92566a91abaf67278f0838225f", "e23c11e01acf44a76ffeb6cfe95bc2d1"

async function sendEmail(_entityId, _toEmail, _toName, _subject, _msg) {
	var entity = await STORE.enititymgmt.getEntityById(_entityId);
	if (entity) {
		var mailjet = require("node-mailjet").connect(entity.mailjet_apikey, entity.mailjet_secretkey);
		const request = mailjet
			.post("send", { 'version': 'v3.1' })
			.request({
				"Messages": [
					{
						"From": {
							"Email": 'noreply@nauticspot.fr',
							"Name": entity.name
						},
						"To": [
							{
								"Email": _toEmail,
								"Name": _toName
							}
						],
						"Subject": _subject,
						"TextPart": _msg,
					}
				]
			})
		request
			.then((result) => {
				console.log('[MAILJET INFO]', result.body);
			})
			.catch((err) => {
				console.log('[MAILJET ERROR]', err);
			})
	}
}

async function sendHTMLEmail(_entityId, _toEmail, _toName, _subject, _msg) {
	var entity = await STORE.enititymgmt.getEntityById(_entityId);
	if (entity) {
		var mailjet = require("node-mailjet").connect(entity.mailjet_apikey, entity.mailjet_secretkey);
		const request = mailjet
			.post("send", { 'version': 'v3.1' })
			.request({
				"Messages": [
					{
						"From": {
							// "Email": entity.mailjet_mail
							"Email": 'noreply@nauticspot.fr',
							"Name": entity.name
						},
						"To": [
							{
								"Email": _toEmail,
								"Name": _toName
							}
						],
						"Subject": _subject,
						"HTMLPart": _msg,
					}
				]
			})
		request
			.then((result) => {
				console.log('[MAILJET INFO]', result.body);
			})
			.catch((err) => {
				console.log('[MAILJET ERROR]', err)
			})
	}
}

/**
 * @typedef mailerAddressDetails
 * @property {string} email
 * @property {string} name
 */
/**
 * @typedef mailerMsgDetails
 * @property {string} subject
 * @property {string || undefined} HTMLPart
 * @property {string || undefined} TextPart
 */
/**
 * Send Email - but function a little more flex
 * @param {mailerAddressDetails} fromDetails 
 * @param {mailerAddressDetails} toDetails 
 * @param {mailerMsgDetails} msgDetails
 */
const sendMailRaw = async (fromDetails, toDetails, msgDetails) => {
	if (!toDetails.email || !toDetails.name) throw new Error('Invalide toDetails params');

	const API_KEY = OPTION.MAILJET_API_KEY;
	const SECRET_KEY = OPTION.MAILJET_SECRET_KEY;

	const mailjet = require('node-mailjet');
	const mailer = mailjet.connect(API_KEY, SECRET_KEY);

	const response = await mailer
		.post("send", { version: 'v3.1' })
		.request({
			"Messages": [{
				"From": {
					"Email": fromDetails?.email || OPTION.MAILJET_SENDER_EMAIL,
					"Name": fromDetails?.name || 'Nauticspot',
				},
				"To": [{
					"Email": toDetails.email,
					"Name": toDetails.name,
				}],
				...msgDetails,
				// todo implem attachment later
				// "Attachments": [{
				// 	"ContentType": "application/json",
				// 	"Filename": fileName,
				// 	"Base64Content": content
				// }],
			}],
		});
}

exports.handler = async (req, res) => {
	if (req.method == "POST") {
		var _to = req.post.email;
		var _name = req.post.name;
		var _msg = req.post.msg;
		var _subject = req.post.subject;

		sendEmail(_to, _name, _subject, _msg);
	}
	res.end();
}

exports.store =
{
	send: sendEmail,
	sendHTML: sendHTMLEmail,
	sendMailRaw,
}