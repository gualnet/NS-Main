var DB = new UTILS.FDB({database: "NAUTICSPOT"});
var DBFP = new UTILS.FDB({database: "fortpress"});

exports.onExit = async() => {
    if(DB) DB.Close();
    if(DBFP) DBFP.Close();
}

exports.store = 
{
    linkdb: DB,
    linkdbfp: DBFP,
}