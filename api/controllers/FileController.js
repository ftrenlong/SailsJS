/**
 * FileController
 *
 * @description :: Server-side logic for managing Files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const fs = require('fs')
const fastCsv = require('fast-csv')
const converter = require('xls-to-json')
const excel = require('node-excel-export')
const csv = require('csv')
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
      fastCsv.fromStream(stream, {headers: true}).on('data', (data) => {
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
      }).on('end', () => {
        return res.view('uploadfile', {
          message: 'import success'
        })
      })
    } else {
      return res.view('uploadfile', {
        message: 'missing params'
      })
    }
  },

  importExcelData: function (req, res) {
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
    if (typeof extension !== 'undefined' && extension === 'csv') {
      User.find().exec((err, result) => {
        if (err) {
          return res.json(err)
        } else {
          let header = {'id': 'id', 'username': 'username', 'password': 'password', 'email': 'email', 'status': 'status', 'expiration_date': 'expiration_date'}
          result.unshift(header)
          res.attachment('data.csv')
          csv().from(result).to(res)
        }
      })
    } else {
      return res.json({'message': 'missing params'})
    }
  },

  exportExcelData: function (req, res) {
    let extension = req.param('extension')
    if (typeof extension !== 'undefined' && (extension === 'xls' || extension === 'xlsx')) {
      User.find().exec((err, result) => {
        if (err) {
          return res.json(err)
        } else {
          let specification = {
            id: { // <- the key should match the actual data key
              displayName: 'id', // <- Here you specify the column header
              headerStyle: 'FF00FF00', // <- Header style
              width: 120 // <- width in pixels

            },
            username: {
              displayName: 'username',
              headerStyle: 'FF00FF00',
              width: 120
            },
            password: {
              displayName: 'password',
              headerStyle: 'FF00FF00',
              width: 120
            },
            email: {
              displayName: 'email',
              headerStyle: 'FF00FF00',
              width: 120
            },
            expiration_date: {
              displayName: 'expiration_date',
              headerStyle: 'FF00FF00',
              width: 120
            }
          }
// Create the excel report.
// This function will return Buffer
          let report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
              {
                name: 'Sheet name', // <- Specify sheet name (optional)
//                heading: heading, // <- Raw heading array (optional)
                specification: specification, // <- Report specification
                data: result // <-- Report data
              }
            ]
)
// You can then return this straight
          res.attachment('report.' + extension) // This is sails.js specific (in general you need to set headers)
          return res.send(report)
        }
      })
    } else {
      return res.json({'message': 'missing param'})
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

