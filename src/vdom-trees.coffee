Bacon = require('baconjs')
renderRoot = require('./vdom/root.coffee')
columns = require('./columns.coffee')

module.exports = ({ bodyHeightStream, rowHeightStream, addItemsStream, removeItemsStream, removedProjectStream }, buses) ->
  { scrollTopBus, searchBus } = buses
  scrollTopProp = scrollTopBus.toProperty(0)
  rowHeightProp = rowHeightStream.toProperty()
  bodyHeightProp = bodyHeightStream
    .skipDuplicates()
    .filter (height) -> height > 0
    .toProperty()

  itemsProp = Bacon.update [],
    [addItemsStream], (items, newItem) ->
      items.concat(newItem)
    [removeItemsStream], (items, { relPath }) ->
      items.filter (item) ->
        item.relPath isnt relPath
    [removedProjectStream], (items, removedPath) ->
      items.filter ({ projectPath }) ->
        projectPath isnt removedPath

  matchedItemsProp = Bacon.combineWith (items, searchStr) ->
    if searchStr
      items.filter (item) ->
        item.relPath.search(searchStr) isnt -1
    else
      items
  , itemsProp, searchBus.toProperty('')

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp
  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  vdomTreesProp = Bacon.combineWith (data, _) ->
    renderRoot(data, columns, buses)
  , Bacon.combineTemplate {
    bodyHeight: bodyHeightProp
    rowHeight: rowHeightProp
    scrollTop: scrollTopProp

    topOffset: Bacon.combineWith (scrollTop, rowHeight) ->
      -(scrollTop % rowHeight)
    , scrollTopProp, rowHeightProp

    marginBottom: Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
      items.length * rowHeight - scrollTop - bodyHeight
    , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp

    reverseStripes: visibleBeginProp.map (begin) -> begin % 2 is 0

    items: Bacon.combineWith (items, begin, end) ->
      items.slice(begin, end)
    , matchedItemsProp, visibleBeginProp, visibleEndProp
  }#, Bacon.interval(1000, undefined)

  return vdomTreesProp.slidingWindow(2, 1)
