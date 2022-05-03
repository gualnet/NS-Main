exports.handler = async (req, res) => {
  // console.log('==================GET MANIFEST MGMT HANDLER=================')
  const entity = await STORE.enititymgmt.getEntityById(req.get.entity);
  let manifest = {
    short_name: entity.name,
    name: entity.name,
    icons: [
      {
        src: entity.appIcon?.replace('/upload', '/upload/w_128,h_128,c_fill') || entity.logo,
        type: "image/png",
        sizes: "128x128"
      },
      {
        src: entity.appIcon?.replace('/upload', '/upload/w_256,h_256,c_fill') || entity.logo,
        type: "image/png",
        sizes: "256x256"
      },
      {
        src: entity.appIcon?.replace('/upload', '/upload/w_512,h_512,c_fill') || entity.logo,
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
  res.setHeader('Content-Type', 'application/manifest+json');
  res.end(JSON.stringify(manifest));
  return;
}

async function fakeScopeGetHandler(_req, _res) {
  // console.log('fakeScopeGetHandler');
  let uriRequested = _req.rawUrl.replace("/app/" + _req.uriParts[2], "");

  const requestMaker = (_req.SERVER.type === 'https') ? UTILS.httpsUtil.httpReqPromise : UTILS.httpUtil.httpReqPromise

  const requestParam = {
    "host": OPTION.HOST_NAME,
    "port": OPTION.HOST_PORT || ((_req.SERVER.type === 'https') ? 443 : 80),
    "path": uriRequested,
    "method": "GET"
  };
  
  console.log('requestParam', requestParam)
  console.log('uriRequested', uriRequested)

  const response = await requestMaker(requestParam);
  _res.setHeader('Content-Type', 'text/html');
  _res.end(response.data);
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
