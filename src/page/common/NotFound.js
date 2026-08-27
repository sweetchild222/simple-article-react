import {Vertical} from "@gui/Flex.js";

export default function() {

  return (
    <Vertical style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
      <img src={'/image/404-error.png'}/>
      <div  style={{'fontSize':'36px'}}>페이지를 찾을 수 없습니다</div>
    </Vertical>    
  )
}
