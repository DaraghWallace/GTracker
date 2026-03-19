export type user = {
  userId: string, // PK
  email: string,
  nickname: string,
  userType: string,
  cur_weight: number,
  tar_weight: number,
}

export type session = {
  sessionId: string, // PK
  userId: string,
  date: string
  focus: string | null
  notes: string | null
}
