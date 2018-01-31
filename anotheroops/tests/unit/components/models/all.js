const GroupsTest = require('./groups');

class ModelsTests {
    constructor() {}

    static runTests() {
        return this.testGroups();
    }

    static testGroups() {
        return GroupsTest.runTests();
    }
}

module.exports = ModelsTests;
