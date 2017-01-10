const lodash = require('lodash')
const bcrypt = require('bcrypt')
module.exports = {
  insert_user: function (req, res) {
    let dateFormat = require('dateformat')
    const now = new Date()
    let currentDate = dateFormat(now, 'mm/dd/yyyy')
    let expirationDate = req.param('expiration_date')
    let status = 'inactive'
    if (Date.parse(expirationDate) >= Date.parse(currentDate)) {
      status = 'active'
    }
    if (req.param('username') &&
         req.param('password') &&
         req.param('email') &&
         req.param('expiration_date')) {
      let username = req.param('username')
      let password = req.param('password')
      let email = req.param('email')
      let expirationDate = req.param('expiration_date')
      UserService.insertUser(username, password, email, status, expirationDate, data => {
        return res.view('insert_user', {
          message: data
        })
      })
    } else {
      return res.view('insert_user', {
        message: 'missing params'
      })
    }
  },

  get_list_user: function (req, res) {
    let npage = parseInt(req.param('npage'), 10)
    if (lodash.isInteger(npage)) {
      UserService.getUserPage(npage, numberUser, (data) => {
        return res.view('index', {
          page: npage,
          users: data
        })
      })
    } else {
      return res.json({'message': 'missing param'})
    }
  },

  delete_user: function (req, res) {
    let id = parseInt(req.param('id'))
    if (!lodash.isInteger(id)) {
      return res.view('delete_user', {
        message: 'missing param'
      })
    } else {
      UserService.deleteUser(id, (data) => {
        User.find().exec((result) => {
          return res.view('delete_user', {
            users: result,
            message: data
          })
        })
      })
    }
  },
  update_user: function (req, res) {
    let id = parseInt(req.param('id'), 10)
    if (lodash.isInteger(id)) {
           // Generate a salt
      let salt = bcrypt.genSaltSync(10)
      let hashpass = bcrypt.hashSync(req.param('password'), salt)
      let queryWhere = ' WHERE id = ' + id
      let querySet = 'UPDATE user SET id = ' + id + ' '
      if (req.param('username')) {
        querySet += ", username = '" + req.param('username') + "' "
      }
      if (req.param('email')) {
        querySet += " , email = '" + req.param('email') + "' "
      }
      if (req.param('password')) {
        querySet += " , password = '" + hashpass + "' "
      }
      if (req.param('expiration_date')) {
        let dateFormat = require('dateformat')
        const now = new Date()
        let currentDate = dateFormat(now, 'mm/dd/yyyy')
        let expirationDate = dateFormat(req.param('expiration_date'), 'yyyy/mm/dd')
        if (Date.parse(req.param('expiration_date')) >= Date.parse(currentDate)) {
          querySet += " ,status = 'active' , expiration_date = '" + expirationDate + "'"
        } else {
          querySet += " , status = 'inactive',expiration_date = '" + expirationDate + "'"
        }
      }
      let queryUpdate = querySet + queryWhere
      UserService.updateUser(id, queryUpdate, data => {
        User.find().exec(function (err, result) {
          if (err) {
            return res.view('update_user', {
              users: result,
              message: 'update for  ' + id + ' not success'
            })
          } else {
            return res.view('update_user', {
              users: result,
              message: data
            })
          }
        })
      })
    } else {
      return res.view('update_user', {
        message: 'missing param'
      })
    }
  },
  getFormInsert: function (req, res) {
    return res.view('insert_user', {
      message: 'enter user info to insert'
    })
  },
  getFormUpdate: function (req, res) {
    User.find().exec(function (err, result) {
      if (err) {
        return res.view('update_user', {
          message: 'not found user in database'
        })
      } else {
        return res.view('update_user', {
          users: result,
          message: 'enter user info to update'
        })
      }
    })
  },
  getFormDelete: function (req, res) {
    User.find().exec(function (err, result) {
      if (err) {
        return res.json(err)
      } else {
        return res.view('delete_user', {
          message: 'enter user id to delete',
          users: result
        })
      }
    })
  },
  getAllUser: function (req, res) {
    User.find().exec(function (err, result) {
      if (err) {
        return res.json(err)
      } else {
        return res.view('index', {
          message: '',
          users: result
        })
      }
    })
  }

}
