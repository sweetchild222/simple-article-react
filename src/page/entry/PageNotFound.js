
import { useEffect, useRef, useState } from "react";
import './PageNotFound.css'

const usePrevious = (value) => {
  const prevValueRef = useRef();
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  return { prev: prevValueRef.current, current: value };
};

const CountDisplay = ({ count }) => {

  console.log('rerender')

  const { prev, current } = usePrevious(count);
  
  return <div>{count}</div>;
};

export default function() {
  const [count, setCount] = useState(0);

  const onClick = () => {

    setCount((c) => c + 1);
  };

  return (
    <div className="container">
      <div style={{width:'100%', height:'100px', minWidth:'300px', maxWidth:'1000px', backgroundColor:'green'}}/>
      <div style={{width:'100%', height:'100px', minWidth:'300px', maxWidth:'1000px', backgroundColor:'red'}}/>
      <div style={{width:'100%', height:'100px', minWidth:'300px', maxWidth:'1000px', backgroundColor:'blue'}}/>
      <div style={{width:'100%', height:'100px', minWidth:'300px', maxWidth:'1000px', backgroundColor:'yellow'}}/>      
    </div>
  );
}
