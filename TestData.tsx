interface User {
    userID: String,
    username: String,
    password: String,
    email: String,
}

interface Exercise {
    exerciseID: string
    name: string
    targetGroup: string
    targetMuscle: string
    toFailure: boolean
    sets: {
        repetitions: number
        weight: number
    }[]
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

export const exerciseData: Exercise[] = [
    {
        exerciseID: "exA1",
        name: "curl",
        targetGroup: "arms",
        targetMuscle: "bicep",
        toFailure: true,
        sets: [
            {repetitions: 3, weight: 20}
        ]
    },{
        exerciseID: "exL2",
        name: "squat",
        targetGroup: "Leg",
        targetMuscle: "Glutes",
        toFailure: false,
        sets: [
            {repetitions: 2, weight: 90}
        ]
    },  
]