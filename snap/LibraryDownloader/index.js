const fs = require('fs');
const child_process = require('child_process');

exports.setup = {
  on: true,
  title: 'LibraryDownloader',
  description: 'some endpoints to download folders',
  version: '0.0.2',
  api: true,
}

exports.handler = async (req, res) => {
  try {
    res.end('WE ARE UP');
  } catch (err) {
    res.end('[ERROR]' + err.message);
  }
}

const getProjectZip = (req, res) => {
  try {
    const projectName = req.param.project;
    if (!projectName) {
      res.end('Please specify a project name');
    }

    // ZIP project folder
    const dirPath = `./project/${projectName}`;
    try {
      child_process.exec(
        `tar -cf ${dirPath}.tar ${dirPath}/*`,
        (err, stdout, stderr) => {
          if (err) {
            res.end('[ERR-1]' + err.message);
          } else if (stderr) {
            res.end('[ERR-2]' + stderr);
          } else {
            console.log(`[INFO] - Zip ${projectName}.tar OK`)
            console.log(`[INFO] -`, stdout);
            // SEND ARCHIVE TO CLIENT
            try {
              const fileData = fs.readFileSync(`${dirPath}/../${projectName}.tar`);
              res.end(fileData);
            } catch (error) {
              res.end('[ERROR]' + error.message);
            }
          }
        }
      );

    } catch (error) {
      res.end('[ERR]' + error.message);
      return;
    }

  } catch (error) {
    res.end(error.message);
  }
};


const getVarFolderZip = (req, res) => {
  try {

    // ZIP project folder
    const dirPath = `./var`;
    try {
      child_process.exec(
        `tar -cf ${dirPath}.tar ${dirPath}/*`,
        (err, stdout, stderr) => {
          if (err) {
            res.end('[ERR-1]' + err.message);
          } else if (stderr) {
            res.end('[ERR-2]' + stderr);
          } else {
            console.log(`[INFO] - Zip var.tar OK`)
            console.log(`[INFO] -`, stdout);
            // SEND ARCHIVE TO CLIENT
            try {
              console.log('ARCH', `${dirPath}/../var.tar`);
              const fileData = fs.readFileSync(`${dirPath}/../var.tar`);
              res.end(fileData);
            } catch (error) {
              res.end('[ERROR]' + error.message);
            }
          }
        }
      );

    } catch (error) {
      res.end('[ERR]' + error.message);
      return;
    }

  } catch (error) {
    res.end(error.message);
  }
};

const getLibraryFolderZip = (req, res) => {
  try {

    // ZIP project folder
    const dirPath = `./var/library`;
    const archiveName = 'library.tar';
    try {
      child_process.exec(
        `tar -cf ${dirPath}/${archiveName} ${dirPath}/*`,
        (err, stdout, stderr) => {
          if (err) {
            res.end('[ERR-1]' + err.message);
          } else if (stderr) {
            res.end('[ERR-2]' + stderr);
          } else {
            console.log(`[INFO] - Zip ${archiveName} OK`)
            console.log(`[INFO] -`, stdout);
            // SEND ARCHIVE TO CLIENT
            try {
              console.log('ARCH', `${dirPath}/${archiveName}`);
              const fileData = fs.readFileSync(`${dirPath}/${archiveName}`);
              res.end(fileData);
            } catch (error) {
              res.end('[ERROR]' + error.message);
            }
          }
        }
      );

    } catch (error) {
      res.end('[ERR]' + error.message);
      return;
    }

  } catch (error) {
    res.end(error.message);
  }
};

exports.router = [
  {
    on: true,
    route: "/api/zip/project/:project",
    method: "GET",
    handler: getProjectZip
  }, {
    on: true,
    route: '/api/zip/var',
    method: 'GET',
    handler: getVarFolderZip
  }, {
    on: true,
    route: '/api/zip/library',
    method: 'GET',
    handler: getLibraryFolderZip
  }
]

// exports.onError = (ev, error) => {
//   if (error) {
//     res.end(error.message);
//   }
// }
