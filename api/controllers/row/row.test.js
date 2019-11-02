'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../helpers/redis')

let owner
let tableId = ''
let member
let listRows = '' // Use to update, delete this company with Id
let userIds // Array user will add to row
let userId

describe('PREPARE TESTING JOB', () => {
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

describe('POST /rows?tableId=', () => {
    it('OK, create Row 1', done => {
        request(app).post(`/rows?tableId=${tableId}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            title: 'Row 1',
            description: 'Row 1 Description',
            isAllowMemberAddMember: 0
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('row')
            expect(body.row.title).to.equals('Row 1')
            expect(body.row.description).to.equals('Row 1 Description')
            done()
        }).catch((error) => done(error))
    })
    // it('OK, create Row 2', done => {
    //     request(app).post(`/rows?tableId=${tableId}`).set({
    //         'x-access-token': owner.tokenKey
    //     }).send({
    //         title: 'Row 2',
    //         description: 'Row 2 Description'
    //     }).then(res => {
    //         const body = res.body
    //         expect(res.statusCode).to.equals(200)
    //         expect(body).to.contain.property('row')
    //         expect(body.row.title).to.equals('Row 2')
    //         expect(body.row.description).to.equals('Row 2 Description')
    //         done()
    //     }).catch((error) => done(error))
    // })
    // it('OK, create Row 3', done => {
    //     request(app).post(`/rows?tableId=${tableId}`).set({
    //         'x-access-token': owner.tokenKey
    //     }).send({
    //         title: 'Row 3',
    //         description: 'Row 3 Description'
    //     }).then(res => {
    //         const body = res.body
    //         expect(res.statusCode).to.equals(200)
    //         expect(body).to.contain.property('row')
    //         expect(body.row.title).to.equals('Row 3')
    //         expect(body.row.description).to.equals('Row 3 Description')
    //         done()
    //     }).catch((error) => done(error))
    // })
    // it('OK, create Row 4', done => {
    //     request(app).post(`/rows?tableId=${tableId}`).set({
    //         'x-access-token': owner.tokenKey
    //     }).send({
    //         title: 'Row 4',
    //         description: 'Row 4 Description'
    //     }).then(res => {
    //         const body = res.body
    //         expect(res.statusCode).to.equals(200)
    //         expect(body).to.contain.property('row')
    //         expect(body.row.title).to.equals('Row 4')
    //         expect(body.row.description).to.equals('Row 4 Description')
    //         done()
    //     }).catch((error) => done(error))
    // })
    // it('OK, create Row 5', done => {
    //     request(app).post(`/rows?tableId=${tableId}`).set({
    //         'x-access-token': owner.tokenKey
    //     }).send({
    //         title: 'Row 5',
    //         description: 'Row 5 Description'
    //     }).then(res => {
    //         const body = res.body
    //         expect(res.statusCode).to.equals(200)
    //         expect(body).to.contain.property('row')
    //         expect(body.row.title).to.equals('Row 5')
    //         expect(body.row.description).to.equals('Row 5 Description')
    //         done()
    //     }).catch((error) => done(error))
    // })
    // it('FAIL, missing title', done => {
    //     request(app).post(`/rows?tableId=${tableId}`).set({
    //         'x-access-token': owner.tokenKey
    //     }).send({
    //         description: 'Row FAIL Description'
    //     }).then(res => {
    //         expect(res.statusCode).to.equals(400)
    //         done()
    //     }).catch((error) => done(error))
    // })
})

// describe('GET /rows?tableId=', () => {
//     it('OK, Query list of rows by table id', done => {
//         request(app).get(`/rows?tableId=${tableId}`).set({
//             'x-access-token': owner.tokenKey
//         }).then(res => {
//             const body = res.body
//             expect(res.statusCode).to.equals(200)
//             expect(body).to.contain.property('rows')
//             expect(body.rows.length).to.equals(5)
//             listRows = body.rows
//             // Save to redis store to re-use
//             redis.setex('listRows', 3600, JSON.stringify(listRows))
//             done()
//         }).catch((error) => done(error))
//     })
// })

// describe('GET /rows/:rowId', () => {
//     it('OK, Get detail row', done => {
//         request(app).get(`/rows/${listRows[0]._id}`).set({
//             'x-access-token': owner.tokenKey
//         }).then(res => {
//             const body = res.body
//             expect(res.statusCode).to.equals(200)
//             expect(body).to.contain.property('row')
//             done()
//         }).catch((error) => done(error))
//     })
// })

// describe('DELETE /rows/:rowId', () => {
//     it('OK, delete immediately row', done => {
//         request(app).delete(`/rows/${listRows[4]._id}/`).set({
//             'x-access-token': owner.tokenKey
//         }).then(res => {
//             const body = res.body
//             expect(res.statusCode).to.equals(200)
//             expect(body).to.contain.property('raw')
//             expect(body.raw.ok).to.equals(1)
//             done()
//         }).catch((error) => done(error))
//     })
//     it('OK, check row already deleted ?', done => {
//         request(app).get(`/rows/${listRows[4]._id}`).set({
//             'x-access-token': owner.tokenKey
//         }).then(res => {
//             const body = res.body
//             expect(res.statusCode).to.equals(403)
//             expect(body).to.not.contain.property('row')
//             done()
//         }).catch((error) => done(error))
//     })
// })

// describe('PUT /rows/:rowId/', () => {
//     it('OK, edit row', done => {
//         request(app).put(`/rows/${listRows[0]._id}/`).set({
//             'x-access-token': owner.tokenKey
//         }).send({
//             title: 'Row Edit',
//             description: 'Description Edit',
//             isAllowMemberAddMember: 0
//         }).then(res => {
//             const body = res.body
//             expect(res.statusCode).to.equals(200)
//             expect(body).to.contain.property('row')
//             expect(body.row.title).to.equals('Row Edit')
//             expect(body.row.description).to.equals('Description Edit')
//             expect(body.row.allowed.isAllowMemberAddMember).to.equals(0)
//             done()
//         }).catch((error) => done(error))
//     })
// })
