var reserved = false;//should be retrived from database 
var sold = false;//this needs to be fixed so its instanced or something alike
var day = 0;//should be retrived from database 
var quanity = 10;//should be retrived from database 
var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  if (n > x.length) {slideIndex = 1}
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  x[slideIndex-1].style.display = "block";  
}
function changeStatus(){
    if(quanity<1){
        document.getElementById("status").innerHTML = "Blocked";
        document.getElementById("status").setAttribute('style','color:red');
    }
   else{
        quanity--;
        document.getElementById("status").innerHTML = "Approved";
        document.getElementById("status").setAttribute('style','color:green');
        document.getElementById("Quantity").innerHTML = "Quantity: " + quanity;
    }
}

function increaseDay(){
    day++;
    console.log(day);
    if(!sold&&day>6){
        document.getElementById("fStatus").innerHTML = "Returned";
        document.getElementById("fStatus").setAttribute('style','color:blue');
        document.getElementById("status").innerHTML = "Removed From Market";
        document.getElementById("status").setAttribute('style','color:red');
    }
}

//////////////race condition

function reserve(){
    //if (database returns false for reserved item)
    if(quanity==1){
        reserved = true;//tell database that value is true
        quanity--;
        document.getElementById("status").innerHTML = "Approved";
        document.getElementById("status").setAttribute('style','color:green');
        document.getElementById("Quantity").innerHTML = "Quantity: " + quanity;
    
        document.getElementById("fStatus").innerHTML = "Sold Out";
        document.getElementById("fStatus").setAttribute('style','color:green');
    }
    else if(quanity<1){
        document.getElementById("status").innerHTML = "Blocked";
        document.getElementById("status").setAttribute('style','color:red');
    }
   else if (day<7){
        quanity--;
        document.getElementById("status").innerHTML = "Approved";
        document.getElementById("status").setAttribute('style','color:green');
        document.getElementById("Quantity").innerHTML = "Quantity: " + quanity;
    
        document.getElementById("fStatus").innerHTML = "Resold";
        document.getElementById("fStatus").setAttribute('style','color:green');
    }
    console.log(reserved);
    //else dont let user buy 

}