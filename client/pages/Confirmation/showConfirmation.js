import React from 'react';

/* FINAL PAGE
Thank you for ordering
 */
class finalPage extends React.Component{
    constructor(props){
        super(props) ;
        this.state = {
            email: this.props.email,
            code:this.props.code           
        };
        this.sendEmail = this.sendEmail.bind(this)
    }

    //resend email if necessary
    sendEmail(){
        fetch(`https://exsto.serveo.net/send?email=${encodeURIComponent(this.state.email)}&code=${encodeURIComponent(this.state.code)}`, 
        {
            method: 'POST',
        })
    }

    //display
    render(){
        return(
            <div>
            <h2>Thank you!</h2>
            <h3>Your confirmation code is: {this.props.code}</h3>
            <p>A confirmation email has been sent to {this.props.email}</p>
            <br/>
            <button onClick = {this.sendEmail}>Resend email</button>
            <br></br><br/><br/><br/>
            </div>
        )
    }
}

export default finalPage