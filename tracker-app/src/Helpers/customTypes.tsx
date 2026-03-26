export type user = {
  userId: string // PK
  email: string
  nickname: string
  userType: string
  // height_cm: number,
  cur_weight: number
  tar_weight: number
  // clients: string[] //if member type is trainer
}

export type session = {
  sessionId: string // PK
  userId: string
  dateDone: string
  focus: string | null
  notes: string | null
}

export type exercise = {
  exerciseId: string // PK - uuid
  name: string //bar bell curl
  group: string // arms
  muscle: string  // bicep
  ppl: string // pull
  // demoLink: string // link to youtube vid
}

export type set = {
  setId: string // PK - uuid
  sessionId: string
  exerciseId: string
  toFailure: boolean
  weights_kgs: string
}


export type bar = {
  quote: string;
  author: string;
}
//sets
//goals

