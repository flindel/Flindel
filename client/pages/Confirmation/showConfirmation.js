import React from 'react';
import MP from './mapDisplay.js'
//import './App.css';
/*var nodemailer = require ('nodemailer');

//emailsender974@yahoo.com
//testmail974

var transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: 'emailsender974@yahoo.com',
        pass: 'testmail974'
    }
});

var mailOptions = {
    from: 'emailsender974@yahoo.com',
    to: 'w887604@nwytg.net',
    subject: 'testemail',
    text: 'That was easy!'
};*/

class finalPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {step:1}
        this.viewMaps = this.viewMaps.bind(this)
    }


    viewMaps(){
        this.setState({step:2})
    }

    render(){
        /*transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log('email sent')
            }
        })*/
        if(this.state.step ==1){
            return(
                <div>
              <h2>
                Thank you!
              </h2>
              <h3>
                Your confirmation code is: {this.props.code}
                <br></br>
                </h3>
                <p>
                A confirmation email has been sent to {this.props.email}
                </p>
            </div>
        )
        }
        else if (this.state.step ==2){
            return(
                <div>
                <MP/>
                </div>
            )
        }
    }
}

export default finalPage