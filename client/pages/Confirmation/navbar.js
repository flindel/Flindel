import React, {Component} from 'react';
import './universal.css'
//import { app } from '@shopify/app-bridge/actions/Print';
/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class universalNavBar extends Component{
    constructor(props){
        super(props)
    }
    render(){
        if (this.props.show){
            //if we're on a middle step, show progressbar
            return(
                <div>
                    <p className = 'headerLogo'>
                    <br/>
                    <br/>
                    {/*change this logo to live generated later*/}
                    <img className = 'headerLogo' src = 'https://files.slack.com/files-pri/TA3MUJWBG-FLDRX2PT3/pomelo-logo-square.jpg'/>
                    <br/>
                    <br/>
                    </p>
                    <br/><br/>
                    <h1 className='top'>Return Form</h1>
                    <br/><br/>
                    <div className = 'containerPB'>  
                        <ul className="progressbar">
                            <li className = {this.props.step1} onClick = {this.props.viewPage2}>Select</li>
                            <li className = {this.props.step2} onClick = {this.props.viewPage3}>Review</li>
                            <li className = {this.props.step3}>Confirm</li>
                        </ul>
                    </div>
                    <br/><br/><br/><br/>
                </div>
            )
        }
        else{
            //if it's the first or fifth page, there's no progress bar. don't show it, just the brand logo banner
            return(
            <div>
                <p className = 'headerLogo'>
                <br/>
                <br/>
                <img className = 'headerLogo' src = 'https://files.slack.com/files-pri/TA3MUJWBG-FLDRX2PT3/pomelo-logo-square.jpg'/>
                <br/>
                <br/>
                </p>
                <br/><br/>
                <h1 className='top'>Return Form</h1>
                <br/><br/>
            </div>
            )
        }
    }
}

export default universalNavBar