'use babel'

import Bacon from 'baconjs'
import Path from 'path'
import Project from '../lib/project'
import * as atoms from '../lib/atom-streams'

describe('Project', () => {
  const dirStandardPath = Path.join(__dirname, 'fixtures', 'standard')
  let project, resultsSpy, r, parsedSpy
  let openProjectPathBus, closeProjectPathBus

  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout') // remove spy that screws up debounce
    openProjectPathBus = new Bacon.Bus()
    closeProjectPathBus = new Bacon.Bus()
    spyOn(atoms, 'createOpenProjectPathStream').andReturn(openProjectPathBus)
    spyOn(atoms, 'createCloseProjectPathStream').andReturn(closeProjectPathBus)

    project = new Project()

    parsedSpy = jasmine.createSpy('path parsed')
    project.parsedprojectPathStream.onValue(parsedSpy)
    resultsSpy = jasmine.createSpy('results')
    project.resultsProp.onValue(resultsSpy)
  })

  afterEach(() => {
    project.dispose()
  })

  it('should have a project', function () {
    expect(project).toBeDefined()
  })

  it('should have expected props', function () {
    expect(project.queryBus).toBeDefined()
    expect(project.filesProp).toBeDefined()
    expect(project.resultsProp).toBeDefined()
    expect(project.openProjectPathStream).toBeDefined()
    expect(project.parsedprojectPathStream).toBeDefined()
  })

  it('should trigger empty results with defaults', function () {
    const r = resultsSpy.calls[0].args[0]
    expect(r.total).toEqual(0)
    expect(r.items).toEqual([])
  })

  describe('when a project path with some standard files is opened', function () {
    beforeEach(function () {
      openProjectPathBus.push(dirStandardPath)

      waitsFor(() => {
        return parsedSpy.calls.length >= 1
      })
    })

    describe('when query w/o search string', () => {
      beforeEach(() => {
        project.queryBus.push('')
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('triggers results prop', () => {
        expect(r.query).toEqual('')
        expect(r.total).toEqual(3)
        expect(r.items.length).toEqual(3)
      })
    })

    describe('when query with search string', () => {
      beforeEach(() => {
        project.queryBus.push('thislineshouldonlyexistinonefile')
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('triggers results prop', () => {
        expect(r.query).toEqual('thislineshouldonlyexistinonefile')
        expect(r.total).toEqual(1)
        expect(r.items.length).toEqual(1)
      })
    })

    describe('when project path is closed', function () {
      beforeEach(function () {
        closeProjectPathBus.push(dirStandardPath)
        waitsFor(() => {
          return resultsSpy.calls.length >= 2
        })
        runs(() => {
          r = resultsSpy.calls[1].args[0]
        })
      })

      it('removes the items', function () {
        expect(r.total).toEqual(0)
        expect(r.items).toEqual([])
      })
    })
  })
})
