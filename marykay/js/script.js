$(document).ready(function () {

    $( "#open_popup" ).button().click(function() {
        $( "#pop-up" ).dialog( "open" );
    });

    //To do somesing...here...
/*    $('#price').stepper();
    $('#price').stepper({
        type: 'float',       // Allow floating point numbers
        wheel_step:1,       // Wheel increment is 1
        arrow_step: 0.5,    // Up/Down arrows increment is 0.5
        limit: [0,0]         // No negative values
       // onStep: function( val, up )
      //  {}
    });     */

    $(function() {
        $( "#pop-up" ).dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                "addProd": function addProduct() {
                        var s = {};
                        s.name = $("#name").val();
                        s.price = 1 * $("#price").val();
                        s.availability = $("#availability").prop("checked");
                        $.ajax({
                            url: '/marykay/products',
                            type: "POST",
                            data: JSON.stringify(s),
                            contentType: "application/json; charset=utf-8",
                            dataType: 'text',
                            success: function () {
                                alert("success!");
                                $("#pop-up").dialog( "close" );
                                loadProduct();
                            },
                            error: function (xhr, textStatus, textMessage) {
                                alert("error!");
                                $("#pop-up").dialog( "close" );
                            }
                        });
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
                                        $(".find_rez").append("availability: " + v + ", <br>");
                                    }
                                    else if (k == "id") {
                                        $(".find_rez").append("id: " + v + ", <br>");
                                        alert(v);
                                    }
                                    else if (k == "name") {
                                        $(".find_rez").append("name: " + v + ", <br>");
                                        alert(v);
                                    }
                                    else if (k == "price") {
                                        $(".find_rez").append("price: " + v + ", <br>");
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

});

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
        tbody.append('<td><input type="checkbox" class="update_availability" disabled="disabled" id="t_upd_availability_' + value.id + '" /></td>');
        $("#t_upd_availability_" + value.id ).prop('checked', value.availability);
        tbody.append('<td>' + value.id + '</td>');
        tbody.append('<td>' + value.name + '</td>');
        tbody.append('<td>' + value.price + '</td>');
        //$("#prod").find("tbody").append($("<td><input type='button' onclick='deleteProduct(" + value['id'] + ")' value='Delete Product'/></td>"));
        tbody.append('<td><button id="id_' + value.id + '" type="button" class="deletetButton" value="Delete Product">Delete Product</button></td>');
        tbody.append('<td><button id="product_' + value.id + '" type="button" class="editButton" value="Update Product">Update Product</button></td>');
        tbody.append('</tr>');
    });

    $( ".deletetButton" ).button({
        icons: {
            primary: "ui-icon-trash"
        },
        text: false
    });
    $( ".editButton" ).button({
        icons: {
            primary: "ui-icon-pencil"
        },
        text: false
    });

  //  $('.update_availability').click(onUpdateAvailability);
    $('.editButton').click(onEditButtonClick);
    $('.deletetButton').click(onDeleteButtonClick);
};


$(function() {
    $( "#update-pop-up" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Update": function () {
                var product =  $(this).data("product");
                onEditComplete(product);
                $( this ).dialog( "close" );
            },
            "Close": function() {
                $( this ).dialog( "close" );
            }
        }
    });
});

var onEditButtonClick = function () {
    var productId = this.id.replace("product_", "");
    var product;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id == productId){
            product = products[i];
            break;
        }
    }

    if (product){
        $( "#update-pop-up" ).data("product", product).dialog( "open" );
        $("#upd_availability").prop('checked', product.availability);
        $("#upd_name").val(product.name);
        $("#upd_price").val(product.price);
    }
};

var onEditComplete = function (product) {
    var upd_product = {};
    upd_product.name = $("#upd_name").val();
    upd_product.price = 1 * $("#upd_price").val();
    upd_product.availability = $("#upd_availability").prop('checked');
    upd_product.id = product.id;
    upd_product.version = product.version;
    updateProduct(upd_product);


};

var updateProduct = function (upd_product) {
    $.ajax({
        type: "PUT",
        url: "/marykay/products/" + upd_product.id,

        data: JSON.stringify(upd_product),
        contentType: "application/json; charset=utf-8",
        dataType: 'text',
        success: function () {
            alert("success!");
            loadProduct();
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
            loadProduct();
        },
        error: function () {
        }
    });

};