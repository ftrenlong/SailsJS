
module.exports = {
  getUserPage: function (npage, nuser, res) {
    let startArray = (nuser * (npage - 1)) - 1
    let finishArray = (nuser * npage)
    let arrayUser = []
    User.find().exec(function (err, result) {
      if (err) {
        return res('has a error when find user')
      } else {
        result.forEach(function (resultfor, row) {
          if (startArray < row && row < finishArray) {
            arrayUser.push(result[row])
          }
        })
        if ((result.length % nuser) !== 0) {
          arrayUser['numberpage'] = Math.floor(result.length / nuser) + 1
        }
      }
      return res(arrayUser)
    })
  },
  deleteUser: function (id, res) {
    User.destroy({'id': id}).exec(function (err, result) {
      if (err) {
        return res('delete user id ' + id + ' error')
      } else {
        return res('delete user id ' + id + ' success')
      }
    })
  },
  updateUser: function (id, queryUpdate, res) {
    User.findOne({'id': id}).exec(function (err, user) {
      if (err) {
        return res(err)
      }
      if (!user) {
        return res('not found user id : ' + id + ' to update')
      }
      User.query(queryUpdate, function (err) {
        if (err) {
          return res('update user id ' + id + ' fail')
        } else {
          return res('update user id ' + id + ' success')
        }
      })
    })
  },

  insertUser: function (username, password, email, status, expirationDate, res) {
    User.create({'username': username, 'password': password, 'email': email, 'status': status, 'expiration_date': expirationDate})
             .exec(function (err, result) {
               if (err) {
                 return res('insert user name : ' + username + ' err')
               } else {
                 return res('insert user name : ' + username + ' success')
               }
             })
  }

}
