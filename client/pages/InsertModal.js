import React, {Component} from 'react';
import Modal from './ModalApp.js';
import IdentifyApp from './IdentifyItems/IdentifyApp.js';
import Link from 'next/link';
import { TextStyle, Button, Frame } from '@shopify/polaris';

  const yesStyle = {
    color: 'white',
    textDecoration: 'none'
  };

  const noStyle = {
    color: 'grey',
    textDecoration: 'none'
  };

  const fontStyle = {
    fontFamily: 'Helvetica',
    margin: '20px'
  }

  const modalStyle = {
    position: 'relative'
  }

/*  const buttonStyle = {
    backgroundColor: '#DE3618',
    border: 'none',
    padding: 10,
    textAlign: 'right',
    display: 'inline-block',
    fontSize: 16,
    margin: 10,
    cursor: 'pointer',
    borderRadius: 5,
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
  } */

  const btnPosition = {
    textAlign: 'right',
    marginRight: 10
  }

  const gapToButton = {
    marginBottom: 30
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
      <TextStyle variation="subdued">
      <Modal
        onClose={this.goToMain}
        show={this.state.show}
        style={modalStyle}>
        <div className='modal'>
        Currently our pick up locations are all within Downtown Toronto area.
        <div style={gapToButton}>
        Do you want to proceed?
        </div>
        <div style={btnPosition}>
        <Button primary><Link href='/apps/return-with-flindel/IdentifyItems/IdentifyApp.js'><a style={yesStyle}>Yes, please proceed</a></Link></Button>
        <Button><Link href='/pages/returns-and-exchanges'><a style={noStyle}>No</a></Link></Button>
        </div>
        </div>
      </Modal>
      </TextStyle>
      <div>
      {this.state.data}
      </div>
      </div>
    );
  }
}

export default InsertModal;
