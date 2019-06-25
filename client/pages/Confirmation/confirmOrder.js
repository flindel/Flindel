import React from 'react';
import Item from './Item2'

/*
GET REASONS FOR RETURN AND CONFIRM EMAIL ON THIS PAGE
*/
class confirmOrder extends React.Component{
    constructor(props){
      super(props)
      this.state = {selectedEmail: 0, emailToPrint: this.props.email}
      this.set0=this.set0.bind(this)
      this.set1=this.set1.bind(this)
      this.handleForward=this.handleForward.bind(this)
      this.handleSelect=this.handleSelect.bind(this)
    }

    componentWillMount(){
      //on mount, see if it is an email address (or phone number) by checking for index of @
      if(this.props.email.indexOf('@')==-1){
        this.setState({selectedEmail:1,emailToPrint: ''})
      }
    }

    set0(){
      //setting state from radio button (either old or new email)
      if (this.state.emailToPrint!=''){
        this.setState({selectedEmail: 0})
      }
  }

  set1(){
    //setting state from radio button (either old or new email)
      this.setState({selectedEmail: 1})
  }

  handleSelect(variantidX,reasonX, oldreasonX){
    this.props.setReason(variantidX,reasonX,oldreasonX)
  }

  handleForward(){
    //handle submit of form
      if (this.state.selectedEmail==1){
        //make sure the email entered is valid if they are entering new one
        if(this.props.newEmail.length<6 || this.props.newEmail.indexOf('@')==-1){
          alert('Please enter a valid email to continue')
        }
        else{
          //change state in IdentifyApp to render new page
          this.props.updateEmail()
          this.props.updateforward()
        }
      }
      else{
        //change state in IdentifyApp to render new page
          this.props.updateforward()
      }
    }

    render(){
        return(
            <div>
    <h2>
        RETURN CONFIRMATION
    </h2>
    {this.props.items.map((item,index)=>{    
                    return <Item step = {2} item={item} key={index}handleSelect={this.handleSelect.bind(this)}/>    
                })} {/*show all items*/}
          
<h3>Email Confirmation:</h3> {/* GET EMAIL INFO*/}
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
            <button onClick = {this.props.updateback}>Back</button> {/*FWD and BACK buttons*/}
            <button onClick = {this.handleForward}> Continue </button>  
            </div>
            </div>
        )
    }
}

export default confirmOrder