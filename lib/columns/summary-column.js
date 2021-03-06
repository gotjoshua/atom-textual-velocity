/* @flow */

const MAX_PREVIEW_LENGTH = 400 // characters
const HIGHLIGHT_PREVIEW_PADDING_LENGTH = 20 // characters

export default class SummaryColumn {

  _editCellName: string
  _sortField: string
  editCellStr: void | (note: NoteType) => string

  constructor (params: {editCellName: string, sortField: string}) {
    this._editCellName = params.editCellName
    this._sortField = params.sortField
  }

  get sortField (): string {
    return this._sortField
  }

  get title (): string {
    return 'Summary'
  }

  get description (): string {
    return 'File name and content preview'
  }

  get width (): number {
    return 48
  }

  get editCellName (): string | void {
    return this._editCellName
  }

  editCellStr (note: NoteType): string {
    return note.name + note.ext
  }

  cellContent (params: CellContentParamsType): CellContentType {
    const {note, searchMatch} = params
    return [
      searchMatch && searchMatch.content(note.name) || note.name,
      {content: note.ext, attrs: {className: 'text-subtle'}},
      ' - ',
      this._preview(note, searchMatch)
    ]
  }

  _preview (note: NoteType, searchMatch?: SearchMatchType): Object {
    const str = note.content
    let content

    if (str) {
      content = searchMatch && searchMatch.content(str)
      if (content) {
        const highlightStart = str.indexOf(content[1].content)
        const highlightEnd = content[1].content.length
        const start = Math.max(0, highlightStart - HIGHLIGHT_PREVIEW_PADDING_LENGTH)
        content[0] = (start > 0 ? '…' : '') + content[0].slice(start, highlightStart)
        content[2] = content[2].slice(0, Math.max(0, MAX_PREVIEW_LENGTH - (highlightStart + highlightEnd)))
      }
    }

    return {
      attrs: {className: 'text-subtle'},
      content: content || str && str.slice(0, MAX_PREVIEW_LENGTH)
    }
  }
}
