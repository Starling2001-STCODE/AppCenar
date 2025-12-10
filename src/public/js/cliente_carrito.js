document.addEventListener("DOMContentLoaded", function () {
  var addButtons = document.querySelectorAll(".btn-add-to-cart");
  var removeButtons = document.querySelectorAll(".btn-remove-from-cart");

  addButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var productId = btn.getAttribute("data-product-id");
      if (!productId) {
        return;
      }

      fetch("/cliente/carrito/agregar/" + productId, {
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
          if (!data || !data.ok) {
            return;
          }
          alert("Producto agregado al carrito");
        })
        .catch(function () {});
    });
  });

  removeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var productId = btn.getAttribute("data-product-id");
      if (!productId) {
        return;
      }

      fetch("/cliente/carrito/eliminar/" + productId, {
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
          if (!data || !data.ok) {
            return;
          }
          window.location.reload();
        })
        .catch(function () {});
    });
  });
});
