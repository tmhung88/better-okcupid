class BookmarkService<T> {
  private readonly storageKey: string
  constructor(storageKey: string) {
    this.storageKey = storageKey
  }
  bookmark(id: T): void {
    const isDuplicate = this.getAllBookmarks().some(
      bookmarkedId => id === bookmarkedId,
    )
    if (isDuplicate) {
      return
    }
    const userIds = [id, ...this.getAllBookmarks()]
    localStorage.setItem(this.storageKey, JSON.stringify(userIds))
  }

  unbookmark(deletedId: T): void {
    const userIds = this.getAllBookmarks().filter(
      id => id !== deletedId,
    )
    localStorage.setItem(this.storageKey, JSON.stringify(userIds))
  }

  getAllBookmarks(): T[] {
    const rawIds =
      localStorage.getItem(this.storageKey) || JSON.stringify([])
    return JSON.parse(rawIds)
  }
}

export const userBookmarkService = new BookmarkService<string>(
  'bookmark_user_ids',
)
export const questionStarService = new BookmarkService<number>(
  'bookmark_question_ids',
)
