const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

const { registerUser, loginUser, getProfile, updateUserProfile } = require('../controllers/authController');
const { getMyRides, addRide, updateRide, deleteRide } = require('../controllers/rideController');
const { requestBooking, decideBooking } = require('../controllers/bookingController');

const { expect } = chai;

function mockRes() {
    return {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
    };
}

describe('Auth Controller', () => {
    afterEach(() => sinon.restore());

    it('registerUser: creates new user and returns token', async () => {
        const req = { body: { name: 'A', email: 'a@a.com', password: 'p' } };
        const res = mockRes();

        sinon.stub(User, 'findOne').resolves(null);
        const created = { id: new mongoose.Types.ObjectId().toString(), name: 'A', email: 'a@a.com' };
        sinon.stub(User, 'create').resolves(created);
        sinon.stub(jwt, 'sign').returns('testtoken');

        await registerUser(req, res);

        expect(User.findOne.calledOnceWith({ email: 'a@a.com' })).to.be.true;
        expect(User.create.calledOnce).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const payload = res.json.firstCall.args[0];
        expect(payload).to.include.keys(['id', 'name', 'email', 'token']);
    });

    it('registerUser: rejects if user exists', async () => {
        const req = { body: { name: 'A', email: 'a@a.com', password: 'p' } };
        const res = mockRes();
        sinon.stub(User, 'findOne').resolves({ _id: 'x' });

        await registerUser(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    it('loginUser: returns token when credentials ok', async () => {
        const req = { body: { email: 'a@a.com', password: 'p' } };
        const res = mockRes();
        sinon.stub(User, 'findOne').resolves({ id: 'u1', name: 'A', email: 'a@a.com', password: 'hash' });
        sinon.stub(bcrypt, 'compare').resolves(true);
        sinon.stub(jwt, 'sign').returns('testtoken');

        await loginUser(req, res);

        expect(res.json.calledOnce).to.be.true;
        const payload = res.json.firstCall.args[0];
        expect(payload).to.include({ name: 'A', email: 'a@a.com' });
        expect(payload).to.have.property('token', 'testtoken');
    });

    it('loginUser: 401 on invalid credentials', async () => {
        const req = { body: { email: 'a@a.com', password: 'bad' } };
        const res = mockRes();
        sinon.stub(User, 'findOne').resolves({ password: 'hash' });
        sinon.stub(bcrypt, 'compare').resolves(false);

        await loginUser(req, res);
        expect(res.status.calledWith(401)).to.be.true;
    });

    it('getProfile: returns user info from protect middleware', async () => {
        const req = { user: { name: 'A', email: 'a@a.com', university: 'U', address: 'Addr' } };
        const res = mockRes();
        await getProfile(req, res);
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
    });

    it('updateUserProfile: updates fields and returns new token', async () => {
        const saved = {
            id: 'u1', name: 'B', email: 'b@b.com', university: 'U2', address: 'Addr2',
            save: sinon.stub().resolvesThis(),
        };
        const req = { user: saved, body: { name: 'B', email: 'b@b.com', university: 'U2', address: 'Addr2' } };
        const res = mockRes();
        sinon.stub(jwt, 'sign').returns('newtoken');

        await updateUserProfile(req, res);

        expect(saved.save.calledOnce).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const payload = res.json.firstCall.args[0];
        expect(payload).to.include({ name: 'B', email: 'b@b.com' });
        expect(payload).to.have.property('token', 'newtoken');
    });
});

describe('Ride Controller', () => {
    afterEach(() => sinon.restore());

    it('getMyRides: returns rides for driver', async () => {
        const driverId = new mongoose.Types.ObjectId();
        const req = { user: { _id: driverId } };
        const res = mockRes();

        const rides = [{ _id: 'r1' }, { _id: 'r2' }];
        const sortStub = sinon.stub().resolves(rides);
        sinon.stub(Ride, 'find').returns({ sort: sortStub });

        await getMyRides(req, res);

        expect(Ride.find.calledOnceWith({ driver: driverId })).to.be.true;
        expect(res.json.calledWith(rides)).to.be.true;
    });

    it('addRide: creates ride and emits event', async () => {
        const req = {
            user: { _id: new mongoose.Types.ObjectId() },
            body: {
                seatsTotal: 3, seatsAvailable: 3,
                pickup: { label: 'A', location: { type: 'Point', coordinates: [1, 2] } },
                dropoff: { label: 'B', location: { type: 'Point', coordinates: [3, 4] } },
                departAt: new Date(), price: 0, notes: 'n'
            },
            app: { get: sinon.stub().withArgs('io').returns({ emit: sinon.stub() }) }
        };
        const res = mockRes();
        const created = { _id: 'r1', ...req.body, driver: req.user._id };
        sinon.stub(Ride, 'create').resolves(created);

        await addRide(req, res);

        expect(Ride.create.calledOnce).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(created)).to.be.true;
    });

    it('updateRide: only driver can update', async () => {
        const driverId = new mongoose.Types.ObjectId();
        const otherId = new mongoose.Types.ObjectId();
        const req = {
            params: { id: 'r1' }, user: { _id: otherId }, body: { price: 10 },
            app: { get: sinon.stub().withArgs('io').returns({ emit: sinon.stub() }) }
        };
        const res = mockRes();
        sinon.stub(Ride, 'findById').resolves({ _id: 'r1', driver: driverId });

        await updateRide(req, res);
        expect(res.status.calledWith(403)).to.be.true;
    });

    it('updateRide: driver updates successfully', async () => {
        const driverId = new mongoose.Types.ObjectId();
        const saved = { _id: 'r1', driver: driverId, price: 0, save: sinon.stub().resolvesThis() };
        const req = {
            params: { id: 'r1' }, user: { _id: driverId }, body: { price: 25 },
            app: { get: sinon.stub().withArgs('io').returns({ emit: sinon.stub() }) }
        };
        const res = mockRes();
        sinon.stub(Ride, 'findById').resolves(saved);

        await updateRide(req, res);

        expect(saved.save.calledOnce).to.be.true;
        expect(saved.price).to.equal(25);
        expect(res.json.calledOnce).to.be.true;
    });

    it('deleteRide: driver deletes', async () => {
        const driverId = new mongoose.Types.ObjectId();
        const rideDoc = { _id: 'r1', driver: driverId, deleteOne: sinon.stub().resolves() };
        const req = {
            params: { id: 'r1' }, user: { _id: driverId },
            app: { get: sinon.stub().withArgs('io').returns({ emit: sinon.stub() }) }
        };
        const res = mockRes();
        sinon.stub(Ride, 'findById').resolves(rideDoc);

        await deleteRide(req, res);

        expect(rideDoc.deleteOne.calledOnce).to.be.true;
        expect(res.json.calledWith({ message: 'Ride deleted' })).to.be.true;
    });
});

describe('Booking Controller', () => {
    afterEach(() => sinon.restore());

    it('requestBooking: creates booking when not driver', async () => {
        const driverId = new mongoose.Types.ObjectId();
        const passengerId = new mongoose.Types.ObjectId();

        const ride = { _id: 'r1', driver: driverId };
        sinon.stub(Ride, 'findById').resolves(ride);

        const req = {
            body: { rideId: 'r1', seats: 1, message: '' },
            user: { _id: passengerId },
            app: { get: sinon.stub().withArgs('io').returns({ emit: sinon.stub() }) }
        };
        const res = mockRes();

        const created = { _id: 'b1', ride: 'r1', passenger: passengerId, seats: 1, message: '' };
        sinon.stub(Booking, 'create').resolves(created);

        await requestBooking(req, res);

        expect(Booking.create.calledOnce).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(created)).to.be.true;
    });

    it('requestBooking: rejects booking own ride', async () => {
        const driverId = new mongoose.Types.ObjectId();
        const ride = { _id: 'r1', driver: driverId };
        sinon.stub(Ride, 'findById').resolves(ride);

        const req = {
            body: { rideId: 'r1', seats: 1 },
            user: { _id: driverId },
            app: { get: sinon.stub().withArgs('io').returns({ emit: sinon.stub() }) }
        };
        const res = mockRes();

        await requestBooking(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });
});
