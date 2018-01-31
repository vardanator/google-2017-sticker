
const UserService = require('./../../../../components/users/service');

function testGenerateUsername() {
    UserService._generateUsername('hello2', 'hello3@gmail.com', '45454545')
        .then(username => {
            console.log(username);
        })
        .catch(err => console.log(err));
}

function testGenerateAvatar() {
    UserService._generateAvatar('5973ac411a5e417c2c4da8c5')
        .then(result => console.log(result))
        .catch(err => console.log(err));
}

testGenerateAvatar();

//testGenerateUsername();
