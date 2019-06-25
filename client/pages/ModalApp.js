import React from 'react';

const backdropStyle = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.3)',
  padding: 50
}

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: 5,
  maxWidth: 500,
  minHeight: 300,
  margin: '0 auto',
  padding: 30,
  position: 'relative'
};

const imageStyle = {
  maxWidth: 300,
  minHeight: 150,
  margin: '0 auto',
  padding: 10,
};

const mainStyle = {
  align: 'left'
}

class Modal extends React.Component {
  onClose = (e) => {
    this.props.onClose && this.props.onClose(e);
  }
  render() {
    if (!this.props.show) {
      return null;
    }
    return(
      <div style={backdropStyle}>
        <div style={modalStyle}>
          <img style={imageStyle} src='https://staticmapmaker.com/img/google@2x.png' />
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Modal;
