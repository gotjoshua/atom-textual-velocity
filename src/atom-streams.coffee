Bacon = require 'baconjs'

fromDisposable = (obj, funcName, args...) ->
  Bacon.fromBinder (sink) ->
    args.push(sink)
    disposable = obj[funcName].apply(obj, args)
    return -> disposable.dispose()

module.exports =
  fromConfig: (key) ->
    fromDisposable(atom.config, 'observe', key)

  fromCommand: (context, command) ->
    fromDisposable(atom.commands, 'add', context, command)

  projectsPaths: ->
    lastProjectPathsProp = Bacon.sequentially(0, [[], atom.project.getPaths()])
      .merge(fromDisposable(atom.project, 'onDidChangePaths'))
      .slidingWindow(2, 2)

    fromFilteredPairs = (pairwiseStream, predicate) ->
      pairwiseStream.flatMap (pair) ->
        Bacon.sequentially(0, predicate(pair))

    return {
      openStream: fromFilteredPairs lastProjectPathsProp, ([currentPaths, newPaths]) ->
        newPaths.filter (path) ->
          currentPaths.indexOf(path) < 0

      closeStream: fromFilteredPairs lastProjectPathsProp, ([currentPaths, newPaths]) ->
        currentPaths.filter (path) ->
          newPaths.indexOf(path) < 0
    }

  cancelCommand: ->
    # double esc to trigger
    resetVimStream   = @fromCommand 'atom-text-editor.vim-mode', 'vim-mode:reset-normal-mode'
    coreCancelStream = @fromCommand 'atom-text-editor', 'core:cancel'
    resetVimStream.merge(coreCancelStream)
      .bufferWithTimeOrCount(300, 2)
      .filter (x) -> x.length is 2