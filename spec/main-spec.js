'use babel'
/* global CustomEvent */

import Path from 'path'
import R from 'ramda'
import fixUnbalancedConsoleGroups from './fix-unbalanced-console.groups'

describe('textual-velocity main', () => {
  fixUnbalancedConsoleGroups()

  beforeEach(function () {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    this.workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(this.workspaceElement)

    spyOn(console, 'log').andCallThrough()
    atom.config.set('textual-velocity.enableDeveloperConsoleLog', true)
    atom.config.set('textual-velocity.path', __dirname) // ./spec

    // Spy on fatal notifications to extract activationErroror, to re-throw it here
    spyOn(atom.notifications, 'addFatalError').andCallFake((msg, d) => {
      const err = new Error([msg, d.detail, d.stack].join('\n'))
      jasmine.getEnv().currentSpec.fail(err)
    })
    spyOn(console, 'error').andCallFake(msg => {
      const err = new Error(msg)
      jasmine.getEnv().currentSpec.fail(err)
    })

    atom.configDirPath = Path.join(__dirname, 'fixtures')
  })

  it('package is lazy-loaded', function () {
    expect(atom.packages.isPackageLoaded('textual-velocity')).toBe(false)
    expect(atom.packages.isPackageActive('textual-velocity')).toBe(false)
  })

  describe('when start-session command is triggered', function () {
    beforeEach(function () {
      const promise = atom.packages.activatePackage('textual-velocity')
      this.workspaceElement.dispatchEvent(new CustomEvent('textual-velocity:start-session', {bubbles: true}))
      waitsForPromise(() => {
        return promise
      })

      runs(() => {
        this.panel = R.last(atom.workspace.getTopPanels())
      })
    })

    afterEach(function () {
    })

    it('creates a top panel for the session', function () {
      expect(this.panel.getItem().querySelector('.textual-velocity')).toEqual(jasmine.any(HTMLElement))
    })

    describe('when files are loaded', function () {
      beforeEach(function () {
        waitsFor(() => {
          return R.last(console.log.calls).args[0] === 'displayResults'
        })
      })

      it('should preview files until contents and metadata are loaded', function () {
        expect(this.panel.getItem().innerHTML).toContain('columns')
        expect(this.panel.getItem().innerHTML).toContain('rows')
      })
    })
  })
})
