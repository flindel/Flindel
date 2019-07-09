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
  maxWidth: 350,
  minHeight: 350,
  margin: '0 auto',
  marginTop: 100,
  position: 'relative',
  display: 'block',
  textAlign: 'center',
  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
};

const imageStyle = {
  maxWidth: 280,
  minHeight: 160,
  padding: 20
};

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
          <div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
