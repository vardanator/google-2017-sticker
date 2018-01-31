
const mongoose = require('mongoose');

const ModelTests = require('./components/models/all');

class TestRunner {
    constructor() {}

    static runGroupsTests() {
        console.log('STARTING..');
        ModelTests.runTests().then(() => {
            console.log('Group tests finsished!');
        }).catch((err) => {
            console.log('Group tests failed!');
        });
    }
}

TestRunner.runGroupsTests();
