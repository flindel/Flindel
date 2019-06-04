import React from 'react';
import Item from './Item2'

class confirmOrder extends React.Component{
    constructor(props){
      super(props)
      this.state = {selectedEmail: 0, emailToPrint: this.props.email}
      this.set0=this.set0.bind(this)
      this.set1=this.set1.bind(this)
      this.handleForward=this.handleForward.bind(this)
    }

    componentWillMount(){
      if(this.props.email.indexOf('@')==-1){
        this.setState({selectedEmail:1,emailToPrint: ''})
      }
    }

    set0(){
      if (this.state.emailToPrint!=''){
        this.setState({selectedEmail: 0})
      }
  }

  set1(){
      this.setState({selectedEmail: 1})
  }

  handleForward(){
      if (this.state.selectedEmail==1){
          this.props.updateEmail()
      }
      this.props.updateforward()
    }


    render(){
        return(
            <div>
    <h2>
        RETURN CONFIRMATION
    </h2>
    {this.props.items.map((item)=>{
                    return <Item step = {2} item={item} key={item.variantID}/>
                })}

<h3>Email Confirmation:</h3>
    <form>
        <div className="radio">
          <label>
            <input type="radio" value='original' checked={this.state.selectedEmail === 0 } onChange = {this.set0} />
            Use existing email: {this.state.emailToPrint}
          </label>
          <br/>
          <label>
            <input type="radio" value='new' checked = {this.state.selectedEmail === 1 } onChange = {this.set1} />
            Select new email:
          </label>
        
        <label>     
          <input type="email" value={this.props.newEmail} onChange={this.props.updatehandleChange('newEmail')} />
        </label>
        </div>
      </form>
            <br/>
            <div>
            <button onClick = {this.props.updateback}>Back</button>
            <button onClick = {this.handleForward}> Submit </button>  
            </div>
            </div>
        )
    }
}

export default confirmOrder