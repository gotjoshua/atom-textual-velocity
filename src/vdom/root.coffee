h = require('virtual-dom/h')
scrollableList = require('./scrollable-list')
th = require('./th')
{ mouseMoveDiff } = require('../dom-streams')

module.exports = (data, columns, buses) ->
  { items, reverseStripes, bodyHeight } = data
  { searchBus, bodyHeightBus } = buses

  return h 'div.atom-notational', [
    h 'atom-text-editor', {
      attributes: #custom ones
        placeholdertext: 'Search, or press enter to create a new untitled file'
        mini: 'true'
      onkeydown: (ev) ->
        setTimeout =>
          searchBus.push @model.getText()
        , 0
    }

    h 'div.header',
      h 'table',
        h 'thead',
          h 'tr', columns.map ({ width, title }) ->
            th width, title

    scrollableList data, buses,
      h 'table', [
        h 'thead.only-for-column-widths',
          h 'tr', columns.map ({ width }) ->
            th width
        h 'tbody', {
          className: 'is-reversed-stripes' if reverseStripes
        }, items.map (item) ->
          h 'tr', columns.map ({ cellContent }) ->
            h 'td', cellContent(item)
      ]
    h 'div.resize-handle', {
      onmousedown: (ev) ->
        mouseMoveDiff(ev).onValue (diff) ->
          bodyHeightBus.push bodyHeight + diff.clientY
    }
  ]
