import {Vertical} from "@gui/Flex.js";

import { useTranslation } from 'react-i18next';

export default function() {

  const { t } = useTranslation()

  return (
    <Vertical style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
      <img src={'/image/404-error.png'}/>
      <div  style={{'fontSize':'36px'}}>{t('page.common.relogin')}</div>
    </Vertical>    
  )
}
