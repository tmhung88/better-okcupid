import moment from 'moment'

type Item = {
  value: any
  expiredAt: number
}

export class TtlCache {
  setItem(key: string, value: any, duration = 60) {
    const item: Item = {
      value,
      expiredAt: moment()
        .add(duration, 'minute')
        .valueOf(),
    }

    localStorage.setItem(key, JSON.stringify(item))
  }

  getItem(key: string): any | null {
    if (!this.isItemValid(key)) {
      return null
    }
    const item: Item = JSON.parse(localStorage.getItem(key) || '{}')
    return item.value
  }

  isItemValid(key: string): boolean {
    const rawItem = localStorage.getItem(key)
    if (!rawItem) {
      return false
    }
    const item: Item = JSON.parse(rawItem)
    if (moment().isAfter(moment(item.expiredAt))) {
      localStorage.removeItem(key)
      return false
    }
    return true
  }
}

export default new TtlCache()
