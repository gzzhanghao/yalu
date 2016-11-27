import util from 'util'
import termSize from 'term-size'
import wrapAnsi from 'wrap-ansi'
import ansiEscapes from 'ansi-escapes'

const wrap = (content, cols) => wrapAnsi(content, cols, { hard: true, wordWrap: false })

const cursorUp = ansiEscapes.cursorUp
const eraseLines = ansiEscapes.eraseLines
const savePos = ansiEscapes.cursorSavePosition
const resetPos = ansiEscapes.cursorRestorePosition

class Logger {

  constructor(stream = process.stdout) {
    this.stream = stream
    this.msgs = Object.create(null)
    this.persistId = 0
    this.nextId = 0
    this.rows = 0
  }

  log(...args) {
    const content = util.format(...args)
    const text = wrap(content, termSize().width)
    const rows = text.split('\n').length

    this.msgs[this.nextId] = { content, rows, pos: this.rows }
    this.stream.write(resetPos + text + '\n' + savePos)
    this.rows += rows

    return this.nextId++
  }

  update(id, ...args) {
    const msg = this.msgs[id]

    if (!msg) {
      return
    }

    msg.content = util.format(...args)

    const termWidth = termSize().width
    const rows = this.rows - msg.pos
    const text = wrap(msg.content, termWidth)

    if (msg.rows === text.split('\n').length) {
      this.stream.write(resetPos + cursorUp(rows - msg.rows + 1) + eraseLines(msg.rows) + text + resetPos)
      return
    }

    let buffer = cursorUp(1) + eraseLines(rows)

    this.rows = msg.pos

    for (let i = id; i < this.nextId; i++) {
      const msg = this.msgs[i]
      const text = wrap(msg.content, termWidth)

      msg.rows = text.split('\n').length
      msg.pos = this.rows

      this.rows += msg.rows
      buffer += text + '\n'
    }

    this.stream.write(resetPos + buffer + savePos)
  }

  persist(id) {
    const msg = this.msgs[id]

    if (!msg) {
      return
    }

    msg.persistent = true

    for (let i = this.persistId; i < this.nextId; i++) {
      if (!this.msgs[i].persistent) {
        break
      }
      delete this.msgs[id]
      this.persistId = i + 1
    }
  }

  finalize(id, ...args) {
    this.update(id, ...args)
    this.persist(id)
  }

  persistLog(...args) {
    this.persist(this.log(...args))
  }
}

module.exports = stream => new Logger(stream)
