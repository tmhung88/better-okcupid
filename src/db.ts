import Dexie from 'dexie'

const db = new Dexie('okc')
db.version(1).stores({
  profiles: 'id,response',
  answers: 'id,response',
  answered_questions: 'id,response',
  sessions: 'id,response',
})





export default db
