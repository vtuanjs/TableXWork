'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../helpers/redis')

let owner = {}
let cellId = ''
let listComments = []

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
    it('OK, get cell Id', done => {
        redis.get('listCells').then(data => {
            cellId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
})

describe('POST /cells/:cellId/comments', () => {
    it('OK, create comment 1', done => {
        request(app).post(`/cells/${cellId}/comments`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({ body: 'Comment 1' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, create comment 2', done => {
        request(app).post(`/cells/${cellId}/comments`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({ body: 'Comment 2' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, create comment 3', done => {
        request(app).post(`/cells/${cellId}/comments`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({ body: 'Comment 3' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, create comment 4', done => {
        request(app).post(`/cells/${cellId}/comments`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({ body: 'Comment 4' })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /cells/:cellId/comments', () => {
    it('OK, get all comment in cell', done => {
        request(app).get(`/cells/${cellId}/comments`)
            .set({ 'x-access-token': owner.tokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comments')
                listComments = body.comments
                done()
            })
            .catch((error) => done(error))
    })
})

describe('GET /cells/:cellId/comments/:commentId', () => {
    it('OK, get detail comment', done => {
        request(app).get(`/cells/${cellId}/comments/${listComments[0]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('PUT /cells/:cellId/comments/:commentId', () => {
    it('OK, edit comment', done => {
        request(app).put(`/cells/${cellId}/comments/${listComments[0]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({body: 'Comment Edited'})
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
    it('OK, edit comment again', done => {
        request(app).put(`/cells/${cellId}/comments/${listComments[0]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .send({body: 'Comment Edited Again'})
            .then(res => {
                const body = res.body
                expect(res.statusCode).to.equals(200)
                expect(body).to.contain.property('comment')
                done()
            })
            .catch((error) => done(error))
    })
})

describe('DELETE /cells/:cellId/comments/:commentId', () => {
    it('OK, delete comment comment', done => {
        request(app).delete(`/cells/${cellId}/comments/${listComments[1]._id}`)
            .set({ 'x-access-token': owner.tokenKey })
            .then(res => {
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((error) => done(error))
    })
})

