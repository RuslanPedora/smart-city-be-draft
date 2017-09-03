'use strict';
const DB_URL = 'mongodb://localhost:27017/mydb';
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');
const passwordHash = require('password-hash');

const validator = require('./validator');
//--------------------------------------------------------------------------------
const CUSTOMER_COLL_NAME = 'customers';
const USER_COLL_NAME = 'users';
//--------------------------------------------------------------------------------
function promiseWrapper(func) {
    return (req, res, next) => {
        new Promise((resolve,reject) => resolve(func(req,res,next)))
            .catch(err => next(err));
    };
}
//--------------------------------------------------------------------------------
function restifyCustomers(router) {
    const customerIRU = restify.serve(
        router,
        mongoose.model(
            CUSTOMER_COLL_NAME,
            new mongoose.Schema({
                name: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String
                },
                address: {
                    type: String
                }
            })
        ),{});

    console.log(`Customer URI : ${customerIRU}`);
}
//--------------------------------------------------------------------------------
function userValisator(req, res, next) {
    const isUserValid = validator.isUserValid(req);

    if (isUserValid.error) {
        next(isUserValid.error);
    }
    req.body.password = passwordHash.generate(req.body.password);
    next();
}
//--------------------------------------------------------------------------------
function restifyUsers(router) {
    const customerIRU = restify.serve(
        router,
        mongoose.model(
            USER_COLL_NAME,
            new mongoose.Schema({
                name: {
                    type: String,
                    required: true
                },
                email: {
                    type: String
                },
                password: {
                    type: String
                }
            })
        ),{
            preCreate: promiseWrapper(userValisator)
        });

    console.log(`User URI : ${customerIRU}`);
}
//--------------------------------------------------------------------------------
function restifyDB(router, onError) {
    restify.defaults({
        prefix: '/api',
        version: '',
        onError: onError
    });

    mongoose.Promise = global.Promise;
    mongoose.connection.openUri(DB_URL);
    mongoose.connection.on('error', () =>
        console.log(`Mogoose connection failed URL : ${DB_URL}`
        ));
    mongoose.connection.on('open', () => {
        console.log(`Mongoose connection succeful URL : ${DB_URL}`);

        restifyCustomers(router);
        restifyUsers(router);
    });
}
//--------------------------------------------------------------------------------
module.exports = {
    restifyDB
};
