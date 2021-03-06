/* @flow */

import Bacon from 'baconjs'
import SearchMatch from './search-match'

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Presenter {

  columnHeadersP: Bacon.Property
  forcedScrollTopP: Bacon.Property
  itemsCountP: Bacon.Property
  listHeightP: Bacon.Property
  loadingProgressP: Bacon.Property
  loadingS: Bacon.Stream
  newPathP: Bacon.Property
  openPathS: Bacon.Stream
  paginationP: Bacon.Property
  rowHeightP: Bacon.Property
  rowsS: Bacon.Stream
  saveEditedCellContentS: Bacon.Stream
  searchRegexP: Bacon.Property
  searchStrP: Bacon.Property
  selectedContentP: Bacon.Property
  selectedPathP: Bacon.Property
  sortP: Bacon.Property

  constructor (int: InteractorType, columnsP: Bacon.Property) {
    this.columnHeadersP = columnsP
      .map((columns: Array<ColumnType>) => {
        return columns.map(c => ({
          title: c.title,
          sortField: c.sortField,
          width: c.width
        }))
      })

    this.forcedScrollTopP = int.forcedScrollTopP
    this.loadingS = int.loadingS
    this.paginationP = int.paginationP
    this.listHeightP = int.listHeightP
    this.rowHeightP = int.rowHeightP

    this.loadingProgressP = int.notesP
      .map(notes => {
        const filenames = Object.keys(notes)
        return {
          total: filenames.length,
          ready: filenames
            .reduce((sum, filename) => {
              if (notes[filename].ready) sum++
              return sum
            }, 0)
        }
      })
      .takeWhile(({ready, total}) => total === 0 || ready < total)
      .mapEnd({})

    this.selectedPathP = Bacon
      .combineTemplate({
        notesPath: int.notesPathP,
        filename: int.selectedFilenameS
      })
      .map(({filename, notesPath}) => filename && notesPath.fullPath(filename))

    this.selectedContentP = Bacon
      .combineTemplate({
        notes: int.notesP,
        filename: int.selectedFilenameS
      })
      .map(({notes, filename}) => notes[filename] && notes[filename].content)

    this.itemsCountP = int.sifterResultP.map('.total')
    this.searchStrP = int.searchStrS
    this.sortP = int.sifterResultP.map('.options.sort.0')
    this.searchRegexP = int.sifterResultP.map('.tokens.0.regex')

    this.rowsS = Bacon
      .combineTemplate({
        columns: columnsP,
        editCellName: int.editCellNameP,
        items: int.sifterResultP.map('.items'),
        notes: int.notesP,
        notesPath: int.notesPathP,
        pagination: int.paginationP,
        searchRegex: this.searchRegexP,
        selectedFilename: int.selectedFilenameS.toProperty(undefined)
      })
      .map((searchResult: SearchResultsType) => {
        const {columns, editCellName, items, notes, notesPath, pagination, searchRegex, selectedFilename} = searchResult

        const rows: Array<RowType> = items
          .slice(pagination.start, pagination.start + pagination.limit)
          .map((item, i) => {
            const filename = item.id
            const note = notes[filename]
            const rowSelected = filename === selectedFilename
            const contentParams = {
              note: note,
              path: notesPath.fullPath(filename),
              searchMatch: searchRegex && new SearchMatch(searchRegex)
            }

            return {
              id: note.id,
              filename: filename,
              selected: rowSelected,
              cells: columns
                .map(column => {
                  if (rowSelected && column.editCellName && column.editCellName === editCellName) {
                    return {
                      editCellStr: column.editCellStr && column.editCellStr(note) || ''
                    }
                  } else {
                    return {
                      content: column.cellContent(contentParams),
                      editCellName: column.editCellName && column.editCellName
                    }
                  }
                })
            }
          })

        return rows
      })
      .sampledBy(
        Bacon.mergeAll(
          int.paginationP.changes(),
          int.selectedFilenameS,
          int.editCellNameP.changes(),
          int.sifterResultP.toEventStream()))

    this.openPathS = int.openFileS
    this.newPathP = Bacon
      .combineTemplate({
        searchStr: this.searchStrP,
        notesPath: int.notesPathP
      })
      .map(({searchStr, notesPath}) => {
        searchStr = searchStr.trim() || 'untitled'
        const filename = HAS_FILE_EXT_REGEX.test(searchStr)
          ? searchStr
          : `${searchStr}.${atom.config.get('textual-velocity.defaultExt').replace(/^\./, '')}`
        return notesPath.fullPath(filename)
      })

    this.saveEditedCellContentS = Bacon
      .combineTemplate({
        path: this.selectedPathP,
        editCellName: int.editCellNameP,
        str: int.saveEditedCellContentS
      })
      .sampledBy(int.saveEditedCellContentS)
  }

}
