'use babel'

import * as reactRenderer from '../lib/react-renderer'
import Interactor from '../lib/interactor'
import ViewCtrl from '../lib/view-ctrl'
import fixToEqualJasmineAny from './fix-to-equal-jasmine-any'

fixToEqualJasmineAny()

describe('view-ctrl', function () {
  beforeEach(function () {
    atom.config.set('textual-velocity.path', '~/test')
    atom.config.set('textual-velocity.listHeight', 123)
    atom.config.set('textual-velocity.rowHeight', 25)

    const presenter = {}

    this.interactor = new Interactor(presenter)
    spyOn(this.interactor, 'startSession')
    spyOn(this.interactor, 'stopSession')

    spyOn(reactRenderer, 'renderLoading').andCallThrough()
    spyOn(reactRenderer, 'renderResults').andCallThrough()
    spyOn(reactRenderer, 'remove').andCallThrough()

    this.viewCtrl = new ViewCtrl(reactRenderer)
    this.viewCtrl.setInteractor(this.interactor)
  })

  afterEach(function () {
    this.viewCtrl.deactivate()

    expect(this.viewCtrl.interactor).toBeFalsy()
    expect(this.interactor.stopSession).toHaveBeenCalled()
  })

  describe('.activate', function () {
    beforeEach(function () {
      this.viewCtrl.activate()
    })

    describe('should start session', function () {
      beforeEach(function () {
        expect(this.interactor.startSession).toHaveBeenCalled()
        this.req = this.interactor.startSession.calls[0].args[0]
      })

      it('should start session with current platform', function () {
        expect(this.req.platform).toEqual(jasmine.any(String))
      })

      it('should pass root path with value from config', function () {
        expect(this.req.rootPath).toEqual(atom.config.get('textual-velocity.path'))
      })

      it('should pass ignored filenames from config', function () {
        expect(this.req.ignoredNames).toEqual(atom.config.get('core.ignoredNames'))
      })

      it('should pass excludeVcsIgnoredPaths filenames from config', function () {
        expect(this.req.excludeVcsIgnoredPaths).toEqual(atom.config.get('core.excludeVcsIgnoredPaths'))
      })
    })
  })

  describe('.displayLoading', function () {
    beforeEach(function () {
      spyOn(atom.workspace, 'addTopPanel').andCallThrough()

      this.viewCtrl.displayLoading()
    })

    it('should create an atom panel', function () {
      expect(atom.workspace.addTopPanel).toHaveBeenCalled()
      expect(atom.workspace.addTopPanel.calls[0].args[0].item).toEqual(jasmine.any(HTMLElement))
    })

    it('should render loading', function () {
      expect(reactRenderer.renderLoading).toHaveBeenCalled()
    })

    // Should  be called after displayLoading so tested in this scope to have same prerequisite state
    describe('.displayResults', function () {
      beforeEach(function () {
        this.viewCtrl.displayResults({
          focusSearchInput: false,
          forcedScrollTop: 0,
          itemsCount: 3,
          paginationStart: 0,
          columns: [
            {title: 'Name', key: 'title', width: 70},
            {title: 'Updated', key: 'updated_date', width: 15},
            {title: 'Created', key: 'created_date', width: 15}
          ],
          rows: [
            {id: 2, title: 'foobar', created_date: '3 days ago', updated_date: 'yesterday'},
            {id: 3, title: 'baz', created_date: '3 days ago', updated_date: 'today'},
            {id: 1, title: 'qux', created_date: '1 year ago', updated_date: '1 year ago'}
          ]
        })
      })

      it('should render results', function () {
        expect(reactRenderer.renderResults).toHaveBeenCalled()
        expect(reactRenderer.renderResults).toHaveBeenCalledWith({
          DOMNode: jasmine.any(HTMLElement),
          interactor: jasmine.any(Object),
          listHeight: jasmine.any(Number),
          rowHeight: jasmine.any(Number),
          res: jasmine.any(Object)
        })
      })
    })
  })
})
