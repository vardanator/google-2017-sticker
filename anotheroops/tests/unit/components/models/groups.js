
class GroupsTest {
    constructor() {

    }

    static runTests() {
        return Promise.all([
            this.testGroupCreate(),
            this.testGroupFind(),
            this.testGroupFindOne(),
            this.testGroupUpdate(),
            this.testGroupRemove()]
        ).then(() => {
            console.log('all is good');
        }).catch((err) => {
            console.log(err);
        })
    }

    static testGroupFind() {
        console.log('testGroupFind');
        return new Promise((resolve, reject) => {
            return reject(new Error('fail'));
        });
    }

    static testGroupFindOne() {
        console.log('testGroupFindOne');
        return new Promise((resolve, reject) => {
            reject(new Error('fail'));
        });
    }

    static testGroupRemove() {
        console.log('testGroupRemove');
        return new Promise((resolve, reject) => {
            reject(new Error('fail'));
        });
    }

    static testGroupCreate() {
        return new Promise((resolve, reject) => {
            console.log('testGroupCreate');
            reject(new Error('fail'));
        });
    }

    static testGroupUpdate() {
        console.log('testGroupUpdate');
        return new Promise((resolve, reject) => {
            reject(new Error('fail'));
        });
    }
}

module.exports = GroupsTest;
