import React from 'react';

import {Vertical} from "@gui/Flex.js";

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
                <h1>오류가 발생하였습니다</h1>
                <h1>관리자에게 문의하세요</h1>
              </Vertical>
            )
    }

    return this.props.children
  }
}

export default ErrorCatch