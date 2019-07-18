import React, {Component} from 'react';
import {Card, AppProvider, Button, ProgressBar} from '@shopify/polaris';
import './universal.css';
//import { app } from '@shopify/app-bridge/actions/Print';
/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class universalNavBar extends Component{
    constructor(props){
        super(props)
    }
    render(){
        if (this.props.show){
            return(
                <div>
                    <p className = 'headerLogo'>
                    <img className = 'headerLogo' src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEUAAAD///+pqanv7++8vLwhISHd3d02NjbZ2dlDQ0Ofn5+SkpKvr6/6+vrk5OT39/diYmLPz89ubm5oaGiYmJiFhYW4uLgWFhZOTk4qKirCwsJ8fHxUVFTj4+NaWloLCws+Pj50dHTKysqCgoJJSUkfHx8nJycTExN2TLU5AAAEU0lEQVR4nO3Z53KrOhSGYWQIroAbuJd4p9z/HR7QEghhduLZg8vMeZ8/EbaR+BBGC8fzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP+V47MP4J5O69FAJU8Y9/SQYc7p1lc5/yGjOaaBMpLYj5SKg/FX96NserEM8oSEnjeMZPAsb6+zojVb32GY7fMSeiNJGOiNuW73uh/l/MSE/XpCL9Ub2+6HeWLCNyehp+8Iatn5MK+TsCebm66HeZ2EU9kcdT3M6yTcyOas62FeJ+FKNuOuh3nhhKu3v+/7bZst1dFnfaMl4U89d6mR8NO5SncXNduqJFjU9+gvw3w5OS2LQmWgy4OPIK8bEmcZHcfJLIqCfbndTLibqdkl73l6l1CORsKhssvFNF865nmiRKnQFDpv88DXC+Z7We7l4SeqOfG7RE3ykxDbft2EC1/veC56/nhwwrFdLYpmpo+neOU9b6xDkyVbqu22jBX72UDa5Swu88kt/h7z18KWhPn7xRkwNZRzgdw/4UFvjcussi7qYHMdNrIfP0rTT71yGfVtAJnz4tOXq4S6UJQvYfyAiG7CtJoLvTAe7CGraFMdnXldZk4vnd/SS79or+0Feyle3DcS6ksirIVN7nvLcRLudJRd0dRn1xSoMlt6Y6/s8fWq+TYfV8OieSivbs/Lqv1qCf3aGZUCI3tEwq232afFpMQjm7WsT78SvVU0+7WEo1rCQZVQT1EqO/aqXDZhWtvL60dVz/dOGPmJSsJgXN7Z9PWldmZL6vH0poT6obq3mOcWQXXt2oTyyXen53KceyZsXijy6tw5jslNCfW9ahBo2aTgJpSeF07Pd3givUoYNF52j0PusLNbEp7aJ6VKaIqmcqWXhJe7RDPaE366CcMq168JJcHVA2aVsN+WsPNCv6494aot4U1zuGo/5Crh5kXmsPE9lLXgpu+hXKXJd1t/L/U9lEypcxx/vFvuNKGzZ8kmdO+e9a3mWenIXxL2nHMrx1G0fk9o6nD7NNVY8eX90VXP+9CPxw9M2K9/nWRdzm5LKFWPOpSPh9vMTXiuf/PO1eV/dIJ36as9oUyi+UeDLlOkevw9oSkWVJLmhexqflArN6FMoinC9cNFUnxipqrZ7Jj56Sm8ekN/E/c2rdwbZIYOtYRy2kOb0FThRZ2UF0rm/VpCuTKHNu20Gs7U7t0y507tr96Jq8u0KEtNmVV/TJrVZl86kWVwHSlLincpRtXR9nypel7Uj6PzfP1tdcL/XL1ZPBns5K9vjs0cqZ6YRe3cmJ9ZzXkYxlVAqQbfTWbTzSkwH83/xubUyrU06TrgfDLplSa9c/PtjyxS295AhebefxqVH5+MvUXVnnrjqj2Se2hq6jxJZHebmLvlOih6DtXAnteFr6Luf2v/Xf84/7f/Ra3W059/gelP/7FnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPjRf5CeKreZFVDxAAAAAElFTkSuQmCC'></img>
                    </p>
                    <h1 className='top'>Return Form</h1>
                    <div className = 'container'>
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
            return(
            <div>
                <p className = 'headerLogo'>
                <img className = 'headerLogo' src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEUAAAD///+pqanv7++8vLwhISHd3d02NjbZ2dlDQ0Ofn5+SkpKvr6/6+vrk5OT39/diYmLPz89ubm5oaGiYmJiFhYW4uLgWFhZOTk4qKirCwsJ8fHxUVFTj4+NaWloLCws+Pj50dHTKysqCgoJJSUkfHx8nJycTExN2TLU5AAAEU0lEQVR4nO3Z53KrOhSGYWQIroAbuJd4p9z/HR7QEghhduLZg8vMeZ8/EbaR+BBGC8fzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgP+V47MP4J5O69FAJU8Y9/SQYc7p1lc5/yGjOaaBMpLYj5SKg/FX96NserEM8oSEnjeMZPAsb6+zojVb32GY7fMSeiNJGOiNuW73uh/l/MSE/XpCL9Ub2+6HeWLCNyehp+8Iatn5MK+TsCebm66HeZ2EU9kcdT3M6yTcyOas62FeJ+FKNuOuh3nhhKu3v+/7bZst1dFnfaMl4U89d6mR8NO5SncXNduqJFjU9+gvw3w5OS2LQmWgy4OPIK8bEmcZHcfJLIqCfbndTLibqdkl73l6l1CORsKhssvFNF865nmiRKnQFDpv88DXC+Z7We7l4SeqOfG7RE3ykxDbft2EC1/veC56/nhwwrFdLYpmpo+neOU9b6xDkyVbqu22jBX72UDa5Swu88kt/h7z18KWhPn7xRkwNZRzgdw/4UFvjcussi7qYHMdNrIfP0rTT71yGfVtAJnz4tOXq4S6UJQvYfyAiG7CtJoLvTAe7CGraFMdnXldZk4vnd/SS79or+0Feyle3DcS6ksirIVN7nvLcRLudJRd0dRn1xSoMlt6Y6/s8fWq+TYfV8OieSivbs/Lqv1qCf3aGZUCI3tEwq232afFpMQjm7WsT78SvVU0+7WEo1rCQZVQT1EqO/aqXDZhWtvL60dVz/dOGPmJSsJgXN7Z9PWldmZL6vH0poT6obq3mOcWQXXt2oTyyXen53KceyZsXijy6tw5jslNCfW9ahBo2aTgJpSeF07Pd3givUoYNF52j0PusLNbEp7aJ6VKaIqmcqWXhJe7RDPaE366CcMq168JJcHVA2aVsN+WsPNCv6494aot4U1zuGo/5Crh5kXmsPE9lLXgpu+hXKXJd1t/L/U9lEypcxx/vFvuNKGzZ8kmdO+e9a3mWenIXxL2nHMrx1G0fk9o6nD7NNVY8eX90VXP+9CPxw9M2K9/nWRdzm5LKFWPOpSPh9vMTXiuf/PO1eV/dIJ36as9oUyi+UeDLlOkevw9oSkWVJLmhexqflArN6FMoinC9cNFUnxipqrZ7Jj56Sm8ekN/E/c2rdwbZIYOtYRy2kOb0FThRZ2UF0rm/VpCuTKHNu20Gs7U7t0y507tr96Jq8u0KEtNmVV/TJrVZl86kWVwHSlLincpRtXR9nypel7Uj6PzfP1tdcL/XL1ZPBns5K9vjs0cqZ6YRe3cmJ9ZzXkYxlVAqQbfTWbTzSkwH83/xubUyrU06TrgfDLplSa9c/PtjyxS295AhebefxqVH5+MvUXVnnrjqj2Se2hq6jxJZHebmLvlOih6DtXAnteFr6Luf2v/Xf84/7f/Ra3W059/gelP/7FnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPjRf5CeKreZFVDxAAAAAElFTkSuQmCC'></img>
                </p>
                <h1 className='top'>Return Form</h1>
            </div>
            )
        }
    }
}

export default universalNavBar
