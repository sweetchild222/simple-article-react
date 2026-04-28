import { useEffect, useRef, useState } from "react";

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
    <div className="App">
      <button onClick={onClick}>increment</button>
      <CountDisplay count={count} />
    </div>
  );
}
