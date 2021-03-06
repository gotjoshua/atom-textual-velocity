/* @flow */

import fs from 'fs'

export default {

  notePropName: 'content',

  read (path: string, stats: FsStatsType, callback: NodeCallbackType) {
    fs.readFile(path, 'utf8', callback)
  }
}
