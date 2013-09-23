window.onload = function () {
    var addProd = document.getElementById('add_prod');
    var getProduct = document.getElementById('get_product');
    var close_popup = document.getElementById('close_popup');
    var close_get = document.getElementById('close_get_product');
    var open_popup = document.getElementById('open_popup');
    var open_get_popup = document.getElementById('open_get_popup');
    var close_upd = document.getElementById('close_update_product');
    var upd_product = document.getElementById('update_product');
    var open_update_popup = document.getElementById('open_update_popup');


    addProd.onclick = function addProduct() {
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
                close_pop_up('#pop-up');
                loadProduct();
            },
            error: function (xhr, textStatus, textMessage) {
                alert("error!");
                close_pop_up('#pop-up');
            }
        });
        //   $("#prod td").each(function(){$(this).parent().remove()});
        //   loadProduct();

    };

    close_popup.onclick = function closePopup() {
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
    }

    //open_update_popup.onclick = function openUpdatePopup(){
    //    open_pop_up('#update-pop-up');
    // }

    close_upd.onclick = function closeUpdateProduct() {
        close_pop_up('#update-pop-up');
    }
    getProduct.onclick = function getSpecificProduct() {
        var id = $("#id_prod").val();
        $.ajax({
            type: "GET",
            url: "/marykay/products/" + id,
            dataType: 'json',
            success: function (data) {
                $.each(data, function (k, v) {
                    if (k != "version") {
                        if (k == "availability") {
                            $(".rez").append("availability: " + v + ", <br>");
                        }
                        else if (k == "id") {
                            $(".rez").append("id: " + v + ", <br>");
                        }
                        else if (k == "name") {
                            $(".rez").append("name: " + v + ", <br>");
                        }
                        else if (k == "price") {
                            $(".rez").append("price: " + v + ", <br>");
                        }
                    }
                });
            },
            error: function () {
                alert("not found!");
            }
        });
    };


};

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
        open_pop_up('#update-pop-up');
        // set data
        $("#upd_availability").val(product.availability);
        //$("#upd_id_prod").val(product.id);
        $("#upt_name").val(product.name);
        $("#upd_price").val(product.price);
        // onEditComplete(
        $('#update_product').click(function (){
            onEditComplete(product);
        });
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


function open_pop_up(box) {
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

});