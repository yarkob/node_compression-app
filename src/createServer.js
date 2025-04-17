'use strict';

const http = require('node:http');
const { htmlForm } = require('./htmlForm');
const { formidable } = require('formidable');
const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');

function createServer() {
  const server = new http.Server();

  server.on('request', async (req, res) => {
    if (req.url === '/compress' && req.method === 'POST') {
      const form = formidable({});
      let fields;
      let files;

      try {
        [fields, files] = await form.parse(req);
      } catch (err) {
        res.statusCode = 400;

        res.end('form is invalid');

        return;
      }

      const compressionType = Array.isArray(fields.compressionType)
        ? fields.compressionType[0]
        : fields.compressionType;

      const uploadedFile = Array.isArray(files.file)
        ? files.file[0]
        : files.file;

      if (!compressionType || !uploadedFile) {
        res.statusCode = 400;
        res.end('form is invalid');

        return;
      }

      let compressedFile;

      switch (compressionType) {
        case 'gzip':
          compressedFile = zlib.createGzip();
          break;
        case 'deflate':
          compressedFile = zlib.createDeflate();
          break;
        case 'br':
          compressedFile = zlib.createBrotliCompress();
          break;
        default:
          res.statusCode = 400;
          res.end('unsupported compression type');

          return;
      }

      const fileStream = fs.createReadStream(uploadedFile.filepath);
      const originalFileName = path.basename(
        files.file[0].originalFilename || 'file',
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/octet-stream');

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${originalFileName}.${compressionType}`,
      );

      fileStream.pipe(compressedFile).pipe(res);

      res.on('close', () => {
        fileStream.destroy();
        compressedFile.destroy();
      });
    } else if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlForm);
    } else if (req.url === '/compress' && req.method === 'GET') {
      res.statusCode = 400;

      res.end('wrong method or endpoint');
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  return server;
}

module.exports = {
  createServer,
};
