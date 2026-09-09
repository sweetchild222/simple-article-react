import React from 'react';

import {Vertical} from "@gui/Flex.js";
import { useTranslation } from 'react-i18next';



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

      const { t } = useTranslation()

      return (
              <Vertical style={{alignItems: 'center'}}>
                <h1>{t('page.entry.errorOccured')}</h1>
                <h1>{t('page.entry.contactSiteAdminisrator')}</h1>
              </Vertical>
            )
    }

    return this.props.children
  }
}

export default ErrorCatch