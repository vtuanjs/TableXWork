'use strict'
const expect = require('chai').expect
const request = require('supertest')
const app = require('../../../app')
const redis = require('../../helpers/redis')

let owner
let tableId = ''
let rowId = ''
let columnId = ''
let listCells = ''
let userIds = ''
let anMember
let nonMember

describe('PREPARE TESTING CELL', () => {
    it('Ok, login user account', done => {
        request(app).post(`/auths/login`).send({
            email: 'tuan.nv@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            owner = body.user
            done()
        }).catch(error => done(error))
    })
    it('OK, get table Id', done => {
        redis.get('listTables').then(data => {
            tableId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
    it('OK, get row Id', done => {
        redis.get('listRows').then(data => {
            rowId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
    it('OK, get col Id', done => {
        redis.get('listColumns').then(data => {
            columnId = JSON.parse(data)[0]._id
            done()
        }).catch(error => done(error))
    })
})

describe('POST /tables/:tableId/cells', () => {
    it('OK, create Cell 1', done => {
        request(app).post(`/tables/${tableId}/cells`).set({
            'x-access-token': owner.tokenKey
        }).send({
            body: 'Cell 1',
            rowId,
            columnId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            expect(body.cell.body).to.equals('Cell 1')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Cell 2', done => {
        request(app).post(`/tables/${tableId}/cells`).set({
            'x-access-token': owner.tokenKey
        }).send({
            body: 'Cell 2',
            rowId,
            columnId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            expect(body.cell.body).to.equals('Cell 2')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Cell 3', done => {
        request(app).post(`/tables/${tableId}/cells`).set({
            'x-access-token': owner.tokenKey
        }).send({
            body: 'Cell 3',
            rowId,
            columnId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            expect(body.cell.body).to.equals('Cell 3')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Cell 4', done => {
        request(app).post(`/tables/${tableId}/cells`).set({
            'x-access-token': owner.tokenKey
        }).send({
            body: 'Cell 4',
            rowId,
            columnId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            expect(body.cell.body).to.equals('Cell 4')
            done()
        }).catch((error) => done(error))
    })
    it('OK, create Cell 5', done => {
        request(app).post(`/tables/${tableId}/cells`).set({
            'x-access-token': owner.tokenKey
        }).send({
            body: 'Cell 5',
            rowId,
            columnId
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            expect(body.cell.body).to.equals('Cell 5')
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /tables/:tableId/cells', () => {
    it('Get cells in table', done => {
        request(app).get(`/tables/${tableId}/cells`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            listCells = body.cells
            redis.setex('listCells', 360, JSON.stringify(listCells))
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cells')
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /tables/:tableId/cells/:cellId', () => {
    it('Get cells in table', done => {
        request(app).get(`/tables/${tableId}/cells/${listCells[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            done()
        }).catch((error) => done(error))
    })
})

describe('DELETE /tables/:tableId/cells/:cellId', () => {
    it('Delete cell in table', done => {
        request(app).delete(`/tables/${tableId}/cells/${listCells[4]._id}`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('raw')
            expect(body.raw.ok).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
})

describe('UPDATE /tables/:tableId/cells/:cellId', () => {
    it('Update cell in table', done => {
        request(app).put(`/tables/${tableId}/cells/${listCells[0]._id}`).set({
            'x-access-token': owner.tokenKey
        }).send({
            body: 'Cell update',
            description: 'Cell description update'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('cell')
            expect(body.cell.body).to.equals('Cell update')
            expect(body.cell.description).to.equals('Cell description update')
            done()
        }).catch((error) => done(error))
    })
})

describe('PREPARE ADD MEMBERS', () => {
    it('OK, get userIds will add to table', done => {
        redis.get('userIds').then(data => {
            userIds = JSON.parse(data)
            done()
        }).catch(error => done(error))
    })
    it('OK, login single user will add to table', done => {
        request(app).post(`/auths/login`).send({
            email: 'ngocancsdl@gmail.com',
            password: '12345678d'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            anMember = body.user
            done()
        }).catch(error => done(error))
    })
    it('OK, login non-member table to test permistion', done => {
        request(app).post(`/auths/login`).send({
            email: 'mai.huong@amavi.asia',
            password: '12345678c'
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            nonMember = body.user
            done()
        }).catch(error => done(error))
    })
})

describe('POST /tables/:tableId/cells/:cellId/add-members', () => {
    it('OK, add list members to cell', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: userIds.slice(0, 4)
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to cell', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: anMember._id
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('OK, add single member to cell', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[3]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: anMember._id
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, wrong userId', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[0]._id}/add-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: '5d9468959767571303701cf8'
        }).then(res => {
            expect(res.statusCode).to.equals(400)
            done()
        }).catch((error) => done(error))
    })
    it('FAIL, not permistion add member to cell', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[0]._id}/add-members`).set({
            'x-access-token': nonMember.tokenKey
        }).send({
            userIds: anMember._id
        }).then(res => {
            expect(res.statusCode).to.equals(403)
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /tables/:tableId/cells/:cellId/remove-members', () => {
    it('OK, remove members in cell', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[3]._id}/remove-members`).set({
            'x-access-token': owner.tokenKey
        }).send({
            userIds: anMember._id
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body.raw.ok).to.equals(1)
            done()
        }).catch((error) => done(error))
    })
})

describe('GET /tables/:tableId/cells/:cellId/show-members', () => {
    it('OK, show members in cell', done => {
        request(app).get(`/tables/${tableId}/cells/${listCells[0]._id}/show-members`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            expect(body).to.contain.property('members')
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /tables/:tableId/cells/:cellId/change-user-role', () => {
    it('OK, change user role', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[0]._id}/change-user-role?userId=${anMember._id}&role=admin`).set({
            'x-access-token': owner.tokenKey
        }).then(res => {
            const body = res.body
            expect(res.statusCode).to.equals(200)
            body.user.cells.every(cell => {
                expect(cell).to.contain.property('role', 'admin')
            })
            done()
        }).catch((error) => done(error))
    })
})

describe('POST /tables/:tableId/cells/:cellId/leave-cell', () => {
    it('OK, leave cell', done => {
        request(app).post(`/tables/${tableId}/cells/${listCells[0]._id}/leave-cell`).set({
            'x-access-token': anMember.tokenKey
        }).then(res => {
            expect(res.statusCode).to.equals(200)
            done()
        }).catch(error => done(error))
    })
})