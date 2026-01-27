import React, { useState } from 'react';
import Modal, {Type} from './Modal';

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false)

  const config = {
    text: '안녕하세요? ㅎㅎㅎㅎㅎㅎ마닝럼니아러미ㅏㄴㅇㄹ',
    type: Type.yesno,
    isCloseOutsideClick: false
  }


  const onYesNo = (yes) => {
    console.log('result', yes)
    console.log(input_password.value)
  }

  return (
    <div>
      <h1>My App</h1>
      <button onClick={()=>setIsModalOpen(true)}>Open Modal</button>
      <Modal config={config} isOpen={isModalOpen} onYesNo={onYesNo} onClose={()=>setIsModalOpen(false)}>
        <label htmlFor="input_password">Password</label>
        <input id="input_password" type="text"/>
      </Modal>
    </div>
  )
}

export default App;