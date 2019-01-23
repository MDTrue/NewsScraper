$(document).ready(function () {
console.log("hello")
    //saving an article
    $(document).on("click","#saveButton",function(){
        event.preventDefault();
        var articleId =$(this).attr("id");
        $.ajax({
            method: "PUT",
            url: "/saved/" + articleId,
        })
        .then(function(data){
            window.location.replace("/saved/")
        })

    })
});