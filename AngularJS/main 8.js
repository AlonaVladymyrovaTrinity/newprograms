/**
 * Created by Trinity on 04.10.13.
 */
var myApp = angular.module('myApp',[]);

myApp.factory("Avengers", function(){
    var Avengers = {};
    Avengers.cast =  [{name: "Alona", character: "Programmer"},{name: "Igor", character: "Mentor"}];
    return Avengers;
});

function AvengersCtrl($scope, Avengers){
    $scope.avengers=Avengers;
}



