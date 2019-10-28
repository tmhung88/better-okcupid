import Dexie from 'dexie'

const db = new Dexie('okc')
db.version(1).stores({
  profiles: 'id',
  answers: 'id',
  answered_questions: 'id',
  bookmarked_questions: 'id',
  sessions: 'id',
  questions: 'id',
})
export default db
