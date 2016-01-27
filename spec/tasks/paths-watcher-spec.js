'use babel'

import Path from 'path'
import {Task} from 'atom'
import sendMessageTo from '../../lib/tasks/send-message-to'

describe('PathsWatcherTask', () => {
  let task, resultsSpy, r

  beforeEach(() => {
    resultsSpy = jasmine.createSpy('results')
    task = new Task(require.resolve('../../lib/tasks/paths-watcher.js'))
    task.start()
    sendMessageTo(task, 'openProjectPath', {
      path: Path.join(__dirname, '..', 'fixtures'),
      ignoredNames: [],
      excludeVcsIgnoredPaths: true
    })
    task.on('results', resultsSpy)
  })

  afterEach(() => {
    sendMessageTo(task, 'dispose')
  })

  describe('when query w/o search string', () => {
    beforeEach(() => {
      sendMessageTo(task, 'query', {
        searchStr: '',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor(() => {
        return resultsSpy.calls.length >= 2
      })
      runs(() => {
        r = resultsSpy.calls[1].args[0]
      })
    })

    it('emits results', () => {
      expect(resultsSpy).toHaveBeenCalled()
      expect(r.total).toEqual(2)
      expect(r.items.length).toEqual(2)
    })

    it('result items has some data', () => {
      expect(r.items[0].relPath.length).toBeGreaterThan(0)
      expect(r.items[0].stat).toBeDefined()
      expect(r.items[0].stat.birthtime).toBeDefined()
    })
  })

  describe('when query w/o search string', () => {
    beforeEach(() => {
      sendMessageTo(task, 'query', {
        searchStr: 'thislineshouldonlyexistinonefile',
        paginationOffset: 0,
        paginationSize: 123
      })
      waitsFor(() => {
        return resultsSpy.calls.length >= 2
      })
      runs(() => {
        r = resultsSpy.calls[1].args[0]
      })
    })

    it('emits results', () => {
      expect(resultsSpy).toHaveBeenCalled()
      expect(r.total).toEqual(1)
      expect(r.items.length).toEqual(1)
      expect(r.items[0].relPath).toMatch(/an-example.txt$/)
    })

    it('result items has some data', () => {
      expect(r.items[0].relPath.length).toBeGreaterThan(0)
      expect(r.items[0].stat).toBeDefined()
      expect(r.items[0].stat.birthtime).toBeDefined()
    })
  })
})
