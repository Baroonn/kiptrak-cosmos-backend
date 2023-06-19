const getAssignments = (usernames)=>{
    return {
        query: "select * from assignments a where ARRAY_CONTAINS(@usernames, a.userId, false)",
        parameters: [
            {
                name: "@usernames",
                value: usernames.split(', ')
            }
        ]
    }
}

const getAssignment = (id)=>{
    return {
        query: "select * from assignments a where a.id = @id",
        parameters: [
            {
                name: "@id",
                value: id
            }
        ]
    }
}

module.exports = {
    getAssignments,
    getAssignment
}