
var googAuth

var im,
  store,
  rootMirror,
  previous,
  associations,
  dropboxClientCredentials,
  selectedAssociation

var authenticatedClient = null

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
}

function printAssociations (associationList, div) {
  console.log('ASSOCIATIONS:')
  associationList.map(function(assoc) {
		var guid = assoc
    var displayText = im.getAssociationDisplayText(guid);
    var html = "<div im-guid='" + guid + "' class='association>'<p>" + displayText + "</p></div>";
    $('.output').append(html);
    // console.log(assoc)
    // console.log(im.getAssociationDisplayText(assoc))
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
