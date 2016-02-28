'use babel'

import { React, TestUtils } from 'react-for-atom'
import TagsComponent from '../../../lib/react/cells/tags-component'

describe('react/cells/tags-component', function () {
  let renderer, r, tags

  beforeEach(function () {
    renderer = TestUtils.createRenderer()
    tags = 'a b c'
  })

  it('renders tags as indidvidual items', function () {
    renderer.render(<TagsComponent tags={tags} isSelected={false} />)
    r = renderer.getRenderOutput()
    expect(r.props.children.length).toBe(3)
    expect(r.props.children[0]).toEqual(<span key='a' className='inline-block highlight'>a</span>)
    expect(r.props.children[1]).toEqual(<span key='b' className='inline-block highlight'>b</span>)
    expect(r.props.children[2]).toEqual(<span key='c' className='inline-block highlight'>c</span>)
  })

  it('does nothing on click since not selected', function () {
    r.props.onClick()
    expect(r.props.children.length).toBe(3)
  })

  describe('when clicked and is selected', function () {
    beforeEach(function () {
      renderer.render(<TagsComponent tags={tags} isSelected={true} />)
      r = renderer.getRenderOutput()
      r.props.onClick()
      r = renderer.getRenderOutput() // to get updated output
    })

    it('should render an edit component instead', function () {
      expect(r.props.children.type.displayName).toEqual('edit-component')
    })
  })
})