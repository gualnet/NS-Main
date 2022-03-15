const fs = require('fs');
// const { exec } = require("child_process");

exports.setup = {
  on: true,
  title: 't_user',
  description: 'snap de test',
  version: '0.0.2',
  api: false,
}

const DIR_PATH = './project/NauticspotBETA23022022/www'
let selectedFileName = '';

const getAssets = () => {
  const dirEnum = fs.readdirSync(DIR_PATH);
  return (dirEnum);
}

/**
 * Get an array of file names and create div elements
 * @param dirContent {Array<string>}
 */
const createFileRow = (dirContent) => {
  /**@type Array<string> */
  const rows = [];

  dirContent.map((fileName) => {
    rows.push(`
      <div class='container' style={display: flex;}>
        <div class='label'>${fileName}</div>
      </div>
    `);
  });
  return (rows);
};

exports.handler = async (req, res) => {
  const dirContent = getAssets();
  const rows = createFileRow(dirContent)

  let template = '';
  template += rows.join('</br>');
  template += `
    <script type="application/javascript">
      const clickHandler = (ev) => {
        const fileName = ev.target.innerHTML;
        
        alert(fileName);
        window.location = '/api/t_user/one';
      }

      const rows = document.getElementsByClassName('container');
      for (let item of rows) {
        item.addEventListener('click', clickHandler)
      }
    </script>
  `;
  // window.addEventListener('load', () => {
  //   console.log('LOADED');
  // })
//   res.end(template);
  //   const results = await getAssets();

   try {
     child_process.exec("ls -la", (error, stdout, stderr) => {
       if (error) {
         res.end('NOK')
         // console.log(`error: ${error.message}`);
         return;
       }
       if (stderr) {
         // console.log(`stderr: ${stderr}`);
         res.end('OK1')
         return;
       }
       // console.log(`stdout: ${stdout}`);
       res.end('ok2'+stdout)
     });
   } catch (error) {
     res.end(`[ERR]`, error.message);
   }
}

exports.router = [
  {
    on: true,
    route: "/api/t_user/one",
    method: "ANY",
    handler: function (req, res) {
      // RES JSON
      res.setHeader('Content-Type', "application/json");
      res.end(JSON.stringify({ cle: 'valeur' }))
      
      // RES TEXT FROM FILE
      // fs.readFile(DIR_PATH + '/config.json', {
      //   encoding: 'utf-8'
      // }, (err, content) => {
      //   if (err) {
      //     res.end('ERROR' + err.message)
      //   } else {
      //     res.end(content);
      //   }
      // });
      

      // const fileContent = fs.readFileSync('./config.json', { encoding: 'utf-8'});
      
      // res.end(fileContent);
    }
  }, {
    on: true,
    route: "/api/t_user/two",
    method: "ANY",
    handler: function (req, res) { res.end("Hello Two") }
  }
];

exports.plugin = {
  title: "t_user",
  description: "plugin de test",
  category: 'test',
  handler: async (req, res) => {
    const dirEnum = getAssets();
    let maPage = '<div id=container> Hello';

    for (let i = 0; i < dirEnum.length; i++) {
      maPage += `<div> ${dirEnum[i]}</div>`;
    }

    maPage += '</div>';
    res.setHeader("Content-Type", "text/html");
    res.end(maPage);
  }
}