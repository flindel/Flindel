import React, {Component} from 'react';
import InsertModal from './InsertModal.js';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: null
  }
}

  getData(){
      this.setState({
        data:<InsertModal />
      })
  }

  componentWillMount(){
    this.getData();
  }

  //a modal will be inserted here
  render() {
    return (
      <div className="App">
        {this.state.data}
      </div>
    );
  }

}

export default App;
