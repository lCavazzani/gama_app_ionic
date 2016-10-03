/* global angular */
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('list', {
            url: '/',
            templateUrl: 'index.html',
            controller: "ContatosCtrl"
        })
        .state('new', {
            url: '/new',
            templateUrl: 'templates/new.html',
            controller: "NewCtrl"
        })
        .state('edit', {
            url: '/edit/:contactId',
            templateUrl: 'templates/edit.html',
            controller: "EditCtrl"
        })

    $urlRouterProvider.otherwise("/");
})

app.controller('ContatosCtrl', function($scope, $cordovaContacts, $ionicPlatform, $state) {

    $ionicPlatform.ready(function() {

        var opts = {
            multiple: true,
            desiredFields: ['id', 'displayName', 'name', 'phoneNumbers', 'emails', 'photos'],
            hasPhoneNumber: true
        };

        $scope.getContactList = function() {
            $cordovaContacts.find(opts).then(function(result) {
                $scope.contacts = result;
            }, function(error) {
                console.log("ERROR: " + error);
            });
        };

        $scope.editContact = function(contact) {
            $state.go("edit", {
                contactId: contact.id
            });
        }

        $scope.removeContact = function(contact) {
            $cordovaContacts.remove({
                "id": contact.id
            }).then(function(result) {
                console.log(JSON.stringify(result));
                $scope.getContactList();
            }, function(error) {
                console.log(error);
            });
        }

    });

});


app.controller('NewCtrl', function($scope, $ionicPlatform, $cordovaContacts, $state, $ionicHistory, $cordovaImagePicker) {
    $scope.collection = {
        selectedImage: 'img/user-avatar.png'
    };

    $scope.goBack = function() {
        $ionicHistory.goBack();
    };

    $ionicPlatform.ready(function() {
        $scope.createContact = function(contact) {

            $cordovaContacts.save({
                "displayName": contact.nome,
                "name": contact.nome,
                "phoneNumbers": [{
                    "value": contact.telefone,
                    "type": "mobile"
                }],
                "emails": [{
                    "value": contact.email,
                    "type": "home"
                }],
                "photos": [
                    {
                        "type": "base64",
                        "value": $scope.collection.selectedImage
        
                    }
                ]
            }).then(function(result) {
                $state.go("list");

            }, function(error) {
                console.log(error);
            });
        };
 
        $scope.changePhoto = function() {       
            // Image picker will load images according to these settings
            var options = {
                maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                width: 600,
                height: 600,
                quality: 80            // Higher is better
            };
 
            $cordovaImagePicker.getPictures(options).then(function (results) {
                // Loop through acquired images
                for (var i = 0; i < results.length; i++) {
                    $scope.collection.selectedImage = results[i];   // We loading only one image so we can use it like this
 
                    // window.plugins.Base64.encodeFile($scope.collection.selectedImage, function(base64){  // Encode URI to Base64 needed for contacts plugin
                    //     $scope.collection.selectedImage = base64;
                    // });
                }
            }, function(error) {
                console.log('Error: ' + JSON.stringify(error));    // In case of error
            });
        };  
 
    });

});

app.controller('EditCtrl', function($scope, $stateParams, $cordovaContacts, $state, $ionicHistory, $cordovaImagePicker) {
    $scope.contact = {};

    var opts = {
        filter: $stateParams.contactId,
        multiple: false,
        fields: ['id'],
        hasPhoneNumber: true
    };

    $cordovaContacts.find(opts).then(function(result) {
        $scope.contact = result[0];
    }, function(error) {
        console.log("ERROR: " + error);
    });

    $scope.save = function(contact) {
        $scope.contact.save(function(result) {
            $state.go("list");
        }, function(error) {
            console.log(error);
        });
    };

    $scope.goBack = function() {
        $ionicHistory.goBack();
    };

    $scope.changePhoto = function() {       
        var options = {
            maximumImagesCount: 1, 
            width: 300,
            height: 300,
            quality: 80    
        };

        $cordovaImagePicker.getPictures(options).then(function (results) {
            for (var i = 0; i < results.length; i++) {
                $scope.contact.photos[0].value = results[i];   
            }
        }, function(error) {
            console.log('Error: ' + JSON.stringify(error));    // In case of error
        });
    }; 

});