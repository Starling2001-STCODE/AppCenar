document.addEventListener("DOMContentLoaded", function () {
  var buttons = document.querySelectorAll(".commerce-favorite");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var commerceId = btn.getAttribute("data-commerce-id");
      if (!commerceId) {
        return;
      }

      fetch("/cliente/favoritos/" + commerceId + "/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      })
        .then(function (res) {
          if (!res.ok) {
            return null;
          }
          return res.json();
        })
        .then(function (data) {
          if (!data || typeof data.isFavorite === "undefined") {
            return;
          }

          var iconSpan = btn.querySelector(".favorite-icon");
          if (data.isFavorite) {
            btn.classList.add("is-favorite");
            if (iconSpan) {
              iconSpan.textContent = "♥";
            }
          } else {
            btn.classList.remove("is-favorite");
            if (iconSpan) {
              iconSpan.textContent = "♡";
            }
          }
        })
        .catch(function () {});
    });
  });
});
