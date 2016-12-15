/* @flow */

import Disposables from './disposables'
import Session from './session'
import Service from './service'
import nvTags from './service-consumers/nv-tags'
import renameNote from './service-consumers/rename-note'
import defaults from './service-consumers/defaults'
import defaultConfig from './default-config'
import NotesCache from './notes-cache'

const RENAME_CELL_NAME = 'rename'

export const config = defaultConfig

let disposables, notesCache, service, serviceV0, session, sessionCmds, startSessionCmd

export function activate () {
  notesCache = new NotesCache()
  service = new Service()
  serviceV0 = service.v0()
  disposables = new Disposables(
    defaults.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    renameNote.consumeServiceV0(serviceV0, RENAME_CELL_NAME),
    nvTags.consumeServiceV0(serviceV0)
  )

  startSession()
}

export function provideServiceV0 () {
  return serviceV0
}

export async function deactivate () {
  if (notesCache) {
    try {
      await notesCache.save()
    } catch (err) {
      console.warn('textual-velocity: could not cache notes', err)
    }
    notesCache.dispose()
    notesCache = null
  }

  stopSession()
  disposeStartSessionCmd()

  if (disposables) {
    disposables.dispose()
    disposables = null
  }
  if (service) {
    service.dispose()
    service = null
    serviceV0 = null
  }
}

async function startSession () {
  disposeStartSessionCmd()
  if (!notesCache || !service) return

  const notes = await notesCache.load()

  atom.workspace.observePanes(function(thisPane){
    console.log(thisPane)
    thisPane.onWillDestroyItem(function(item){
      console.log('will destroy paneitem'+item)
      atom.commands.dispatch(atom.getCurrentWindow(), 'textual-velocity:focus-on-search')
    });
  });

  var openPathOnStart = true //atom.config.get('textual-velocity.openpath')
  if(atom.config.get('textual-velocity.path') && openPathOnStart) {
    var thePath = atom.config.get('textual-velocity.path')
    console.log('opening: '+thePath)
    //atom.workspace.open(thePath).then(() => {
    atom.project.onDidChangePaths(() => {
      // Hide tree-view when package is activated
      var treeView = atom.packages.getActivePackage('tree-view').mainModule.createView()
      if (treeView.isVisible()) treeView.toggle()
      console.log(atom.workspace.getTextEditors())
      //if(atom.workspace.getTextEditors()) atom.workspace.getPanes()[0].destroyItem(atom.workspace.getTextEditors()[0])
    })
    atom.project.setPaths([thePath])
  }


  session = new Session(service, notes)

  atom.commands.dispatch(atom.getCurrentWindow(), 'textual-velocity:focus-on-search')

  sessionCmds = atom.commands.add('atom-workspace', {
    'textual-velocity:restart-session': async () => {
      stopSession()
      if (notesCache) {
        await notesCache.save()
      }
      startSession()
    },
    'textual-velocity:stop-session': () => {
      stopSession()
      startSessionCmd = atom.commands.add('atom-workspace', 'textual-velocity:start-session', startSession)
    }
  })
}

function stopSession () {
  if (sessionCmds) {
    sessionCmds.dispose()
    sessionCmds = null
  }
  if (session) {
    session.dispose()
    session = null
  }
}

function disposeStartSessionCmd () {
  if (startSessionCmd) {
    startSessionCmd.dispose()
    startSessionCmd = null
  }
}
