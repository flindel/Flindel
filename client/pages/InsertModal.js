import React, {Component} from 'react';
import Modal from './ModalApp.js';
import IdentifyApp from './IdentifyItems/IdentifyApp.js';
import { createMemoryHistory } from 'history';

const history = createMemoryHistory();

const location = history.location;

const unlisten = history.listen((location, action) => {
  console.log(action, location.pathname, location.state);
});

class InsertModal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: null,
      show: true
  }
}

  showModal = () => {
    this.setState({
      ...this.state,
      show: this.state.show
    });
  }

  closeModal = () => {
    this.setState({
      ...this.state,
      show: !this.state.show
    });
  }

  goToMain = () => {
    this.setState({
      ...this.state,
      show: !this.state.show,
      data:<IdentifyApp />
    });
  }

  previousPage() {
    console.log('Hello World');
  }

  render(){
    return(
      <div className="App">

      <Modal
        onClose={this.goToMain}
        show={this.state.show}>
        Currently our pick up locations are all within Downtown Toronto area. Do you want to proceed?
        <button onClick={this.goToMain}>Yes, please proceed</button>
        <button onClick={this.previousPage}>No</button>
      </Modal>
      <div>
      {this.state.data}
      </div>
      </div>
    );
  }
}

export default InsertModal;
