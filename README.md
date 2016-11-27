# Yalu

Yet another log-update.

## Install

```bash
npm i -S yalu
```

## Usage

```javascript
const logger = require('yalu')(process.stdout)
const frames = '-\\|/'

const log = logger.log('In progress', frames[0])

let i = 1

setInterval(() => {
  logger.update(log, 'In progress', frames[i])
  i = (i + 1) % frames.length
}, 80)
```

## API

### yalu(stream = process.stdout)

Create a logger instance.

### logger.log(...content)

Log to the stream, returns id of the log.

### logger.update(id, ...content)

Update content of the log.

### logger.persist(id)

Mark the log as persistent.

### logger.finalize(id, ...content)

Update the log and mark it as persistent immediately.

### logger.persistLog(...content)

Log to the stream and mark it as persistent immediately.
