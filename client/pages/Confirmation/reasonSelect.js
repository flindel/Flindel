import React from 'react';
import Item from './Item2'

/*
GET REASONS FOR RETURN AND CONFIRM EMAIL ON THIS PAGE
*/
class confirmOrder extends React.Component{
    constructor(props){
      super(props)
      this.state = {selectedEmail: 0, 
                    count:0, 
                    itemErrorMessage:'', 
                    errorMessage:'', 
                    emailToPrint: this.props.email,
                    style: 'Blackout2',
                    emailCopy:''
                  }

      this.set0=this.set0.bind(this)
      this.set1=this.set1.bind(this)
      this.handleForward=this.handleForward.bind(this)
      this.handleSelect=this.handleSelect.bind(this)
      this.updateEmailCopy=this.updateEmailCopy.bind(this)
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

  updateEmailCopy(e){
    this.setState({emailCopy:e.target.value})
  }

  async handleSelect(variantidX,reasonX, oldreasonX){
    if (oldreasonX == null || oldreasonX == '---'){
      await this.setState((prevState) => ({
        count: prevState.count + 1
    })); 
    }
    else if (reasonX == '---'){
      await this.setState((prevState) => ({
        count: prevState.count -1
    }));
    }
    
    this.props.setReason(variantidX,reasonX,oldreasonX)

    if (this.state.count == this.props.items.length){
        this.setState({style:'Submit2'})
    }
    else{
      this.setState({style:'Blackout2'})
    }
  }

  handleForward(){
    if (this.state.count == this.props.items.length){
      this.setState({itemErrorMessage:''})
      //handle submit of form
      if (this.state.selectedEmail==1){
        //make sure the email entered is valid if they are entering new one
        if(this.props.newEmail.length < 6 || this.props.newEmail.indexOf(' ') !=-1 || this.props.newEmail.indexOf('@')==-1){
          this.setState({errorMessage: '*Please enter a valid email to continue*'})
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
    else{
      this.setState({itemErrorMessage:'Please select a reason for return for all items.'})
    }

    }
    
    //flip the radio select if they start typing in their own email
    componentWillReceiveProps(){
      if(this.props.newEmail != ''){
        this.set1()
      }
    }

    render(){
        return(
            <div>
              <h3 className = 'pageTitle3'>
               Return Confirmation
              </h3>
              <p className = 'description3'> - Please ensure that these are the items you wish to return, and select your reasons for return.</p>
              <br/><br/>
              <p className = 'errorMessage3'>{this.state.itemErrorMessage}</p>
              <br/>
              <fieldset className = 'page3'>
                <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p>
                    {this.props.items.map((item,index)=>{ 
                    return <Item step = {2} item={item} serveoname={this.props.serveoname} key={index}handleSelect={this.handleSelect.bind(this)}/>    
                    })} {/*show all items*/}
              </fieldset>
              <h3 className = 'emailHead'>Email Confirmation:</h3> {/* GET EMAIL INFO*/}
              <p className = 'errorMessage3'>{this.state.errorMessage}</p>
              <form>
                <div className="radio">
                  <label className = 'l3'>
                      <input type="radio" value='original' checked={this.state.selectedEmail === 0 } onChange = {this.set0} />
                      Use existing email: {this.state.emailToPrint}
                  </label>
                  <br/>
                  <label className = 'l3'>
                    <input type="radio" value='new' checked = {this.state.selectedEmail === 1 } onChange = {this.set1} />
                    Select new email:
                  </label>
                  <label>     
                    <input type="email" value={this.props.newEmail} onChange={this.props.updatehandleChange('newEmail')} />
                  </label>
                  <br/>
                  <label className = 'l3X'>
                    Re-enter email:
                    <input type="email" value = {this.state.emailCopy} onChange = {this.updateEmailCopy}/>
                  </label>
                </div>
              </form>
              <br/>
              <button className = {this.state.style} onClick = {this.handleForward}> CONTINUE </button>  
            </div>
        )
    }
}

export default confirmOrder