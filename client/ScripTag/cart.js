console.log("Hello from new ScriptTag!");
var cartItems=new Array();
const serveoname = "feritas"

const GITValid = {
    addDeleteButton: function(){
        const $deleteButton = $('<p> <button id="deleteGIT" class="btn"> DELETE GIT </button> </p>')
        $deleteButton.appendTo($('.cart__policies'))
    },
    addZipcodeValidator: function(){
        const $zipCodeValidator = $('<p id="GITzipCheck"><input id="GITzipCheckInput" type="text" placeholder="Enter your postal code... "> <input name="zipSubmit" class="btn" value="Search!!" type="button"><div class ="zipCheckInfo"></div></p>')
        $zipCodeValidator.appendTo($('.cart__policies'))
    },
    addCollectionPop: function(){
        const $collectionPop = $('<div id="gitcollection-pop"><div class="gitcollection-popup-overlay"> <div class="gitcollection-popup-content"><h2>Get It Today</h2><p>All items in git it today are only available in Toronto area.</p><button class="btn gitpop-close">OK</button>   </div></div></div>')
        $collectionPop.css("z-index","100")
        $collectionPop.prependTo('body')
    },
    addPaymentButtonPop:function(){
        const $paymentPop = $('<div id="paymentButton-pop"><div class="paymentButton-popup-overlay"> <div class="paymentButton-popup-content"><h2>Get It Today</h2> <p id="paymentWarning">You have Get It Today items in your cart, please validate your postal code for free delivery before checkout</p><p id="GITzipCheck"><input id="GITzipCheckInput" type="text" placeholder="Enter your postal code... "> <input name="zipSubmit" class="btn" value="Search" type="button"></p><button class="btn paymentpop-close">Checkout later</button></div></div></div>')
        $paymentPop.css("z-index","100")
        $paymentPop.prependTo("body")
    }
}



$(document).ready(function(){
    //function to delete all get it today items
    function deleteGIT(){
        console.log("items:"+JSON.stringify(cartItems))
        console.log("delete!!!!!!!!!!!!!!!!!!!")
        quantityUpdate = [];
        cartItems.forEach(item=>{
            if(item.title.indexOf("Get It Today")==-1){
                quantityUpdate.push(item.quantity)
            }else{
                quantityUpdate.push(0)
            }
        })
        console.log("Update array: "+quantityUpdate)
        $.post('/cart/update.js', 
                {
                    updates: quantityUpdate
                },
                null,
                "json").done(function(){
            console.log("--------cart updated!!!!---------")
            document.location.href = '/cart'
        }).fail(function(err){
            console.log("fail to update"+JSON.stringify(err))
        })
    }

    //postal code checking function
    function checkPostalCode(input){
        $("p .zipCheckInfo").empty()
        let validGIT = false; //flag for postal code within certain area
        //let validPost = false; //flag for a valid Canada postal code 
        //reformat postal code
        input = input.toUpperCase().replace(/\W/g,'').replace(/(...)/,'$1 ')
        console.log("reformat input="+input);
        // var regex = new RegExp(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i);
        // if(regex.test(input)){
            fetch(`https://${serveoname}.serveo.net/addValidation?postalCode=${encodeURIComponent(input)}`, {
                method: 'GET',
            }).then(res=>res.json()).then(jsonresp=>{
                console.log("fetch res----"+JSON.stringify(jsonresp))
                validGIT = jsonresp
            })
        //}
    
        //call backend server for validation


        if(validGIT){
            //show message for valid result
            //$("p .zipCheckInfo").empty()
            $validPostal = $('<p id="GITpostalCheckResult">Get It Today items are available in your area! You can checkout now!</p>')
            $('p .zipCheckInfo').append($validPostal)
            return true
        }else if(input.length==0 || validPost==false){

            return false
        }else{
            //show message and delete button for invalid result
            //$("p .zipCheckInfo").empty()
            $validPostal = $('<p id="GITpostalCheckResult">Sorry, Get It Today items are not available in your area currently. You can delete them if you want.<br> <input class="btn" type="button" value="DELETE" id="deleteGIT"> </p>')
            $('p .zipCheckInfo').append($validPostal)

            $('#deleteGIT').on('click',function() {
                deleteGIT();
                console.log("refresh cart page")
                //console.log("items:"+JSON.stringify(lineItems))
                }
            )
            //return false
        }
    }
    //Cart page validation function 
    function CartPageValidation(){
        GITValid.addZipcodeValidator();
        let validPostal = false
        
            $(".btn[name=zipSubmit]").on('click',function(){
                let inputZip = $('#GITzipCheckInput').val()
                validPostal = checkPostalCode(inputZip)
                console.log("input zip = "+inputZip)
                //return false
            })

            $(".btn[name=checkout] ").on('click',function(){
                let inputZip = $('#GITzipCheckInput').val()
                $("p .zipCheckInfo").empty()
                if(validPostal){
                    $(this).submit();
                }else{ //postal code is not valid
                    //customer do not input
                    $("p .zipCheckInfo").empty()
                    const $invalidWarning = $('<p id="GITzipWarning">Please enter a valid postal code for Get It Today items</p>')
                    $invalidWarning.css("color","red")
                    $("p .zipCheckInfo").append($invalidWarning)
                    return false
                }
            })
            
    }

    function PaymentButtonValidation(){
        GITValid.addCollectionPop()
            $(".paymentButton-popup-overlay").css({
                "position":"fixed",
                "left":"0",
                "right":"0",
                "width":"100%",
                "height":"100%",
                "background":"rgba(0,0,0,0.4)",
                "filter":"alpha(opacity=60)",
                "z-index":"100"
            })
            $(".paymentButton-popup-content").css({
                "position":"fixed",
                "margin":"auto",
                "left":"0",
                "right":"0",
                "top":"calc(50% - 100px)",
                "width":"200px",
                "height":"auto",
                "opacity":"1",
                "z-index":"200",
                "visibility":"visible",
                "background":"rgba(255,255,255,1)",
                "text-align":"center"
            })

            $(".paymentpop-close").click(function(){
                $("#paymentButton-pop").remove();
                } 
            )
    }

    //location check in car page
    if(window.location.href.indexOf("cart")!=-1){
        let validPostal=false
        $.ajax({
            type: 'GET',
            url: '/cart.js',
            cache: false,
            dataType: 'json',
            success: function (cart) {
                const lineItems = cart.items
                cartItems = lineItems
                //console.log("items: "+JSON.stringify(lineItems))
                lineItems.forEach(element => {
                    if(element.title.indexOf("Get It Today")!=-1){
                       CartPageValidation();
                    }
                }); 
            }
        })

    }
    //warning message in collection page
    if(window.location.href.indexOf("collections/get-it-today")>-1&&(window.location.href.indexOf("products")==-1)){
        GITValid.addCollectionPop()
        $(".gitcollection-popup-overlay").css({
            "position":"fixed",
            "left":"0",
            "right":"0",
            "width":"100%",
            "height":"100%",
            "background":"rgba(0,0,0,0.4)",
            "filter":"alpha(opacity=60)",
            "z-index":"100"
        })
        $(".gitcollection-popup-content").css({
            "position":"fixed",
            "margin":"auto",
            "left":"0",
            "right":"0",
            "top":"calc(50% - 100px)",
            "width":"200px",
            "height":"auto",
            "opacity":"1",
            "z-index":"200",
            "visibility":"visible",
            "background":"rgba(255,255,255,1)",
            "text-align":"center"
        })

        $(".gitpop-close").click(function(){
              $("#gitcollection-pop").remove();
             } 
         )
    }

    if(window.location.href.indexOf("products")!=-1){
        console.log("on the product page")
        $('.shopify-payment-button').find("button").on('click',function(){
            //alert("HEYYYYYYYYYY")
            return false
            $.ajax({
                type: 'GET',
                url: '/cart.js',
                cache: false,
                dataType: 'json',
                success: function (cart) {
                    const lineItems = cart.items
                    cartItems = lineItems
                    //console.log("items: "+JSON.stringify(lineItems))
                    lineItems.forEach(element => {
                        if(element.title.indexOf("Get It Today")!=-1){
                           PaymentButtonValidation();
                        }
                    }); 
                }
            })
            return false
        })
    }

})

