/**
 * Created by Trinity on 04.10.13.
 */
var myApp = angular.module("myApp",[]);

myApp.factory("Data", function() {
    return {message: "I'm data"}
})

myApp.filter("revers", function(Data){
 return function (text){
     return text.split("").reverse().join("") + Data.message;
 }
})

function FirstCtrl($scope,Data){
    $scope.data=Data;
}
function SecondCtrl($scope,Data){
    $scope.data=Data;

    $scope.reversedMessage = function(message) {
        return message.split("").reverse().join("");
    }
}