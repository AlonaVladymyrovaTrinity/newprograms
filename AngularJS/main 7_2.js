/**
 * Created by Trinity on 04.10.13.
 */
var myApp = angular.module('myApp',[]);

myApp.factory("Data", function(){
    return [{message: "I'm data", selected: false},{message: "I'm not a data", selected: false}];
});

function FirstCtrl($scope,Data){
    $scope.data=Data;
    $scope.onClick = function(dataEntry){
        dataEntry.selected = !dataEntry.selected;
    }
}

myApp.filter('reverse', function(){
    return function(text){
        return text.split("").reverse().join("");
    }
})

function SecondCtrl($scope,Data){
    $scope.data=Data;

    /*   $scope.reversedMessage = function(message) {
     return message.split("").reverse().join("");
     }*/
}




