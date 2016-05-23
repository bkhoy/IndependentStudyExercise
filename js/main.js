
'use strict';

// When creating the ItemMirror object, the first argument is a string specifying the cloud store you're using
// and the second argument is the callback function which will be executed after that iM object is created
// var store = "Google Drive";
// var im = new ItemMirror(store, function(error, newMirror) {
//     if(error) {
//         console.log(error);
//     } else {
//         // Set the global variable to the new itemMirror object
//         im = newMirror;
//         console.log("Initial Return = " + im)

//         // At the moment, creating the root iM object returns an object with two associations
//         // that correspond to the two supported stores. In the future this will be all done within
//         // the itemMirror code, but for now we need to add this extra step.
//         associations = im.listAssociations();
//         store = "Google Drive";

//         //debug -- associations is undefined.. might have to log in first with oath..
//         console.log("Test 0 " + im.associations);

//         for(var i =0; i < associations.length; i++) {

//             //debug
//             console.log("Test 1 " + im.associations[i]);


//             var displayText = im.getAssociationDisplayText(associations[i]);
//             if(displayText == store) {

//               //debug
//               console.log("Test 2 " + im.associations[i]);

//                 im.createItemMirrorForAssociatedGroupingItem(im.associations[i], function(error, newMirror) {
//                    if(!error){ 
//                        im = newMirror;
//                        console.log("Root Folder = " + im);

//                    } else {
//                        console.log(error);
//                    }
//                 });
//             }
//         }
//     }
// });

// // Save the array of guids into its own variable (usually global)
// var associations = im.listAssociations();
// var displayArea = $("#displayArea");
// printAssociations(associations, displayArea);

// // Loops through each of the associations in the iM object, and appends them onto the given jQuery object
// function printAssociations(associationList, appendingElement) {
//   $('#displayArea').html(function() {
//     // Loop through each association
//     for(var i = 0; i < associationList.length; i++) {
//         var guid = associationList[i];
//         var displayText = im.getAssociationDisplayText(guid);
//         var html = "<div im-guid='" + guid + "' class='association>'<p>" + displayText + "</p></div>";

//     }
//   })
// }



//OAUTH WORKS FUCK YES
var googAuth
//function init(gapi) {
    $(document).ready(function () {
      // $("#gdriveButton").on("click", connectDrive)
      // Solution is to not have so many callbacks before actually calling window.open. 
      // If we can reduce the callbacks the window will appear without any issue
      $('#gdriveButton').click(function () {

        console.log("CLICK");

        authorizeDrive(function (auth) {
          // Use this button to bind the authorization object
          googAuth = auth
          console.log('Auth set to: ' + auth)
        })
        //$(this).html("<img src='./images/spinner.gif' alt='spinner' />")
        setTimeout(function () {
          $('#gdriveButton').remove()
          $('#buttons').append("<button class='btn btn-default' id='gSignInButton'>Sign in to Google Drive</button>")

          //click the google drive button
          $('#gSignInButton').click(function () {
            //$(this).html("<img src='./images/spinner.gif' alt='spinner' />")
            console.log('Checking Auth')

            //if sign in is correct
            if (googAuth.isSignedIn.get()) {
              loadDriveAPI()
            } else {
              console.log('Attempting Sign In')
              // Need to have them sign in
              googAuth.signIn().then(function () {
                loadDriveAPI()
              }, function (error) {
                // Failed to authenticate for some reason
                googleAuth.reject(error)
              })
            }
          })
        }, 1000)
      })

      // Loads the drive API, and resolves the promise
      function loadDriveAPI () {
        gapi.client.load('drive', 'v2', function () {
          // Once this callback is executed, that means we've authorized just as expected
          // and can therefore resolve the promise
          connectDrive()
        })
      }

      // Directs the client to Google Drive's authentication page to sign in.
      function connectDrive () {
        console.log('Attempting to connect')
        store = 'Google Drive'

        console.log('Successful Authentication!')
        authenticatedClient = gapi.client
        // Now we start dealing with item-mirror
        constructIMObject(store)
      }

      // This function returns a promise that handles our authentication
      function authorizeDrive (next) {
        console.log('Authorizing Drive')
        
        // Your Client ID can be retrieved from your project in the Google
        // Developer Console, https://console.developers.google.com

        //this is my own (Brittney) client id
        var CLIENT_ID = '5670462674-0sqpco3bsp77jv7mbvta7d2nka4bdd8h.apps.googleusercontent.com'
        // Need full permissions for everything to work. This is the easiest option
        var SCOPES = ['https://www.googleapis.com/auth/drive']

        // Load the newer version of the API, the old version is a pain to deal with
        gapi.load('auth2', function () {
          gapi.auth2.init({
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          })

          next(gapi.auth2.getAuthInstance())
        })
      }
    })
//}