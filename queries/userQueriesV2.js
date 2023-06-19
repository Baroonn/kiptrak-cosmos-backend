const getUsers = (searchTerm)=>{
    return {
        query: "select u.id, u.username, u.created from users u where CONTAINS(u.username, @searchTerm, false)",
        parameters: [
            {
                name: "@searchTerm",
                value: searchTerm
            }
        ]
    }
}

const getUser = (username)=>{
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

module.exports = {
    getUser, 
    getUsers
};