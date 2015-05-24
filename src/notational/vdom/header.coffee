h = require 'virtual-dom/h'
th = require './th.coffee'

module.exports = (columns) ->
  h 'div.header',
    h 'table',
      h 'thead',
        h 'tr', columns.map ({width, title}) ->
          th width, title