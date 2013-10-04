/**
 * Created by Trinity on 04.10.13.
 */
var myApp = angular.module("myApp",[]);

myApp.factory("Data", function() {
    return {message: "I'm data"}
})

function FirstCtrl($scope,Data){
    $scope.data=Data;
}
function SecondCtrl($scope,Data){
    $scope.data=Data;
}