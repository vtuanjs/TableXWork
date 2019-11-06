'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../helpers/redis')

let owner
let tableId = ''
let listColumns = '' // Use to update, delete this company with Id

describe('PREPARE TESTING ROW', () => {
    it('Ok, login user account', done => {
        request(app).post(`/auths/login`).send({
            email: 'kien.nguyen@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('user')
            expect(body.user).to.contain.property('tokenKey')
            owner = body.user
            done()
        }).catch((error) => done(error))
    })
    it('OK, get table Id', done => {
        redis.get('listTables').then(data => {
            tableId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
})

describe('POST /tables/:tableId/cols', () => {
    it('OK, create Column 1', done => {
        request(app).post(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Column 1',
            description: 'Column 1 Description',
            isAllowMemberAddMember: 0
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            expect(body.column.title).to.equals('Column 1')
            expect(body.column.description).to.equals('Column 1 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Column 2', done => {
        request(app).post(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Column 2',
            description: 'Column 2 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            expect(body.column.title).to.equals('Column 2')
            expect(body.column.description).to.equals('Column 2 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Column 3', done => {
        request(app).post(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Column 3',
            description: 'Column 3 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            expect(body.column.title).to.equals('Column 3')
            expect(body.column.description).to.equals('Column 3 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Column 4', done => {
        request(app).post(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Column 4',
            description: 'Column 4 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            expect(body.column.title).to.equals('Column 4')
            expect(body.column.description).to.equals('Column 4 Description')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Column 5', done => {
        request(app).post(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Column 5',
            description: 'Column 5 Description'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            expect(body.column.title).to.equals('Column 5')
            expect(body.column.description).to.equals('Column 5 Description')
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, missing title', done => {
        request(app).post(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).send({
            description: 'Column FAIL Description'
        }).then(res => {
            expect(res.statusCode).to.equals(400)
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /tables/:tableId/cols', () => {
    it('OK, Query list of columns by table id', done => {
        request(app).get(`/tables/${tableId}/cols`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('columns')
            expect(body.columns.length).to.equals(5)
            listColumns = body.columns
            // Save to redis store to re-use
            redis.setex('listColumns', 3600, JSON.stringify(listColumns))
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /tables/:tableId/cols/:columnId', () => {
    it('OK, Get detail column', done => {
        request(app).get(`/tables/${tableId}/cols/${listColumns[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            done()
        }).catch((error) => done(error))
    })
})

describe('DELETE /tables/:tableId/cols/:columnId', () => {
    it('OK, delete immediately column', done => {
        request(app).delete(`/tables/${tableId}/cols/${listColumns[4]._id}/`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('raw')
            expect(body.raw.ok).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
    it('OK, check column already deleted ?', done => {
        request(app).get(`/tables/${tableId}/cols/${listColumns[4]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(400)
            expect(body).to.not.contain.property('column')
            done()
        }).catch((error) => done(error))
    })
})

describe('PUT /tables/:tableId/cols/:columnId/', () => {
    it('OK, edit column', done => {
        request(app).put(`/tables/${tableId}/cols/${listColumns[0]._id}/`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Column Edit',
            description: 'Description Edit',
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('column')
            expect(body.column.title).to.equals('Column Edit')
            expect(body.column.description).to.equals('Description Edit')
            done()
        }).catch((error) => done(error))
    })
})
