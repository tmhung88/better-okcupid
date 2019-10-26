const BOOKMARK_USERS_KEY = 'bookmark_user_ids'
class BookmarkService {
  bookmark(userId: string): void {
    const userIds = [userId, ...this.getAllBookmarkUsers()]
    localStorage.setItem(BOOKMARK_USERS_KEY, JSON.stringify(userIds))
  }

  unbookmark(deletedUserId: string): void {
    const userIds = this.getAllBookmarkUsers().filter(
      id => id !== deletedUserId,
    )
    localStorage.setItem(BOOKMARK_USERS_KEY, JSON.stringify(userIds))
  }

  getAllBookmarkUsers(): string[] {
    const rawUserIds =
      localStorage.getItem(BOOKMARK_USERS_KEY) || JSON.stringify([])
    return JSON.parse(rawUserIds)
  }
}

export default new BookmarkService()
