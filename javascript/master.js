//# sourceMappingURL=master.js.map

function setupLeftHandNav(){
    $("#global_stats_icon").off().on('click', getGlobalStats);
}

function setupDropzone(){
    Dropzone.autoDiscover = false;
    $("#new_bookmark_image").addClass("dropzone").dropzone( { url: "/php/images_upload.php", thumbnailWidth:300, thumbnailHeight:225, renameFile:"new_bookmark_image" });
}

function setupNewGroupSubmit(){
    $("#modal_groups_form .alert").hide();

    $( "#new_group_form" ).submit(function( event ) {
        event.preventDefault();
        $.post("php/group.php", $(this).serialize(), function (json_return) {

        });
    });
}

function setupBookmarkStats(){
    $(".grid_item .stats").off('click').on('click', function(){
        var $grid_item = $(this).parents('.grid_item');
        $.post("php/bookmark_stats.php", {"id":$grid_item.data("id")}, function(json_return){
            json_return = JSON.parse(json_return);
            if(!json_return.error){
                $("#bstats_image").attr("src", $grid_item.find("img").attr("src"));
                $("#bstats_title").html($grid_item.find("h2").text());
                $("#bstats_total_visits").html(json_return.stats.visits);
                $("#bstats_lastvisit").html(json_return.stats.lastvisit);
                openRightHandSide('.bstats');
            }
        });
    });
}

function setupNewBookmarkSubmit(){
    $("#modal_bookmarks_form .alert").hide();

    $( "#new_bookmark_form" ).submit(function( event ) {
        event.preventDefault();
        $.post("php/bookmark.php", $( this ).serialize(), function(json_return) {
            json_return = JSON.parse(json_return);

            if (json_return.error) {
                if (json_return.general_error) {
                    $("#new_bookmark_general_error").html(json_return.general_error).slideDown();
                }

                if (json_return.title_error) {
                    $("#new_bookmark_title_error").html(json_return.title_error).slideDown();
                }

                if(json_return.url_error) {
                    $("#new_bookmark_url_error").html(json_return.url_error).slideDown();
                }
            }else{

                // Add Bookmark to The Grid.
                var title = "";
                var titleStart = $("#bookmark_form_title").val().split(" ").slice(0, -1).join(" ");
                var titleEnd = $("#bookmark_form_title").val().split(" ").pop();

                title = titleStart + " " + "<span>"+ titleEnd +"</span>";

                $("#the_grid").append("<div class=\"grid_item\" data-id=\""+ json_return.last_id +"\">\n" +
                    "            <figure class=\"effect-zoe\">\n" +
                    "                <a href=\""+ $("#bookmark_form_url").val() +"\" target=\"_blank\"><img src=\"img/thumbnails/"+ json_return.image +".jpg\" alt=\"img25\"></a>\n" +
                    "                <figcaption>\n" +
                    "                    <h2>"+ title +"</h2>\n" +
                    "                    <p class=\"icon-links\">\n" +
                    "                        <a href=\"#\" class=\"stats\"><i class=\"fas fa-chart-pie\"></i></a>\n" +
                    "                        <a href=\"#\" class=\"edit\"><i class=\"fas fa-edit\"></i></a>\n" +
                    "                        <a href=\"#\" class=\"fav\"><i class=\"fas fa-thumbs-up\"></i></a>\n" +
                    "                    </p>\n" +
                    "                </figcaption>\n" +
                    "            </figure>\n" +
                    "        </div>");

                // Reset New Bookmark Form..
                Dropzone.forElement("#new_bookmark_image").removeAllFiles(true);
                $("#bookmark_form_url").val("");
                $("#bookmark_form_title").val("");
                $("#new_bookmark_type").val("1");

                // Close Modal..
                $('#modalBookmarkForm').modal('toggle');
            }
        });
    });
}

function setupBookmarkVisit(){
    $(".bookmark_link").off("click").click(function(){
        var id = $(this).parent().parent().data("id");
        $.post("php/bookmark.php", {"type":"visit", "id":id});
    });
}

function checkAllTitleFonts(){
    // Get width of all 3 icons..
    var icon_width = Math.ceil($(".grid_item .icon-links .stats").width()) + Math.floor($(".grid_item .icon-links .edit").width()) + Math.floor($(".grid_item .icon-links .fav").width());
    // Get width of bookmark.
    var bookmark_width = $(".grid_item").width();

    // for each bookmark..
    $(".grid_item").each(function(index,element){
        checkTitleFont(element,icon_width,bookmark_width);
    });
}

function checkTitleFont(element, icon_width, bookmark_width){
    var $h2 = $(element).find("h2");

    // Check to see if title width > bookmark width - 3 icons
    if(parseInt($h2.width()) > (parseInt(bookmark_width) - parseInt(icon_width) - 50)){
        // if it is.. reduce title font size by 1 px; and check again..
        console.log($h2.css("font-size"));
        $h2.css("font-size", parseInt($h2.css("font-size")) - 1 + "px");
        checkTitleFont(element,icon_width,bookmark_width);
    }

}

function setupFavorites(){
    // Setup like and dislike buttons..
    $(".grid_item .fav").off('click').on('click', function(){
        var $grid_item = $(this).parents('.grid_item');
        $.post("php/bookmark.php", {"type":"like", "id":$grid_item.data("id")}, function(){
            $(".free_slot").first().replaceWith( "<div data-address=\""+ $grid_item.find("a").attr('href') +"\" class=\"favorite_link favorite_item\"><div class=\"remove-icon\" data-id=\""+ $grid_item.data('id') +"\"><i class=\"fas fa-trash-alt\"></i></div><img src=\""+ $grid_item.find("img").attr("src") +"\" alt=\"img25\"></div>" );
            setupFavorites();
        });
    });

    $(".favorite_link .remove-icon").off('click').on('click', function(event){
        event.stopPropagation();
        var parent = $(this).parent();
        $.post("php/bookmark.php", {"type":"unlike", "id":parent.data("id")}, function(){
            parent.replaceWith("<div class=\"free_slot\"><i class=\"fas fa-thumbs-up\"></i><img src=\"img/empty.png\" /></div>");
        });
    });

    $(".favorite_link").off('click').on('click', function(){
        var id = $(this).data("id");
        $("#fakelink").attr("href", $(this).data("address"));

        $.post("php/bookmark.php", {"type":"visit", "id":id}, function(){
            document.getElementById('fakelink').click();
            $("#fakelink").attr("href", $(this).data("#"));
        });
    });
}

function getGlobalStats(){
    $.post("/php/global_stats.php", {},  function(json_return){
        json_return = JSON.parse(json_return);

        if (json_return.total_visits) {
            $(".gstats .total_visits").html(json_return.total_visits);
        }

        if (json_return.last_bookmark) {
            $(".gstats .last_bookmark_name").html(json_return.last_bookmark.title);
            $(".gstats .last_bookmark_date").html(json_return.last_bookmark.lastvisit);
        }

        if (json_return.user_bookmarks) {
            $("#user_total_bookmarks").html(json_return.user_bookmarks);
        }

        if (json_return.topten) {
            $("#gstats_top_ten_bookmarks_list").empty();
            json_return.topten.forEach(function(element) {
                $("#gstats_top_ten_bookmarks_list").append("<li>"+ element.title + ": <strong>" + element.visits +"</strong></li>");
            });
        }

    });
    openRightHandSide('.gstats');
}

function openRightHandSide(panel){
    var rhs_width = 600;

    if($(window).width() < 767){
        rhs_width = 300;
    }

    if($(window).width() < 480){
        rhs_width = 125;
    }

    var gridMinus = $("#leftside_panel").outerWidth() + rhs_width;
    var gridWidth = $(window).width() - gridMinus;

    $(".rhs_inside").hide();
    $(panel).show();

    $(".rhs_wrapper").css({"display":"inline-block"}).delay(50).animate({"width":rhs_width}, 1000);
    $(".grid").animate({"width":gridWidth + "px"}, 1000, function () {$(this).css({"width":"calc(100% - " + gridMinus + "px)"});});

    $(".rhs_wrapper .close_x").off().on('click', function(){
        $(".grid").animate({"width":(gridWidth + rhs_width) + "px"}, 1000, function () {$(this).css({"width":""});});
        $(".rhs_wrapper").width(rhs_width - 1).animate({"width":0}, 1000, function(){$(".rhs_inside").hide();});
    });
}

function init() {
    setupLeftHandNav();
    setupBookmarkStats();
    setupDropzone();
    setupNewBookmarkSubmit();
    setupBookmarkVisit();
    setupNewGroupSubmit();
    setupFavorites();
    checkAllTitleFonts();
}

$(document).ready(init);