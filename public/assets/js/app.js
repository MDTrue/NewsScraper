$(document).ready(function () {
    //hiding the notes until called
    $(".noteContainer").hide();
    //saving an article
    $(document).on("click","#articleSaveButton",function(event){
        event.preventDefault();
        // console.log("hello")
        var articleId =$(this).data("id");
        $.ajax({
            method: "PUT",
            url: "/save/articles/" + articleId,
        })
        .then(function(data){
            window.location.replace("/articles/saved");
        })

    })
    //removing an article
    $(document).on("click","#articleRemoveButton",function(event){
        event.preventDefault();
        // console.log("hello")
        var articleId =$(this).data("id");
        $.ajax({
            method: "PUT",
            url: "/unsave/articles/" + articleId,
        })
        .then(function(data){
            window.location.replace("/articles/saved");
        })

    })

    //viewing notes
    $("#viewNotes").on("click",function(event){
        event.preventDefault();
        console.log("hello")
        //get the article id from the button
        var articleId = $(this).data("id");
        var toggleId = "#noteView" + $(this).data("id");
        $(toggleId).slideToggle();
        getNotes(articleId);

    })

    //posting notes
    $("#saveNote").on("click",function(event){
        event.preventDefault();
        console.log("hello")

        var inputTitle = "#titleInput" + $(this).data("id");
        var inputComment = "#commentInput" + $(this).data("id");
        var articleId = $(this).data("id");

        $.ajax({
            method: "POST",
            url: "/articles/" + articleId,
            data: {
                title: $(inputTitle).val(),
                body: $(inputComment).val()
            }
        }).then(function (data){
             getNotes(articleId);
        })
        $(inputTitle).val("");
        $(inputComment).val("");
        
    })



    // getting existing notes
    var getNotes = function(articleId){


 

        
        $.ajax({
            method: "GET",
            url: "/articles/:id" + articleId,
         
        }).then(function (data){
            var notes = data.notes;
        console.log(notes)
       })
    
       
   }

   
});