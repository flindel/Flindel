import React, {Component} from 'react';
import Modal from './ModalApp.js';
import IdentifyApp from './IdentifyItems/IdentifyApp.js';
import Link from 'next/link';

  const yesStyle = {
    color: 'white',
    textDecoration: 'none'
  };

  const noStyle = {
    color: 'white',
    textDecoration: 'none'
  };

  const fontStyle = {
    fontFamily: 'Helvetica',
    margin: '20px'
  }

  const modalStyle = {
    position: 'absolute'
  }

  const buttonStyle = {
    backgroundColor: '#e53935',
    border: 'none',
    padding: 10,
    textAlign: 'center',
    display: 'inline-block',
    fontSize: 16,
    margin: 10,
    cursor: 'pointer',
    borderRadius: 5,
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
  }

  const styling = {
    marginTop: 10
  }

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

  render(){
    return(
      <div style={fontStyle}>

      <Modal
        onClose={this.goToMain}
        show={this.state.show}
        style={modalStyle}>
        <div className='modal'>
        Currently our pick up locations are all within Downtown Toronto area.
        <div>
        Do you want to proceed?
        </div>
        <div>
        <button style={buttonStyle}><Link href='/apps/return-with-flindel/IdentifyItems/IdentifyApp'><a style={yesStyle}>Yes, please proceed</a></Link></button>
        <button style={buttonStyle}><Link href='/pages/returns-and-exchanges'><a style={noStyle}>No</a></Link></button>
        </div>
        </div>
      </Modal>
      <div>
      {this.state.data}
      </div>
      </div>
    );
  }
}

export default InsertModal;
