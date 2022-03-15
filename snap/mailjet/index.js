//"bcfc7e92566a91abaf67278f0838225f", "e23c11e01acf44a76ffeb6cfe95bc2d1"

async function sendEmail(_entityId, _toEmail, _toName, _subject, _msg) {
    var entity = await STORE.enititymgmt.getEntityById(_entityId);
    console.log("entity");
        console.log(entity);
    if (entity) {
        var mailjet = require("node-mailjet").connect(entity.mailjet_apikey, entity.mailjet_secretkey);
        const request = mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": entity.mailjet_mail,
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
                console.log("result")
                console.log(result)
                console.log(result.body.Messages[0])
            })
            .catch((err) => {
                console.log("error")
                console.log(err.statusCode)
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
                            "Email": entity.mailjet_mail,
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
                console.log(result)
            })
            .catch((err) => {
                console.log(err.statusCode)
            })
    }
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
}