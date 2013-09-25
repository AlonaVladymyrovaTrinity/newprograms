/*window.onload = function () {
    var addProd = document.getElementById('add_prod');
    var getProduct = document.getElementById('get_product');
    var close_popup = document.getElementById('close_popup');
    var close_get = document.getElementById('close_get_product');
    var open_popup = document.getElementById('open_popup');
    var open_get_popup = document.getElementById('open_get_popup');
    var close_upd = document.getElementById('close_update_product');
    var upd_product = document.getElementById('update_product');
    var open_update_popup = document.getElementById('open_update_popup');    */
$(document).ready(function () {



    $( "#open_popup" ).button().click(function() {
        $( "#pop-up" ).dialog( "open" );
    });

    $(function() {
        $( "#pop-up" ).dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                "addProd": function addProduct() {
                 //   $('#addProd').click(function addProduct() {
                        //     console.log('starting adding new product');
                        //     var id_prod = $("#inp1").val();
                        var s = {};
                        s.name = $("#name").val();
                        s.price = 1 * $("#price").val();
                        s.availability = !!$("#availability").val();
                        $.ajax({
                            url: '/marykay/products',
                            type: "POST",
                            data: JSON.stringify(s),
                            //data: JSON.stringify({"name": "Changed name", "price": 26, "availability": true}),
                            /*   dataType: "json",*/
                            contentType: "application/json; charset=utf-8",
                            dataType: 'text',
                            success: function () {
                                alert("success!");
                                $("#pop-up").dialog( "close" );
                                /*       close_pop_up('#pop-up');*/
                                loadProduct();
                            },
                            error: function (xhr, textStatus, textMessage) {
                                alert("error!");
                                $("#pop-up").dialog( "close" );
                                /*        close_pop_up('#pop-up');*/
                            }
                        });
                        //   $("#prod td").each(function(){$(this).parent().remove()});
                        //   loadProduct();

                  //  });
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    });

    $( "#open_get_popup" ).button().click(function() {
        $( "#get-pop-up" ).dialog( "open" );
    });

    $(function() {
        $( "#get-pop-up" ).dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                "Find": function getSpecificProduct() {
                //    $('#getProduct').click(function getSpecificProduct() {
                    var id = $("#id_prod").val();
                    $.ajax({
                        type: "GET",
                        url: "/marykay/products/" + id,
                        dataType: 'json',
                        success: function (data) {
                            $.each(data, function (k, v) {
                                if (k != "version") {
                                    if (k == "availability") {
                                        alert(v);
                                        $("#find_rez").append("availability: " + v + ", <br>");
                                    }
                                    else if (k == "id") {
                                        $("#find_rez").append("id: " + v + ", <br>");
                                        alert(v);
                                    }
                                    else if (k == "name") {
                                        $("#find_rez").append("name: " + v + ", <br>");
                                        alert(v);
                                    }
                                    else if (k == "price") {
                                        $("#find_rez").append("price: " + v + ", <br>");
                                        alert(v);
                                    }
                                }
                            });
                        },
                        error: function () {
                            alert("not found!");
                        }
                    });
                },
                "Close": function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    });



 /*   close_popup.onclick = function closePopup() {
        close_pop_up('#pop-up');
    }
    open_popup.onclick = function openPopup() {
        open_pop_up('#pop-up');
        //$("#pop-up table > tr").append($("<tr><td colspan=2><input id='add_prod' type='button' value='Добавить'/><input id='close_popup' type='button' value='Закрыть'/></td></tr>"));
    }

    open_get_popup.onclick = function openGetPopup() {
        open_pop_up('#get-pop-up');
    }

    close_get.onclick = function closeGetProduct() {
        close_pop_up('#get-pop-up');
    }             */

    //open_update_popup.onclick = function openUpdatePopup(){
    //    open_pop_up('#update-pop-up');
    // }

 /*   close_upd.onclick = function closeUpdateProduct() {
        close_pop_up('#update-pop-up');
    }              */



});

/*};*/

$(document).ready(function () {
    loadProduct();
});

var loadProduct = function () {
    $.ajax({
        type: "GET",
        url: "/marykay/products",
        dataType: "json",
        success: onLoadProductResult
    });
};

var products;

var onLoadProductResult = function (data) {

    var tbody = $("#prod").find("tbody");
    tbody.empty();

    products = data;


    $.each(data, function (index, value) {
        tbody.append('<tr>');
        tbody.append('<td>' + value.availability + '</td>');
        tbody.append('<td>' + value.id + '</td>');
        tbody.append('<td>' + value.name + '</td>');
        tbody.append('<td>' + value.price + '</td>');
        //$("#prod").find("tbody").append($("<td><input type='button' onclick='deleteProduct(" + value['id'] + ")' value='Delete Product'/></td>"));
        tbody.append('<td><input id="id_' + value.id + '" type="button" class="deletetButton" value="Delete Product"/></td>');
        tbody.append('<td><input id="product_' + value.id + '" type="button" class="editButton" value="Update Product"/></td>');
        tbody.append('</tr>');
    });

    $('.editButton').click(onEditButtonClick);
    $('.deletetButton').click(onDeleteButtonClick);
};

$(function OpenUpdatePopUp() {
    $( "#update-pop-up" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Update": function () {
                //$( this ).dialog( "close" );
                onEditComplete(product);
            },
            "Close": function() {
                $( this ).dialog( "close" );
            }
        }
    });
});

var onEditButtonClick = function () {
    //console.log(this.id);

    var productId = this.id.replace("product_", "");
    var product;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id == productId){
            product = products[i];
            break;
        }
    }

    if (product){
       // console.log(product.price);
       //product.price*=2;

        // show popup
        $( "#update-pop-up" ).dialog( "open" );

   /*     open_pop_up('#update-pop-up');*/
        // set data
        $("#upd_availability").val(product.availability);
        //$("#upd_id_prod").val(product.id);
        $("#upd_name").val(product.name);
        $("#upd_price").val(product.price);
        // onEditComplete(
    /*    $('#update_product').click(function (){
            onEditComplete(product);
        });   */
        // close popup
        //updateProduct(product);
    }
};

var onEditComplete = function (product) {
    console.log(this.id);
    var upd_product = {};
    upd_product.name = $("#upt_name").val();
    upd_product.price = 1 * $("#upd_price").val();
    upd_product.availability = !!$("#upd_availability").val();
    upd_product.id = product.id;
    upd_product.version = product.version;
    updateProduct(upd_product);


};
//upd_product.onclick =
//var updateProduct = function (product) {
var updateProduct = function (upd_product) {
    console.log(upd_product.id);
    $.ajax({
        type: "PUT",
        url: "/marykay/products/" + upd_product.id,

        data: JSON.stringify(upd_product),
        /*   dataType: "json",*/
        contentType: "application/json; charset=utf-8",
        dataType: 'text',
        success: function () {
            alert("success!");
        },
        error: function () {
            alert("error!");
        }
    });
};


var onDeleteButtonClick = function () {
    console.log(this.id);

    var productId = this.id.replace("id_", "");
    deleteProduct(productId);
}

var deleteProduct = function(productId) {
    alert("are you sure you want to delete: " + productId);
    $.ajax({
        type: "DELETE",
        url: "/marykay/products/" + productId,
        dataType: "text",
        success: function () {
            //  alert("success!");
            loadProduct();
        },
        error: function () {
            //   alert("error!");
        }
    });

    //$("#prod").find("tbody td").each(function(){$(this).remove()});
    //$("#prod").find("tbody tr").each(function(){$(this).remove()});
    //$("#prod > tbody  > tr").each(function(){$(this).remove()});


};


/*function open_pop_up(box) {
    $("#overlay").show();
    $(box).center_pop_up();
    $(box).show(500);
}

function close_pop_up(box) {
    $(box).hide(500);
    $("#overlay").delay(550).hide(1);
}

$(document).ready(function () {

    $.fn.center_pop_up = function () {
        this.css('position', 'absolute');
        this.css('top', ($(window).height() - this.height()) / 2 + $(window).scrollTop() + 'px');
        this.css('left', ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + 'px');
    }

});  */