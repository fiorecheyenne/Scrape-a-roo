/* eslint-disable no-invalid-this */
$(() => {
  $("form").on("submit", function(event) {
    const id = $(this)
      .closest(".modal")
      .attr("id");
    $(this)
      .find("button")
      .addClass("is-loading")
      .attr("disabled", true);
    const commentName = $(this)
      .find(".comment-name")
      .val();
    const commentMessage = $(this)
      .find(".comment-message")
      .val();
    $.ajax({
      type: "POST",
      url: "/api/comment",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        id,
        name: commentName,
        message: commentMessage
      }),
      timeout: 5000
    })
      .then(response => {
        $(this)
          .find("button")
          .attr("disabled", false);
        if (response.success) {
          const newComment = $(`
                        <article class="column is-12">
                            <b>${commentName}</b>
                            <br>
                            ${commentMessage}
                        </article> 
                    `);
          if (
            $(this)
              .parent()
              .find(".columns").length > 0
          ) {
            $(this)
              .parent()
              .find(".columns")
              .append(newComment);
            $(this)
              .find(".comment-name")
              .val("");
            $(this)
              .find(".comment-message")
              .val("");
          } else {
            // Reload the page if theres 0 comments
            window.location.reload();
          }
        } else {
          // TODO: Show end user error message
          console.log(response.errorMessage);
        }
      })
      .fail(response => {
        // TODO: Show error message to end user
      })
      .always(response => {
        $(this)
          .find("button")
          .removeClass("is-loading");
      });
    event.preventDefault();
  });
  $(".activate-modal").on("click", function(event) {
    const id = $(this).attr("data-id");
    if (id) $(`#${id}`).addClass("is-active");
    // TODO: Implement scraping comments from reddit based on id 😃
  });
  $(".modal-background, .modal-close").on("click", function(event) {
    $(this)
      .parent()
      .removeClass("is-active");
  });
});
