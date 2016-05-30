
var googAuth;
var x = 0;
var y = 0;

var im,
  store,
  rootMirror,
  previous,
  associations,
  dropboxClientCredentials,
  dropboxClient,
  selectedAssociation;

var authenticatedClient = null;

function getClient () {
  return authenticatedClient
}

// Constructs the root ItemMirror object from the root of the Dropbox.
function constructIMObject (store) {
  im = new ItemMirror('Thisisastring', function (error, newMirror) {
    if (error) {
      console.log(error)
    } else {
      im = newMirror
      // Check to see which of the returned items is the correct store, and navigate into that mirror
      if (store) {
        associations = im.listAssociations()
        for (var i = 0; i < associations.length; i++) {
          var displayText = im.getAssociationDisplayText(associations[i])
          if (displayText == store) {
            navigateMirror(associations[i])
          }
        }
      } else {
        refreshIMDisplay()
      }
    }
  })
}

function refreshIMDisplay () {

  if (getClient()) {
    $('.jumbotron').hide()
  }

  var entryDisplayName
  $('#groupingItems').empty()
  $('#nonGroupingItems').empty()

  associations = im.listAssociations()
  var length = associations.length

  // Grab associations and organize them by type
  var groupingItems = []
  var nonGroupingItems = []
  for (var i = 0; i < length; i++) {
    if (im.isAssociationAssociatedItemGrouping(associations[i])) {
      groupingItems.push(associations[i])
    } else {
      nonGroupingItems.push(associations[i])
    }
  }

  printAssociations(im.listAssociations())
  createClickHandlers()
}

function printAssociations (associationList, div) {

  $('#navbuttons').html("<button class='btn btn-success' onclick='x=0;y=0;navigateRoot();'>root</button>")

  //creates the jCanvas
  $('#content').html("<canvas id='myCanvas' width = '2000' height= '400' style='border:1px solid #000000;'></canvas>")
  associationList.map(function(assoc) {
		var guid = assoc
    var displayText = im.getAssociationDisplayText(guid);
    // var html = "<div im-guid='" + guid + "' class='association'><img id='icon' src='http://orig02.deviantart.net/f88f/f/2014/053/d/f/pig50x50_1_by_riverkpocc-d77n3fq.gif' alt='default_bg'/><p class='listText'>" + displayText + "</p></div>";
    // $('.listText').css('display', 'inline')
    // $('.output').append(html);
    if (x > 630) {
    	x = 0;
    	y += 62;
    } 
    $("#itemname").text("Item Name:");
    $('#myCanvas').drawImage({
			source: 'http://3.bp.blogspot.com/_4ngpCZv0sNo/SiwO7f3LdzI/AAAAAAAAB5U/yobvWk1nrhg/s400/g7719.png',
		  x: x += 70, y: y,
		  width: 50,
		  height: 50,
		  fromCenter: false,
		  draggable: true,
      groups: [displayText],
      dragGroups: [displayText],
      mouseover: function(){
                  $("#itemname").text("Item Name: " + displayText);
                },
      dblclick: function(){
                  x = 0;
                  y = 0;
                  navigateMirror(guid);
                }
		}).drawText({
      fillStyle: '#000000',
      x: x+25, y: y+56,
      fontSize: 12,
      fontFamily: 'Verdana, sans-serif',
      text: displayText,
      draggable: true,
      groups: [displayText],
      dragGroups: [displayText],
    });;

    //console.log(im.hasAssociationNamespace (assoc,));


    // console.log(assoc)
    // console.log(im.getAssociationDisplayText(assoc))
  })
}

function createClickHandlers () {
   $('img').click(function() {
				$(this).css('background-color', 'red')
	})
}

// Refreshes the itemMirror object
function refreshMirror () {
  im.refresh(function (error) {
    if (error) {
      console.log('Refresh error:' + error)
    }
  })
}

// Attempts to navigate and display a new itemMirror association
function navigateMirror (guid) {
  im.createItemMirrorForAssociatedGroupingItem(guid, function (error, newMirror) {
    if (!error) {
      if(!rootMirror){
        rootMirror = newMirror;
      }
      im = newMirror
      refreshIMDisplay()
    } else {
      console.log(error)
    }
  })
}

// Navigates to the root mirror
function navigateRoot () {
  if (rootMirror) {
    im = rootMirror
    refreshIMDisplay()
  }
}

// Solution is to not have so many callbacks before actually calling window.open. 
// If we can reduce the callbacks the window will appear without any issue
$('#gdriveButton').click(function () {
  authorizeDrive(function (auth) {
    // Use this button to bind the authorization object
    googAuth = auth
    console.log('Auth set to: ' + auth)
  })
  setTimeout(function () {
    $('#gdriveButton').remove()
    $('#buttons').append("<button class='btn btn-success' id='gSignInButton'>Sign in to Google Drive</button>")
    $('#gSignInButton').click(function () {
      console.log('Checking Auth')
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
  }, 500)
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
  var CLIENT_ID = '681676105907-omec1itmltlnknrdfo150qcn7pdt95ri.apps.googleusercontent.com'
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


function setDropbox(){
  dropboxClientCredentials = {
    key: 'ktpwfv4uaokjmcl',
    secret: 'y6emzhgg3vkz12h'
  };

  // Make an new instance of a Dropbox Client with our credentials
  dropboxClient = new Dropbox.Client(dropboxClientCredentials);

  // Tell the client to open up our popup on authentication
  dropboxClient.authDriver(new Dropbox.AuthDriver.Popup({
      receiverUrl: 'http://localhost:8080/dropboxoauth.html'
  }));
}

// Dropbox Auth
$('#dboxButton').click(function () {
  setDropbox();
  setTimeout(function () {
    $('#dboxButton').remove()
    $('#buttons').append("<button class='btn btn-primary' id='dSignInButton'>Sign in to Dropbox</button>")
    $('#dSignInButton').click(function () {
      console.log('Checking Auth')
      store = "Dropbox";
      // If there is already an authenticated client, don't try to authenticate again
      if(dropboxClient.isAuthenticated()) {
          console.log('Dropbox authenticated');
      } else {
          console.log('Dropbox authenticating...');
          dropboxClient.authenticate(function (error, client) {
              // If an error occurs in authentication, log it
              if(error) {
                  console.log('Dropbox failed to authenticate');
              } else {
                  // Set global variable to authenticated client
                  authenticatedClient = client;
                  console.log('Dropbox authenticated');
                  console.log(store);
                  // Construct the root itemMirror object (more on this in next section)
                  constructIMObject(store);
              }
          });
      }
    })
  }, 500)
})

// Signs current client out of Dropbox
function disconnectDropbox() {
    dropboxClient.signOut();
}

