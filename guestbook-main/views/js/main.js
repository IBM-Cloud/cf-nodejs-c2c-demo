//------------------------------------------------------------------------------
// Initialize the Carbon Design Components.
//
// Loading: https://www.carbondesignsystem.com/components/loading/code#documentation
// Modal:   https://www.carbondesignsystem.com/components/modal/code#documentation
//------------------------------------------------------------------------------
var Loading = CarbonComponents.Loading;
var Modal = CarbonComponents.Modal;
Modal.init();

//------------------------------------------------------------------------------
// Get service url (API and Frontend have same base URL) and define color 
// dictionary for tags.
//------------------------------------------------------------------------------
var baseUrl = window.location;
var colorDictionary = {};

//------------------------------------------------------------------------------
// loadCards()
// Retrieves all guest objects from the API (-> database) and triggers the
// rendering of the guest cards.
//------------------------------------------------------------------------------
function loadCards() {

    // performs GET request using ajax and triggers rendering (addGuestCard())
    // on success (-> no action if request fails)
    $.get("./api/guests")
    .done(function(data) {
        if(data.length > 0){
            data.forEach(function(element, index) { //loop through array of cards
                addGuestCard(element); //render card using retrieved API data
            });
        };
    });
}

//------------------------------------------------------------------------------
// addGuestCard()
// Processes the received guest/user data and appends the HTML card to the
// parent layout.
//------------------------------------------------------------------------------
function addGuestCard(data) {

    //define placeholder values
    var userName = "";
    var docId = "";
    var fileName = "";
    //sets a blank gray image as placeholder by default
    var imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkkAQAAB8AG7jymN8AAAAASUVORK5CYII=";

    userName = data.userName;
    docId = data.id;

    //check if guest object has an image -> if not placeholder will be shown
    if(data.fileName) {
        fileName = data.fileName;
        imageUrl = baseUrl + "api/attachment/" + docId + "/" + fileName; //construct direct route to database image via the brifge route of the backend
    }

    var cardTags = ""; //cardTags are added as string of HTML -> empty string = no content

    if(data.tags){
        cardTags = getHTMLTags(data.tags); //construct HTML from tag data
    }

    //HTML string for the guest cards which gets populated and inserted afterwards
    var card = ""+
        "<div id='card'>"+
            "<div class='card-wrapper bx--tile'>"+
                "<img class='guest-image' src=" + imageUrl + " alt=''>"+
                "<div class='card-content'>"+
                    "<h1 class='card-username'>" + userName + "</h1>"+
                    "<div class='card-tags'>"+
                        cardTags //use previosly constructed HTML for the tags
                    "</div>"+
                "</div>"+
            "</div>"+
        "</div>";

    $('#cards').append(card); //card is appended to the card grid (id="cards") using jQuery
}

//------------------------------------------------------------------------------
// addGuest()
// Sends the previously aggregated user data to the API for inserting it into
// the database and processing it further. On success, it retrieves the final
// guest object and triggers the rendering.
// On fail it stops loading but doesn't displays the user.
//------------------------------------------------------------------------------
function addGuest(data) {

    //turn on the loading animation
    var watsonLoading = Loading.create(document.getElementById('watsonLoading'));
    watsonLoading.set(true);

    //send a POST request using ajax to the API
    $.ajax({

        method: "POST",
        // "./" as basepath because it's the same URL 
        url: "./api/guests",
        contentType: "application/json",
        data: JSON.stringify(data),

    //on success, response = guest object -> trigger rendering and stop loading
    }).done(function(response) {

        addGuestCard(response);
        watsonLoading.set(false);

    //on fail, log error and stop loading
    }).fail(function(xhr, status, err){

        console.log(err)
        watsonLoading.set(false);

    });
}

//------------------------------------------------------------------------------
// getHTMLTags()
// Processes the list of tag objects (including label and score, ordered desc by score)
// and creates an HTML string out of it. The colors are assigned randomly and saved
// in a dictionary (label: color) which allows to use the same color for the same
// label in multiple cards.
// Tag HTML: https://www.carbondesignsystem.com/components/tag/code
//------------------------------------------------------------------------------
function getHTMLTags(tagData){
    var cardTags = ""; //return HTML string -> if empty, no content

    //array of possible colors
    var colors = ["red", "purple", "cyan", "warm-gray", "teal", "magenta", "blue", "green"]

    //loop through array of tag objects
    tagData.forEach((tag) => {

        //check if dictionary already contains the label of the tag
        if(colorDictionary[tag.label] && colorDictionary[tag.label] !== ''){

            //create HTML tag using the color from the dictionary
            cardTags += `<span class='bx--tag bx--tag--${colorDictionary[tag.label]}'>${tag.label}</span>` //append to HTML string
            
        //if dictionary doesn't contain label 
        }else{

            var color = colors[Math.floor(Math.random()*colors.length)]; //get random color from color array
            //create HTML tag with randomely picked color
            cardTags += `<span class='bx--tag bx--tag--${color}'>${tag.label}</span>` //append to HTML string
            colorDictionary[tag.label] = color; //save new label to dictionary

        }
    });
    return cardTags; //return the HTML string
}

//------------------------------------------------------------------------------
// onSave()
// Event that is called on clicking the InputModal button.
// Gets the values from the modal and creates a data URL from the image.
// Additionally, it triggers the upload of the data to the API (addGuest())
//------------------------------------------------------------------------------
function onSave(event) {
    event.preventDefault(); //prevent the default behavior of the button

    var fileReader = new FileReader();

    //get input values from the modal
    var userName = $('#userNameInput').val();
    var photo = $('#photoUpload').prop('files')[0]; //photo is entered as file object in an array

    //cancel if the userName field is empty
    if(userName === ""){
        $("#fileContainer").empty();
        return;
    }

    //define an event which is triggered when the photo was read completely
    fileReader.addEventListener("load", function() {
        $("#fileContainer").empty(); //remove name of the uploaded image from the file overview (under the upload)
        addGuest({userName: userName, photoUrl: fileReader.result}); //trigger the upload/posting of the data to the API
    }, false);

    //check file type of the image and read the file if it is a .jpeg/.jpg/.png or .gif
    if (photo && /\.(jpe?g|png|gif)$/i.test(photo.name)){
        fileReader.readAsDataURL(photo) //create a data URL from the image (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)
    }else{
        console.log("Please upload a valid image!")
    }
}

loadCards(); //trigger the loading of the guest cards if HTML is loaded and the Javascript in initialized

// use jQuery to remove the loading animation when the HTML is loaded completely
// -> loading animation is turned on by default
$( document ).ready(function(){
    var watsonLoading = Loading.create(document.getElementById('watsonLoading'));
    watsonLoading.set(false);
})