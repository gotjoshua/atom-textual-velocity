Bacon                          = require 'baconjs'
h                              = require 'virtual-dom/h'
adjustScrollTopForSelectedItem = require './adjust-scroll-top-for-selected-item'
selectItemByRelativeOffset     = require './select-item-by-relative-offset'
search                         = require './vdom/search'
header                         = require './vdom/header'
content                        = require './vdom/content'
scrollableContent              = require './vdom/scrollable-content'
resizeHandle                   = require './vdom/resize-handle'
vdomTreeToElement              = require './vdom-tree-to-element'

# Encapsulates the general logic
module.exports = ({matchedItemsProp, searchBus, columnsProp, bodyHeightStream, rowHeightStream}) ->
  bus = {
    bodyHeight : new Bacon.Bus()
    keydown    : new Bacon.Bus()
    scrollTop  : new Bacon.Bus()
    selectItem : new Bacon.Bus()
    focus      : new Bacon.Bus()
    search     : searchBus
  }
  rowHeightProp = rowHeightStream.toProperty()

  bodyHeightProp = bodyHeightStream.merge(bus.bodyHeight)
    .skipDuplicates()
    .filter (height) -> height > 0
    .toProperty()

  resetStream        = bus.keydown.filter (ev) -> ev.keyCode is 27 #esc
  openSelectedStream = bus.keydown.filter (ev) -> ev.keyCode is 13 #enter
  moveSelectedStream = bus.keydown.filter((ev) -> ev.keyCode is 38).doAction((ev) -> ev.preventDefault()).map(-1) #up
                .merge(bus.keydown.filter((ev) -> ev.keyCode is 40).doAction((ev) -> ev.preventDefault()).map(1)) #down

  selectedItemProp = Bacon.update(undefined,
    [bus.search], -> undefined
    [bus.selectItem], (..., newItem) -> newItem
    [moveSelectedStream, matchedItemsProp], selectItemByRelativeOffset
  ).skipDuplicates()

  scrollTopProp = Bacon.update 0,
    [bus.scrollTop], (..., scrollTop) -> scrollTop
    [selectedItemProp.changes(), matchedItemsProp, rowHeightProp, bodyHeightProp], adjustScrollTopForSelectedItem

  visibleBeginProp = Bacon.combineWith (scrollTop, rowHeight) ->
    (scrollTop / rowHeight) | 0
  , scrollTopProp, rowHeightProp
  visibleEndProp = Bacon.combineWith (begin, bodyHeight, rowHeight) ->
    begin + ((bodyHeight / rowHeight) | 0) + 2 # add to avoid visible gap when scrolling
  , visibleBeginProp, bodyHeightProp, rowHeightProp

  # vdom props
  scrollableContentProp = Bacon.combineTemplate({
    bodyHeight: bodyHeightProp
    scrollTop: scrollTopProp
    content: Bacon.combineTemplate({
        columns: columnsProp
        selectedItem: selectedItemProp
        reverseStripes: visibleBeginProp.map (begin) ->
          begin % 2 is 0
        items: Bacon.combineWith (items, begin, end) ->
          items.slice(begin, end)
        , matchedItemsProp, visibleBeginProp, visibleEndProp
      }).map (data) ->
        content(data, bus.selectItem)
    topOffset: Bacon.combineWith (scrollTop, rowHeight) ->
        -(scrollTop % rowHeight)
      , scrollTopProp, rowHeightProp
    marginBottom: Bacon.combineWith (items, rowHeight, scrollTop, bodyHeight) ->
        items.length * rowHeight - scrollTop - bodyHeight
      , matchedItemsProp, rowHeightProp, scrollTopProp, bodyHeightProp
  }).map (data) ->
    scrollableContent(data, bus.scrollTop)

  resizeHandleProp = bodyHeightProp.map (bodyHeight) ->
    resizeHandle(bodyHeight, bus.bodyHeight)

  headerProp = columnsProp.map (columns) ->
    header(columns)

  vdomTreeProp = Bacon.combineWith (contentHeader, scrollableContent, resizeHandle) ->
    h 'div.atom-notational-panel', {
      onclick: -> bus.focus.push undefined
    }, [
      search(bus.search, bus.keydown)
      contentHeader
      scrollableContent
      resizeHandle
    ]
  , headerProp, scrollableContentProp, resizeHandleProp
  elementProp = vdomTreeToElement(vdomTreeProp)

  sideEffectsProp = Bacon.when(
    [selectedItemProp.changes(), elementProp], (..., el) ->
      # Scroll item into the view if outside the visible border and was triggered by selectItem change
      if selectedRow = el.querySelector('.is-selected')
        selectedRow.scrollIntoViewIfNeeded(false) # centerIfNeeded=false => croll minimal possible to avoid jumps
    [bus.focus, elementProp], (..., el) ->
      el.querySelector('.search').focus()
    [resetStream, elementProp], (..., el) ->
      el.querySelector('.search').value = ''
      bus.search.push('')
    [bus.search, elementProp], (..., el) ->
      el.querySelector('.tbody').scrollTop = 0 #return to top
  )

  # double-key press within 300ms triggers a hide event
  hideStream = resetStream.bufferWithTimeOrCount(300, 2).filter (x) ->
    x.length is 2

  return {
    elementProp           : elementProp
    resizedBodyHeightProp : bodyHeightProp
    selectedItemProp      : selectedItemProp
    openSelectedStream    : openSelectedStream
    hideStream            : hideStream
    sideEffectsProp       : sideEffectsProp
  }
