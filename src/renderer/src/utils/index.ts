/**
 * 设置时间格式
 * @param {Date} n 时间
 */
export const TimeSet = (n) => {
  return (
    n.getFullYear() +
    '-' +
    toTime(n.getMonth() + 1) +
    '-' +
    toTime(n.getDate()) +
    ' ' +
    toTime(n.getHours()) +
    ':' +
    toTime(n.getMinutes()) +
    ':' +
    toTime(n.getSeconds())
  )
}

const toTime = (n) => {
  return n < 10 ? '0' + n : '' + n
}

export function Delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
