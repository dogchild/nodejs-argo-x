#!/usr/bin/env node

require('dotenv').config({ override: true });
const axios = require("axios");
const os = require('os');
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const FILE_PATH = process.env.FILE_PATH || './tmp';   // 运行目录,sub节点文件保存目录
const UID = process.env.UID || '75de94bb-b5cb-4ad4-b72b-251476b36f3a'; // 用户ID
const S_PATH = process.env.S_PATH || UID;       // 订阅路径
const PORT = process.env.SERVER_PORT || process.env.PORT || 3005;        // http服务订阅端口
const A_DOMAIN = process.env.A_DOMAIN || '';          // 固定连接域名,留空即启用快速连接
const A_AUTH = process.env.A_AUTH || '';              // 固定连接token,留空即启用快速连接
const A_PORT = process.env.A_PORT || 8001;            // 固定连接端口,使用token需在对应服务后台设置和这里一致
const CIP = process.env.CIP || 'cf.877774.xyz';         // 节点优选域名或优选ip
const CPORT = process.env.CPORT || 443;                   // 节点优选域名或优选ip对应的端口
const NAME = process.env.NAME || 'Vls';                     // 节点名称
const MLKEM_S = process.env.MLKEM_S || 'mlkem768x25519plus.native.600s.ugygldXvD2pi5St4XBlF4Cgd-55qGCdaOrcJsxdIR5aHGFeYh-Dm1BDsSluXrHUmscV5n9_hPJ8zPfBP4HEgaA';
const MLKEM_C = process.env.MLKEM_C || 'mlkem768x25519plus.native.0rtt.h7xFrUkiWbhXfCNmehc209OOlXhUaPM-2bgKIQyRRLt7WXmEJFsY64QT8se8HcGNLNkKPlTGS1W5XIgRZfFVuNqATbcyuNa7O9BveTB5GaESadgUsWMCs-ugCyTG3WNonYlL0otGzxMEhnohNnkTnoCchQgVULxZAGZW8oYbaNcS-UUZJGhoSvBbz4gZj8RVqDQhd1ReD1E4IMFd2tANlCANZcyZJKykjPdCrqRxiDsxSHGwB6kB4UikaOEAzCSgXNZcJleylvJVkkg54sh4pnGfC0pXp2GjiZFe_cIFRGJJr4mlaCSHphsvecYzctZQiYw3p4xxxRsCtgpUQ2KWReg6YmZCBDy-ckYg8pNp5LtcZBRWE9nDZKVnbpOqL0s442XLqniTLuI1exkbjMJEz-vLIZSNXDA6DieyFyKOUPtFbjcutoq9QGxICAgmvpGn0Qw_JBVoBsJZqwG43wiBcedwBJotJ_SV7klDZEiF-Nud3OaNcmnJWDcEf3O2BiNknpcKbHmrstg8Y0y5kjtfMrau9NDNoiVidNtKtYwQXHA8ndVo15YutaGKs-N9YCavxYUX62fAunulLJAuc6KsDXs_rDlhrFMfxhumq6kNpZxC0vJsvVSQRcVmd-pi8gseXAUOY_zD2paGv2JEQilTtqlrh9cCn-GCP_cYErud-QSsRyCIz5dpGZdEggrPumAlQ4C5j4JniKYaELScBWQWK6E1Y1SPhQFsLgxJFSC9w0pNmIyfleSEEXcd9uOPdVvF0QpJ04dHHKO4r6ekTkkM4XZc7lp1pTwvB8B-tqmjl9Fu4kcgZ0PCQDqGLeq9U3kJUhBsxLhCH8zNzjtaeGooPZAdw_eCJ8dsQmXByaiAs4ofocko4HEfiWh1urqO5dxJMuS3f7WPs6BWthW5vXCuA3mJ_Go87GUY0XEilpE3OJvNNLiBoidadIFnOFI_fqfGGNhxseEGjdF1cLlEtpdLQjWxxcB1BNudQAdWc6tO1StI0KVQwQeFOYS7v3LK2usU1qQmH6UIbmiN5TtmVxodk8FM3xE6fvZZXON1POM_08KPU8QcoYATmUu_sRaWGrlFmTY59zZNoASc7zPHxJm66ZYOiVFcsSh-pmenuzCCa9UcvUSR-OxLNvi9XoZrWOy6n8iP26gnUmcygTQB0phUajxa6fa_85JF6adgD8ylDXiuGpbOchwokbwGbTUMGwmsBSnKDWKqRffDUPq-pZxQOXuwlblsEWUU87DJFHwI2eVKj9sjYVBzm7onKZpt9yRwCEUajIIggzwDRDQwlPil5MS1vWFd4TsIO4oLtbKrR3YK3Xp-kIeZBUMJBliBJfld0vDJNFMnWKXAE_gPySFO9blD8lGgsHKSSYCgF1VUx6B0nsS1nIPMIFvKB6CwKbeHh0gpR9YepBFm99ZAkRRH2Gu0Xtd59fWoOHRFDYVTWtWTA8gY0oxzE4gcFyePjxw0-7Ax2-gg_fnJZia1fwEAZmZnIAg28OAlRutOPVfLFDBIplSb2NCnsfh6tDcruSt6bZhPlwwDS8pggEKdudxNBkNPYeICnErthTVl5qYB_gQ';
const M_AUTH = process.env.M_AUTH || 'ML-KEM-768, Post-Quantum';

//创建运行文件夹
if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH);
  console.log(`${FILE_PATH} is created`);
} else {
  console.log(`${FILE_PATH} already exists`);
}

let subPath = path.join(FILE_PATH, 'sub.txt');
let bootLogPath = path.join(FILE_PATH, 'boot.log');
let configPath = path.join(FILE_PATH, 'config.json');

//清理历史文件
function cleanupOldFiles() {
  const pathsToDelete = ['sub.txt', 'boot.log'];
  pathsToDelete.forEach(file => {
    const filePath = path.join(FILE_PATH, file);
    fs.unlink(filePath, () => { });
  });
}

let subContent = '';

const http = require('http');
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Hello world!');
  } else if (req.method === 'GET' && req.url === `/${S_PATH}`) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(subContent);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

// 生成front配置文件
const config = {
  log: { access: '/dev/null', error: '/dev/null', loglevel: 'none' },
  inbounds: [
    { port: A_PORT, protocol: 'vless', settings: { clients: [{ id: UID, flow: 'xtls-rprx-vision' }], decryption: 'none', fallbacks: [{ dest: 3001 }, { path: "/vla", dest: 3002 }] }, streamSettings: { network: 'tcp' } },
    { port: 3001, listen: "127.0.0.1", protocol: 'vless', settings: { clients: [{ id: UID }], decryption: "none" }, streamSettings: { network: "tcp", security: "none" } },
    { port: 3002, listen: "127.0.0.1", protocol: 'vless', settings: { clients: [{ id: UID }], decryption: MLKEM_S, selectedAuth: M_AUTH }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/vla" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } }
  ],
  dns: { servers: ["https+local://8.8.8.8/dns-query"] },
  outbounds: [{ protocol: "freedom", tag: "direct" }, { protocol: "blackhole", tag: "block" }]
};
fs.writeFileSync(path.join(FILE_PATH, 'config.json'), JSON.stringify(config, null, 2));

// 判断系统架构
function getSystemArchitecture() {
  const arch = os.arch();
  if (arch === 'arm' || arch === 'arm64' || arch === 'aarch64') {
    return 'arm';
  } else {
    return 'amd';
  }
}

// 下载对应系统架构的依赖文件
function downloadFile(fileName, fileUrl, callback) {
  const filePath = path.join(FILE_PATH, fileName);
  const writer = fs.createWriteStream(filePath);

  axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  })
    .then(response => {
      response.data.pipe(writer);

      writer.on('finish', () => {
        writer.close();

        // 获取下载文件的实际大小
        fs.stat(filePath, (err, stats) => {
          if (err) {
            const errorMessage = `Failed to check file size: ${err.message}`;
            console.error(errorMessage);
            fs.unlink(filePath, () => { });
            callback(errorMessage);
            return;
          }

          // 从响应头获取预期的文件大小
          const expectedSize = response.headers['content-length'];

          // 如果服务器提供了Content-Length，则进行校验
          if (expectedSize) {
            const expectedBytes = parseInt(expectedSize);
            const actualBytes = stats.size;

            if (expectedBytes !== actualBytes) {
              const errorMessage = `File ${fileName} integrity check failed: expected ${expectedBytes} bytes, got ${actualBytes} bytes`;
              console.error(errorMessage);
              fs.unlink(filePath, () => { });
              callback(errorMessage);
              return;
            }
          }

          console.log(`Download ${fileName} successfully`);
          callback(null, fileName);
        });
      });

      writer.on('error', err => {
        fs.unlink(filePath, () => { });
        const errorMessage = `Download ${fileName} failed: ${err.message}`;
        console.error(errorMessage); // 下载失败时输出错误消息
        callback(errorMessage);
      });
    })
    .catch(err => {
      fs.unlink(filePath, () => { });
      const errorMessage = `Download ${fileName} failed: ${err.message}`;
      console.error(errorMessage); // 下载失败时输出错误消息
      callback(errorMessage);
    });
}

// 下载并运行依赖文件
async function downloadFilesAndRun() {
  const architecture = getSystemArchitecture();
  const allFiles = getFilesForArchitecture(architecture);

  if (allFiles.length === 0) {
    console.log(`Can't find a file for the current architecture`);
    return;
  }

  // 过滤掉已存在的文件，只下载不存在的文件
  const filesToDownload = allFiles.filter(fileInfo => {
    const filePath = path.join(FILE_PATH, fileInfo.fileName);
    const exists = fs.existsSync(filePath);
    if (exists) {
      console.log(`${fileInfo.fileName} already exists, skipping download`);
    }
    return !exists;
  });

  if (filesToDownload.length === 0) {
    console.log('All required files already exist, skipping download');
  }

  const downloadPromises = filesToDownload.map(fileInfo => {
    return new Promise((resolve, reject) => {
      downloadFile(fileInfo.fileName, fileInfo.fileUrl, (err, fileName) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileName);
        }
      });
    });
  });

  try {
    await Promise.all(downloadPromises);
  } catch (err) {
    console.error('Error downloading files:', err);
    return;
  }
  // 授权和运行
  function authorizeFiles(filePaths) {
    const newPermissions = 0o755;
    filePaths.forEach(relativeFilePath => {
      const absoluteFilePath = path.join(FILE_PATH, relativeFilePath);
      if (fs.existsSync(absoluteFilePath)) {
        fs.chmod(absoluteFilePath, newPermissions, (err) => {
          if (err) {
            console.error(`Empowerment failed for ${absoluteFilePath}: ${err}`);
          } else {
            console.log(`Empowerment success for ${absoluteFilePath}: ${newPermissions.toString(8)}`);
          }
        });
      }
    });
  }

  const filesToAuthorize = ['./front', './backend'];
  authorizeFiles(filesToAuthorize);

  //运行front
  const command1 = `nohup ${FILE_PATH}/front -c ${FILE_PATH}/config.json >/dev/null 2>&1 &`;
  try {
    await exec(command1);
    console.log('front is running');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`front running error: ${error}`);
  }

  // 运行backend
  if (fs.existsSync(path.join(FILE_PATH, 'backend'))) {
    let args;

    if (A_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/)) {
      args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 run --token ${A_AUTH}`;
    } else {
      args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile ${FILE_PATH}/boot.log --loglevel info --url http://localhost:${A_PORT}`;
    }

    try {
      await exec(`nohup ${FILE_PATH}/backend ${args} >/dev/null 2>&1 &`);
      console.log('backend is running');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error executing command: ${error}`);
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));

}

//根据系统架构返回对应的url
function getFilesForArchitecture(architecture) {
  let baseFiles;
  if (architecture === 'arm') {
    baseFiles = [
      { fileName: "front", fileUrl: "https://arm.dogchild.eu.org/front" },
      { fileName: "backend", fileUrl: "https://arm.dogchild.eu.org/backend" }
    ];
  } else {
    baseFiles = [
      { fileName: "front", fileUrl: "https://amd.dogchild.eu.org/front" },
      { fileName: "backend", fileUrl: "https://amd.dogchild.eu.org/backend" }
    ];
  }

  return baseFiles;
}

// 获取连接类型
function connectType() {
  if (!A_AUTH || !A_DOMAIN) {
    console.log("A_DOMAIN or A_AUTH variable is empty, use quick connections");
    return;
  }

  if (A_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/)) {
    console.log("A_AUTH is a token, connect to service");
  } else {
    console.log("A_AUTH is not a token, will use quick connections");
  }
}
connectType();

// 获取连接域名
async function extractDomains() {
  let aDomain;

  if (A_AUTH && A_DOMAIN) {
    aDomain = A_DOMAIN;
    console.log('A_DOMAIN:', aDomain);
    await generateLinks(aDomain);
  } else {
    try {
      const fileContent = fs.readFileSync(path.join(FILE_PATH, 'boot.log'), 'utf-8');
      const lines = fileContent.split('\n');
      const aDomains = [];
      lines.forEach((line) => {
        const d = 'trycloudflare.com';
        const domainMatch = line.match(new RegExp(`https?:\/\/([^ ]*${d.replace(/\./g, '\\.')})\/?`));
        if (domainMatch) {
          const domain = domainMatch[1];
          aDomains.push(domain);
        }
      });

      if (aDomains.length > 0) {
        aDomain = aDomains[0];
        console.log('ADomain:', aDomain);
        await generateLinks(aDomain);
      } else {
        console.log('ADomain not found, re-running backend to obtain ADomain');
        // 删除 boot.log 文件，等待 2s 重新运行 server 以获取 ADomain
        fs.unlinkSync(path.join(FILE_PATH, 'boot.log'));
        async function killBackendProcess() {
          try {
            await exec('pkill -f "[b]ackend" > /dev/null 2>&1');
          } catch (error) {
            // 忽略输出
          }
        }
        killBackendProcess();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile ${FILE_PATH}/boot.log --loglevel info --url http://localhost:${A_PORT}`;
        try {
          await exec(`nohup ${path.join(FILE_PATH, 'backend')} ${args} >/dev/null 2>&1 &`);
          console.log('backend is running.');
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await extractDomains(); // 重新提取域名
        } catch (error) {
          console.error(`Error executing command: ${error}`);
        }
      }
    } catch (error) {
      console.error('Error reading boot.log:', error);
    }
  }

  // 生成 sub 信息
  async function generateLinks(aDomain) {
    let ISP = '';
    try {
      const url = 'https://ipapi.co/json/';
      const response = await axios.get(url);
      const data = response.data;
      // 使用从JSON数据中提取的字段构建ISP信息
      ISP = `${data.country_code}-${data.org}`.replace(/\s/g, '_');
    } catch (error) {
      console.error('Error fetching meta data:', error);
      ISP = 'Unknown-ISP'; // 提供默认值以防止程序崩溃
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const subTxt = `
vless://${UID}@${CIP}:${CPORT}?encryption=${MLKEM_C}&security=tls&sni=${aDomain}&fp=chrome&type=ws&host=${aDomain}&path=%2Fvla%3Fed%3D2560#${NAME}-${ISP}
    `;
        // 打印 sub.txt 内容到控制台
        subContent = Buffer.from(subTxt).toString('base64');
        console.log(subContent);
        fs.writeFileSync(subPath, subContent);
        console.log(`${FILE_PATH}/sub.txt saved successfully`);
        resolve(subTxt);
      }, 2000);
    });
  }
}



// 回调运行
async function startserver() {
  cleanupOldFiles();
  await downloadFilesAndRun();
  await extractDomains();
}
startserver();

server.listen(PORT, () => console.log(`http server is running on port:${PORT}!`));
