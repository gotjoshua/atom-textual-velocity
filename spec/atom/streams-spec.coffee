atoms = require '../../src/atom/streams'

describe 'Projects', ->
  beforeEach ->
    spyOn(atom.project, 'getPaths').andReturn(['/tmp/1st', '/tmp/2nd']) # Initial paths
    { addedStream, removedStream } = atoms.projectsPaths()
    @addSpy = jasmine.createSpy('addedStream')
    @removeSpy = jasmine.createSpy('removedStream')
    addedStream.onValue(@addSpy)
    removedStream.onValue(@removeSpy)

    waitsFor =>
      @addSpy.calls.length is 2

    runs ->
      # Simulate adding/removing some paths after initialized
      atom.project.emitter.emit('did-change-paths', ['/tmp/1st', '/tmp/2nd', '/tmp/3rd']) # add 3rd
      atom.project.emitter.emit('did-change-paths', ['/tmp/1st', '/tmp/3rd']) # remove 2nd
      atom.project.emitter.emit('did-change-paths', ['/tmp/3rd', '/tmp/4th', '/tmp/5th']) # remove 1st, add 4th and 5th

    waitsFor =>
      @addSpy.calls.length is 5

  it 'triggers an add event for each initial path', ->
    expect(@addSpy).toHaveBeenCalled()
    expect(@addSpy.calls[0].args[0]).toEqual('/tmp/1st')
    expect(@addSpy.calls[1].args[0]).toEqual('/tmp/2nd')

  it 'triggers an add event for each new path added after that', ->
    expect(@addSpy.calls[2].args[0]).toEqual('/tmp/3rd')
    expect(@addSpy.calls[3].args[0]).toEqual('/tmp/4th')
    expect(@addSpy.calls[4].args[0]).toEqual('/tmp/5th')

  it 'triggers a remove event for each path removed after that', ->
    expect(@removeSpy).toHaveBeenCalled()
    expect(@removeSpy.calls[0].args[0]).toEqual('/tmp/2nd')
    expect(@removeSpy.calls[1].args[0]).toEqual('/tmp/1st')
