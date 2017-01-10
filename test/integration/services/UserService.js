const chai = require('chai')
var request = require('supertest')
var sinon = require('sinon')
const UserService = require('../api/services/UserService');
describe('UserService',  function(){
    describe('', function (){
        it('show list the user if records of user exist', function (){
         request(sails.hooks.http.app).
            UserService.deleteUser();
            assert(send.calledWith(400, { status: 'failure', message: 'Missing paramater required' }));
    } )
    })
    
})