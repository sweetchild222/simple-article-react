import React from "react";
import axios from 'axios';
export default class Eaxmple extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      text: "변경 전이요",
    };
  }

  changeText = async() => {

    const url = '/api/welcome'

    const response = await axios.get(url);

    console.log(response)
    
    this.setState({text: response.data});
  };

  render() {
    return (
      <div>
        <h1>{this.state.text}</h1>
        <button onClick={this.changeText}>버튼</button>
      </div>
    );
  }
}