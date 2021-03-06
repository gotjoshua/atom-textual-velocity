/* @flow */

import fs from 'fs-plus'

export default class FileIconColumn {

  _sortField: string

  constructor (params: {sortField: string}) {
    this._sortField = params.sortField
  }

  get sortField (): string {
    return this._sortField
  }

  get title (): string {
    return ''
  }

  get description (): string {
    return 'File extension'
  }

  get width (): number {
    return 2
  }

  cellContent (params: CellContentParamsType): CellContentType {
    const {note} = params
    return {
      attrs: {
        className: this._iconClassForBasename(params.path, note),
        'data-name': note.name + note.ext
      }
    }
  }

  _iconClassForBasename (path: string, note: NoteType) {
    // from https://github.com/atom/tree-view/blob/9dcc89fc0c8505528f393b5ebdd93616a8adbd68/lib/default-file-icons.coffee
    if (fs.isSymbolicLinkSync(path)) {
      return 'icon icon-file-symlink-file'
    } else if (fs.isReadmePath(path)) {
      return 'icon icon-book'
    } else if (fs.isCompressedExtension(note.ext)) {
      return 'icon icon-file-zip'
    } else if (fs.isImageExtension(note.ext)) {
      return 'icon icon-file-media'
    } else if (fs.isPdfExtension(note.ext)) {
      return 'icon icon-file-pdf'
    } else if (fs.isBinaryExtension(note.ext)) {
      return 'icon icon-file-binary'
    } else {
      return 'icon icon-file-text'
    }
  }
}
