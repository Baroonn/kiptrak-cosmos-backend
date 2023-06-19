const getUserByUsername = (username)=>{
    return {
        query: "select * from users u where u.username=@username",
        parameters: [
            {
                name: "@username",
                value: username
            }
        ]
    }
}

const getUserByEmail = (email)=>{
    return {
        query: "select * from users u where u.email=@email",
        parameters: [
            {
                name: "@email",
                value: email
            }
        ]
    }
}

const getUserByPhone = (phone)=>{
    return {
        query: "select * from users u where u.phone=@phone",
        parameters: [
            {
                name: "@phone",
                value: phone
            }
        ]
    }
}

module.exports = {
    getUserByUsername,
    getUserByPhone,
    getUserByEmail
}