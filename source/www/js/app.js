var MyApp=angular.module("starter", ["ionic","ngCordova","firebase"]);

MyApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

MyApp.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state("firebase", {
      url: "/firebase",
      templateUrl: "templates/firebase.html",
      controller: "FirebaseController",
      cache: false
    })
    .state("secure", {
      url: "/secure",
      templateUrl: "templates/home.html",
      controller: "SecureController"
    });
  $urlRouterProvider.otherwise('/firebase');
});

MyApp.controller("FirebaseController", function($scope, $state, $firebaseAuth) {

  var fbAuth = $firebaseAuth();

  $scope.login = function(username, password) {
    fbAuth.$signInWithEmailAndPassword(username,password).then(function(authData) {
      $state.go("secure");
    }).catch(function(error) {
      console.error("ERROR: " + error);
    });
  }

  $scope.register = function(username, password) {
    fbAuth.$createUserWithEmailAndPassword(username,password).then(function(userData) {
      return fbAuth.$signInWithEmailAndPassword(username,
        password);
    }).then(function(authData) {
      $state.go("secure");
    }).catch(function(error) {
      console.error("ERROR: " + error);
    });
  }

});

//secure controller

MyApp.controller("SecureController", function($scope, $http, $ionicHistory, $firebaseObject, $firebaseArray, $firebaseAuth, $cordovaCamera, $state, $window) {

  $ionicHistory.clearHistory();  //for clearing user login history

  $scope.images = [];
  $scope.fb = $firebaseAuth();
  var fbAuth = $scope.fb.$getAuth();
  var ref = firebase.database().ref();
  var obj = $firebaseObject(ref);
  if(fbAuth) {
    var userReference = ref.child("users/" + fbAuth.uid);   //capture the user reference in data structure ,it navigates to specific user page in freebase
    var syncArray = $firebaseArray(userReference.child("images"));  //binding specific node in firebase to an array object in angularjs

    $scope.images = syncArray;

  }
  else {
    $state.go("firebase");  //directs to firebase page
  }

  $scope.upload = function() {
    var options = {
      quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options).then(function(imageData) {
      syncArray.$add({image: imageData}).then(function() {
        alert("Image has been uploaded");
      });
    }, function(error) {
      console.error(error);
    });
  }


  $scope.analyzeg=function () {
    var gen=$scope.text;
    var words=$http.get("https://api.uclassify.com/v1/uclassify/Sentiment/classify/?readKey=7FFKx05Hlw9P&text=" +gen);
    words.success(function (data) {
      console.log(data);
      $scope.analyzelang={"positive":data.positive*100,"negative":data.negative*100};

    });

  }

  $scope.generate=function () {
    var item=$scope.images[0].image;
    var list="";


    const app = new Clarifai.App({
      apiKey: 'bb8bc6109c5e43ea8ad0c55245a816ec'
    });
    app.models.predict(Clarifai.GENERAL_MODEL, {base64: item}).then(
      function(response) {
        console.log(response);
        for (var i=0;i<10;i++){
          var temp = response.outputs[0].data.concepts[i].name;
          list = list +"<br/>" +temp;

        }
        document.getElementById("objects").innerHTML = list;
      },
      function(err) {
        // there was an error
      }
    );
  }
  $scope.translate=function(){
    var text = $scope.trans1;
    var transText = $http.get('https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20180205T020447Z.db8e6fd667da46fd.ee2a7eaca79f2a03a9f0f4eaa73bc02bccf2b19e&text=' + text + '&lang=en-es&[format=plain]&[options=1]&[callback=set]');
    // $http.get('https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20151023T145251Z.bf1ca7097253ff7e.c0b0a88bea31ba51f72504cc0cc42cf891ed90d2&text='+ transid +'&lang=en-es&[format=plain]&[options=1]&[callback=set]').success(function(data) {
    transText.success(function (data) {
        console.log(data);
        $scope.output = data.text;
      }
    )


  }
  $scope.weather=function(){
    var txt= $scope.weather1;
    var weatherText = $http.get('http://api.openweathermap.org/data/2.5/weather?q='+txt+'&appid=fbab8dddf4d33a619fe023e230baa31d&units=metric');
    weatherText.success(function (response) {
      $scope.temp=response.main.temp;
      $scope.humidity=response.main.humidity;
      $scope.pressure=response.main.pressure;
      $scope.wind=response.wind.speed;

    })
  }

  $scope.logout=function () {
    $state.go("firebase");

  }
});




