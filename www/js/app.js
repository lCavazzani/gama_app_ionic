var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.constant('_', _);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('list', {
            cache: false,
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
});

app.controller('ContatosCtrl', function($rootScope, $scope, $state, $ionicPlatform, $ionicPopup, $cordovaContacts, _) {

    $ionicPlatform.ready(function() {

        var opts = {
            multiple: true,
            desiredFields: ['id', 'displayName', 'name', 'phoneNumbers', 'emails', 'photos'],
            hasPhoneNumber: true
        };

        $scope.getContactList = function() {
            $cordovaContacts.find(opts).then(function(result) {
                $scope.contacts = _.orderBy(result, ['displayName'], ['asc']);
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

        $rootScope.$on('loadContacts', function() {
            $scope.getContactList();
        });

        $scope.askDelete = function(contact) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Apagar Contato',
                template: 'Deseja apagar o contato ' + contact.displayName + '?',
                cancelText: 'Não',
                okText: 'Sim'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    $scope.removeContact(contact);
                } else {
                
                }
            });
        };

        $scope.$emit('loadContacts');

    });

});


app.controller('NewCtrl', function($scope, $state, $ionicPlatform, $ionicHistory, $ionicPopup, $cordovaContacts, $cordovaImagePicker) {
    $scope.collection = {
        selectedImage: 'img/user_profile_256.png'
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
                $scope.showSuccess();
                $state.go("list");

            }, function(error) {
                console.log(error);
                $scope.showSuccess();
                $state.go("list");
            });
        };
 
        $scope.changePhoto = function() {       
            var options = {
                maximumImagesCount: 1, 
                width: 600,
                height: 600,
                quality: 80            
            };
 
            $cordovaImagePicker.getPictures(options).then(function (results) {
                for (var i = 0; i < results.length; i++) {
                    $scope.collection.selectedImage = results[i];
                }
            }, function(error) {
                console.log('Error: ' + JSON.stringify(error));  
            });
        };

        $scope.showSuccess = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Novo Contato',
                template: 'Contato adicionado com sucesso'
            });
        };  

        $scope.showError = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Novo Contato',
                template: 'Erro ao adicionar novo contato'
            });
        }; 
 
    });

});

app.controller('EditCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicPopup, $cordovaContacts, $cordovaImagePicker) {
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
            $scope.showSuccess();
            $state.go("list");
        }, function(error) {
            $scope.showError();
            $state.go("list");
        });
    };

    $scope.goBack = function() {
        $ionicHistory.goBack();
    };

    $scope.changePhoto = function() {       
        var options = {
            maximumImagesCount: 1, 
            width: 600,
            height: 600,
            quality: 80    
        };

        $cordovaImagePicker.getPictures(options).then(function (results) {
            for (var i = 0; i < results.length; i++) {
                $scope.contact.photos[0].value = results[i];   
            }
        }, function(error) {
            console.log('Error: ' + JSON.stringify(error));    
        });
    }; 

    
    $scope.showSuccess = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Editar Contato',
            template: 'Contato atualizado com sucesso'
        });
    };  

    $scope.showError = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Editar Contato',
            template: 'Erro ao atualizar novo contato'
        });
    }; 

});