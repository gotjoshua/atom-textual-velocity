import fs from 'fs'
import Bacon from 'fs'

declare type InteractorType = {
  editCellNameP: Bacon.Property,
  forcedScrollTopP: Bacon.Property,
  listHeightP: Bacon.Property,
  loadingS: Bacon.Stream,
  notesP: Bacon.Property,
  notesPathP: Bacon.Property,
  openFileS: Bacon.Stream,
  paginationP: Bacon.Property,
  rowHeightP: Bacon.Property,
  saveEditedCellContentS: Bacon.Stream,
  selectedPathS: Bacon.Stream,
  sifterResultP: Bacon.Property
}
