var app = angular.module('superhero',[]);

app.directive("superman", function(){
    return {
        restrict: "A",
        link: function() {
            alert("Im working stronger")
        }
    }
});

app.directive("superman", function(){
    return {
        restrict: "A",
        link: function() {
            alert("Im working faster")
        }
    }
});

app.directive("superman", function(){
    return {
        restrict: "C",
        link: function() {
            alert("Im working - class")
        }
    }
});

app.directive("superman", function(){
    return {
        restrict: "M",
        link: function() {
            alert("Im working - comment")
        }
    }
});



