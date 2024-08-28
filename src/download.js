"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.niceBytes = niceBytes;
exports.downloadFile = downloadFile;
var fs_extra_1 = require("fs-extra");
var https_1 = require("https");
var http_1 = require("http");
var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
function niceBytes(x) {
    var l = 0;
    var n = parseInt(x, 10) || 0;
    while (n >= 1024 && ++l) {
        n /= 1024;
    }
    return "".concat(n.toFixed(n < 10 && l > 0 ? 1 : 0), " ").concat(units[l]);
}
function downloadFile(url, filePath, onProgressCb) {
    return new Promise(function (resolve, reject) {
        var total = 0;
        var totalLen = '0 MB';
        var transferred = 0;
        var httpOrHttps = url.startsWith('https') ? https_1.default : http_1.default;
        var request = httpOrHttps.get(url, function (response) {
            if (response.statusCode === 200) {
                var file_1 = fs_extra_1.default.createWriteStream(filePath);
                file_1.on('error', function (err) {
                    request.destroy();
                    reject(err);
                });
                response.on('data', function (chunk) {
                    transferred += chunk.length;
                    var percentage = parseFloat(String((transferred * 100) / total)).toFixed(2);
                    if (onProgressCb && typeof onProgressCb === 'function') {
                        onProgressCb({
                            transferred: niceBytes(transferred),
                            percentage: percentage,
                            total: totalLen,
                        });
                    }
                });
                response.on('end', function () {
                    file_1.end();
                });
                response.on('error', function (err) {
                    file_1.destroy();
                    fs_extra_1.default.unlink(filePath, function () { return reject(err); });
                });
                response.pipe(file_1).once('finish', function () {
                    resolve();
                });
            }
            else if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, filePath, onProgressCb).then(function () { return resolve(); });
            }
            else {
                reject(new Error("Network error ".concat(response.statusCode)));
            }
        });
        request.on('response', function (res) {
            total = parseInt(res.headers['content-length'] || '0', 10);
            totalLen = niceBytes(total);
        });
        request.on('error', function (e) {
            reject(e);
        });
        request.end();
    });
}
