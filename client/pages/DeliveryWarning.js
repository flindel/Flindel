import React from 'react'

class showWarning extends React.Component{
    constructor(props){
        super(props);
        this.state={
            step:1
        }
        this.continue = this.continue.bind(this)
    }

    continue(){
        this.setState({step:2})
    }

    render(){
        if (this.state.step == 1){
            return(
                <div>
                    <h1>DELIVERY WARNING</h1>
                    <p>Currently, the Get It Today service is only available in the downtown Toronto area.</p>
                    <p>We only ship to addresses in the area enclosed by Bathurst St., Jarvis St., Lakeshore Blvd., and Bloor St.</p>
                    <img src={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgNMKPH3Po4fDC0Hu4TkGS5dynss4oqnCu7AJtp82TJXcU3k_t'}></img>
                    <p>If you are outside of this area, we are unable to deliver to you at this time.</p>
                    <button onClick = {this.continue}>I UNDERSTAND</button>
                </div>
            )
        }
        else if (this.state.step == 2){
            return(
                <div>
                    <p>real page</p>
                </div>
            )
        }
    }
}

export default showWarning
