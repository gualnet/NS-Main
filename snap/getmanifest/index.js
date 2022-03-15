exports.handler = async(req, res) => {
    console.log(req.get);
    
    const entity = await STORE.enititymgmt.getEntityById(req.get.entity);
    
    let manifest = {
      short_name: entity.name,
      name: entity.name,
      icons: [
        {
          src: entity.logo,
          type: "image/png",
          sizes: "192x192"
        },
        {
          src: entity.logo,
          type: "image/png",
          sizes: "512x512"
        }
      ],
      start_url: "/app/" + req.get.entity + "/?entity=" + req.get.entity,
      background_color: "#fff",
      display: "standalone",
      scope: "/app/" + req.get.entity + "/",
      theme_color: "#fff",
      description: entity.name + " Nauticspot app"
    }
    console.log(manifest);
    res.setHeader('Content-Type', 'application/manifest+json');
    res.end(JSON.stringify(manifest)); 
    return;
 }
 
 async function fakeScopeGetHandler(_req, _res) {
     console.log(_req);
     let uriRequested = _req.rawUrl.replace("/app/"+ _req.uriParts[2], "");
    var promise = await UTILS.httpsUtil.httpReqPromise({
            "host": "prod.nauticspot.io",
            "path": uriRequested,
            "method": "GET"
        });
        console.log(promise);
    _res.setHeader('Content-Type', 'text/html');
    _res.end(promise.data);
    return;
 }
 

 exports.router =
    [
        {
            on: true,
            route: "/app/:fakescope",
            handler: fakeScopeGetHandler,
            method: 'get'
        }
    ];
