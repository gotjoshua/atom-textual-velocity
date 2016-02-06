'use babel'

import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'
import BaconMixin from './baconjs-mixin'

export default React.createClass({

  mixins: [BaconMixin],

  propTypes: {
    children: React.PropTypes.element,
    panelHeight: React.PropTypes.number,
    rowHeight: React.PropTypes.number,
    itemsCount: React.PropTypes.number,
    offset: React.PropTypes.number,
    scrollTop: React.PropTypes.number,
    scrollTopBus: React.PropTypes.object
  },

  getInitialState () {
    return {
      isForcedScroll: false,
      isScrolling: false
    }
  },

  componentWillMount () {
    this.addBaconSideEffect(
      this.props.scrollTopBus
        .debounce(500)
        .onValue(() =>
          this.setState({ isScrolling: false })
        ))

    this._debouncedResetForcedScroll = debounce(() => {
      this.setState({ isForcedScroll: false })
    }, 100)
  },

  render () {
    return (
      <div onScroll={this._onScroll} style={{
        // Define the scrollable container
        height: this.props.panelHeight,
        overflowY: 'scroll'}}>
        <div style={{
          position: 'relative',

          // Calc list height based on current itemsCount
          height: this.props.rowHeight * this.props.itemsCount,

          // Disable pointer-events for smooth scrolling to work as expected
          // From https://github.com/facebook/react/issues/2295#issuecomment-104944111
          pointerEvents: this.state.isScrolling ? 'none' : 'auto'}}>
          <div style={{
            // Position current results chunk within the list based on its offset
            top: this.props.rowHeight * this.props.offset,
            position: 'relative'}}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  },

  componentWillReceiveProps (nextProps) {
    // If next scrollTop value doesn't match current it means it's a "forced scroll" from somewhere else
    // So indicate this to avoid pushing additional scroll
    // Will be reset after the debounce
    if (nextProps.scrollTop !== ReactDOM.findDOMNode(this).scrollTop) {
      this.setState({ isForcedScroll: true })
      this._debouncedResetForcedScroll()
    }
  },

  componentDidUpdate () {
    if (!this.state.isScrolling) {
      ReactDOM.findDOMNode(this).scrollTop = this.props.scrollTop
    }
  },

  _onScroll (ev) {
    if (!this.state.isForcedScroll) {
      this.setState({ isScrolling: true })
      this.props.scrollTopBus.push(ev.target.scrollTop)
    }
  }

})