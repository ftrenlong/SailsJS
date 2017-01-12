const bcrypt = require('bcrypt')
module.exports = {
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    expiration_date: {
      type: 'datetime'
    },
    toJSON: function () {
      var obj = this.toObject()
      delete obj.password
      return obj
    }
  },
  beforeCreate: function (user, cb) {
    bcrypt.genSalt(10, function (err1, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          console.log(err)
          cb(err)
        } else {
          user.password = hash
          cb()
        }
      })
    })
  },

}
