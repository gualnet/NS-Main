exports.handler = async (req, res) => {
    var arr = [];
    var count = 0;
    STORE.db.linkdbfp.Find("user", {}, null, function (_err, _data) {
        var admins = _data;
        console.log(admins);
        for (var i = 0; i < admins.length; i++) {
            console.log(admins[i].data.harbour_id);
            console.log(admins[i].role);
            if (admins[i].role == "user") {
                if (Array.isArray(admins[i].data.harbour_id) == false) {
                    arr[0] = admins[i].data.harbour_id
                    admins[i].data.harbour_id = arr;
                    console.log(admins[i].data.harbour_id);
                    STORE.db.linkdbfp.Update("user", { id: admins[i].id }, { data: admins[i].data }, function (_err, _data) {
                        //console.log(_data);
                        if (_data) {
                            count++;
                        }
                    });
                }
            }
        }
        res.end("update : " + count);
    });
}