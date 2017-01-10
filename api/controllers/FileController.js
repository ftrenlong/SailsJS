/**
 * FileController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const xls = require('excel')
const fs = require('fs')
const csv = require('fast-csv')
const converter = require('xls-to-json')
const csvExport = require('csv-export')
module.exports = {
 /**
 * Upload avatar for currently logged-in user
 *
 * (POST /user/avatar)
 */

  uploadFile: function (req, res) {
    let upload = req.file('avatar')._files[0].stream
    let byteSize = upload.byteCount
    let headers = upload.headers
    let setting = {
      filetype: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      maxBytes: 1 * 1024 * 1024 }
   //   and check content-type
    let extension = 'xlsx'
    if (setting.filetype.indexOf(headers['content-type']) >= 0) {
      if (setting.filetype.indexOf(headers['content-type']) === 0) {
        extension = 'csv'
      } else if (setting.filetype.indexOf(headers['content-type']) === 1) {
        extension = 'xls'
      }
    } else {
      return res.view('uploadfile', {
        message: 'extension of the file is not Invalid (example : .csv , .xls , .xlsx)'
      })
    }
   // Check file size
    if (byteSize > setting.maxBytes) {
      return res.view('uploadfile', {
        message: 'file  too big'
      })
    }
    req.file('avatar').upload(upload.filename, function (err, files) {
      if (err) {
        return res.view('uploadfile', {
          message: err
        })
      }
      return res.view('uploadfile', {
        message: ' file uploaded successfully!',
        files: files,
        extensions: extension
      })
    })
  },

  importCsvData: function (req, res) {
    let nameFile = req.param('filename')
    if (typeof nameFile !== 'undefined') {
      let stream = fs.createReadStream('./.tmp/uploads/data.csv')
      csv.fromStream(stream, {headers: true}).on('data', function (data) {
        let dateFormat = require('dateformat')
        const now = new Date()
        let currentDate = dateFormat(now, 'mm/dd/yyyy')
        let expirationDate = data.expiration_date
        let status = 'inactive'
        if (Date.parse(expirationDate) >= Date.parse(currentDate)) {
          status = 'active'
        }
        if (typeof data.username !== 'undefined' &&
       typeof data.password !== 'undefined' &&
       typeof data.email !== 'undefined' &&
       typeof data.expiration_date !== 'undefined') {
          UserService.insertUser(data.username, data.password, data.email, status, data.expiration_date, data => {
//       datainfo.push(data);
          })
        } else {
          return res.view('uploadfile', {
            message: 'missing params in data'
          })
        }
      })
      return res.view('uploadfile', {
        message: 'import success'
      })
    } else {
      return res.view('uploadfile', {
        message: 'missing params'
      })
    }
  },

  importXlsxData: function (req, res) {
    let nameFile = req.param('filename')
    if (typeof nameFile !== 'undefined') {
      xls('./.tmp/uploads/' + nameFile, function (err, data) {
        if (err) {
          return res.view('uploadfile', {
            message: err
          })
        } else {
          data.forEach(function (result, row) {
            let dateFormat = require('dateformat')
            const now = new Date()
            let currentDate = dateFormat(now, 'mm/dd/yyyy')
            let expirationDate = result[4]
            let status = 'inactive'
            if (Date.parse(expirationDate) >= Date.parse(currentDate)) {
              status = 'active'
            }
            if (typeof data.username !== 'undefined' &&
       typeof data.password !== 'undefined' &&
       typeof data.email !== 'undefined' &&
       typeof data.expiration_date !== 'undefined') {
              UserService.insertUser(result[1], result[2], result[3], status, result[4], data => {
//       datainfo.push(data);
              })
            } else {
              return res.view('uploadfile', {
                importExcelMS: 'missing params in data'
              })
            }
          })
        }
        return res.view('uploadfile', {
          message: 'import success'
        })
      })
    } else {
      return res.view('uploadfile', {
        message: 'missing param'
      })
    }
  },

  importXlsData: function (req, res) {
    let nameFile = req.param('filename')
    if (typeof nameFile !== 'undefined') {
      converter({
        input: './.tmp/uploads/' + nameFile,
        output: null
      }, function (err, data) {
        if (err) {
          return res.view('uploadfile', {
            message: err
          })
        } else {
          data.forEach(function (result, rows) {
            let dateFormat = require('dateformat')
            const now = new Date()
            let currentDate = dateFormat(now, 'mm/dd/yyyy')
            let expirationDate = result.expiration_date
            let status = 'inactive'
            if (Date.parse(expirationDate) >= Date.parse(currentDate)) {
              status = 'active'
            }
            if (typeof result.username !== 'undefined' &&
           typeof result.password !== 'undefined' &&
           typeof result.email !== 'undefined' &&
           typeof result.expiration_date !== 'undefined') {
              UserService.insertUser(result.username, result.password, result.email, status, result.expiration_date, data => {
              })
            } else {
              return res.view('uploadfile', {
                message: 'missing params in data'
              })
            }
          })
          return res.view('uploadfile', {
            message: 'import success'
          })
        }
      })
    }
  },

  exportCsvData: function (req, res) {
    let extension = req.param('extension')
    if (typeof extension !== 'undefined' && extension =='csv') {
      User.find().exec(function (err, result) {
        if (err) {
          return res.json(err)
        } else {
          let arraUser = {'User': result}
          csvExport.export(arraUser, function (buffer) {
  // this module returns a buffer for the csv files already compressed into a single zip.
  // save the zip or force file download via express or other server
            fs.writeFileSync('./.tmp/export/data.zip', buffer)
            return res.json({'message': 'export success'})
          })
        }
      })
    } else {
      return res.json({'message': 'missing params'})
    }
  },

  index: function (req, res) {
    res.writeHead(200, {'content-type': 'text/html'})
    res.end(
    '<form action="/file/upload" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="avatar" multiple="multiple"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>'
    )
  }

}

