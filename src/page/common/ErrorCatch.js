import React from 'react';

import {Vertical} from "@gui/Flex.js";

import I18n from '@util/I18n.js'

class ErrorCatch extends React.Component {

  constructor(props) {
    
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {

    return { hasError: true }
  }

  componentDidCatch(error, info) {
    
    const stack = info.componentStack
    
    const errorMsg = `${error.toString()}\n${stack}`
    
    console.log(errorMsg)
  }

  render() {

    if (this.state.hasError) {

      return (
              <Vertical style={{alignItems: 'center'}}>
                <h1>{I18n.t('page.common.errorOccured')}</h1>
                <h1>{I18n.t('page.common.contactSiteAdminisrator')}</h1>
              </Vertical>
            )
    }

    return this.props.children
  }
}

export default ErrorCatch