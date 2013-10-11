/**
 * Created by Trinity on 04.10.13.
 */
var app = angular.module('superhero',[]);

app.directive("superman", function(){
    return {
        restrict: "E",
        template: "<div>Here I am to save the world!</div>"
    }
});

function AvengersCtrl($scope, Avengers){
    $scope.avengers=Avengers;
}



