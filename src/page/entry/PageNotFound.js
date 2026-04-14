



// import './PageNotFound.css'
// import Split from 'react-split'


import React from 'react';
import Split from '@uiw/react-split';


import { useContext, useState, useRef, useEffect, useCallback, useMemo} from 'react'

export default function() {

    console.log('adsfaf')
    const [isPreView, setIsPreview] = useState(false)

    const onClick=()=>{

        console.log('asdfa')
        setIsPreview(set => !set)

    }


    return (
        
  <div>
    <Split visiable={false} style={{ height: 100, border: '1px solid #d5d5d5', borderRadius: 3 }}>
      <div style={{ maxWidth: 100, backgroundColor: 'red' }} onClick={onClick}>Left Pane</div>
      <div style={{ flex: 1 }}>Right Pane</div>
    </Split>
    <Split visiable={[4, 5]} style={{ height: 100, border: '1px solid #d5d5d5', borderRadius: 3, marginTop: 10 }}>
      <div style={{ maxWidth: 50, backgroundColor: '#eaeaea' }}>Pane 1</div>
      <div style={{ maxWidth: 60 }}>Pane 2</div>
      {isPreView && <div>Pane 3</div>}
      <div>Pane 4</div>
      <div style={{ flex: 1 }}>Pane 5</div>
    </Split>
  </div>

    );
}

