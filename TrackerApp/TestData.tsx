interface User {
    userID: String,
    username: String,
    password: String,
    email: String,
}

interface Exercise {
    exerciseID: String,
    name: String,
    targetGroup: String,
    targetMuscle: String,
    toFailure: boolean,
    sets:[
        repititions: number,
        weight: number,
    ]
}

interface Session {
    sessionID: String,
    userID: User["userID"],
    date: Date,
    focus: string
    exorsises: [Exercise[]]
}

export const userData: User[] = [
    {
        userID: "userID-a",
        username:"Billy_Bicep",
        password:"bigarmz123",
        email:"curl@arm.com",
    },{
        userID: "userID-b",
        username:"Lenneard_Leg_Day",
        password:"biglegz123",
        email:"squat@legs.com",
    },
]

