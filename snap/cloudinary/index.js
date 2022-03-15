var cloudinary = require('cloudinary').v2;

//set path
var path_to_img = path.resolve(CONF.tmp);
var path_to_pj = path.resolve();

//setup cloudinary conf
cloudinary.config({
    cloud_name: 'nauticspot',
    api_key: '773372379715883',
    api_secret: 'L8yt5FsFMTjEU70ktf8emGvwenU',
    secure: true
});

//function to upload a file to cloudinary.
var uploadFile = async function (_file, _fileName, _nameFormat) {
    return new Promise(resolve => {
        var isFileNameUsed = false;
        if (_nameFormat) {
            // get file extension
            var split = _fileName.split('.');
            var extension = '.' + split[split.length - 1];
            
            //convert name to slug if slug selected
            if (_nameFormat == "slug") {
                _fileName = "";
                for (var i = 0; i < split.length - 1; i++) {
                    _fileName += split[i];
                }
                _fileName = convertToSlug(_fileName) + extension;
            }
            isFileNameUsed = true;
        }

        // set up the full file location
        var fullFileLocationName = path.join(CONF.tmp, _fileName);
        
        // write file
        try {
            fs.writeFileSync(fullFileLocationName, Buffer.from(_file, 'binary'));
        } catch (err) {
            console.log(err);
        }
        
        //send file to cloudinary
        cloudinary.uploader.upload(fullFileLocationName, {use_filename: isFileNameUsed}, function (result, error) {
            console.log(result);
            try {
                fs.unlinkSync(path.join(fullFileLocationName));
            } catch (e) {
                console.log(e);
            }
            if (result) {
                resolve(result);
            } else {
                resolve(error);
            }
        });
    });
}

//delete file from cloudinary
var deleteFile = async function (_public_id) {
    return new Promise(resolve => {
        cloudinary.api.delete_resources(_public_id, function (result, error) {
            if (result)
                resolve(result);
            else
                resolve(error);
        });
    });
}


function convertToSlug(Text) {
    return Text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        ;
}

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(result);
    return result;
}

exports.store =
{
    uploadFile: uploadFile,
    deleteFile: deleteFile
}