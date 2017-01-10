var request = require('supertest')
const chai = require('chai')
describe('UserController', function() {
var agent = request.agent('http://localhost:1337') ;

  before(function(done){
      agent.post('/login')
        .send({email: 'haiii@gmail.com', password: '123'})
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
  }),
  after(function(done){
      agent
        .get('/logout')
        .end(function(err, res) {
          if (err) return done(err);

          done();
        });
  }),
 
    it('should show page index', function (done) {
      agent.get('/user/getUser/3')
        .end((err, res) => {
            if(err){
                throw err;
            }
            console.log(res.text);
          done();
        })
        
    }),
    
    it('should show page insert ', function (done) {
        agent.post('/User/insertUser')
       .send({  data : {
                        username  : 'test',
                        email : 'test@gamil.com',
                        password : '123',
                        expiration_date : '12/28/2016'
                    }       
                })
       .end(function(err, res){
                    if(err){
                                throw err;
                    }
                    console.log(res.text);
                    done();
                })
    }),
    
    it('should show page update ', function (done) {
        agent.post('/User/updateUser')
       .send({  data : {
                        username  : 'test',
                        email : 'test@gamil.com',
                        password : '123'
                    }       
                })
       .end(function(err, res){
                    if(err){
                                throw err;
                    }
                    console.log(res.text);
                    done();
                })
    }),
    
    it('should show page delete  ', function (done) {
        agent
       .post('/User/deleteUser')
       .send({  data : {
                        id  : '1'
                    }       
                })
       .end(function(err, res){
                    if(err){
                                throw err;
                    }
                    console.log(res.text);
                    done();
                })
    })
  
})
  