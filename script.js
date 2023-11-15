function createCard(data) {
  const card = document.createElement("div");
  card.classList.add("card");

  const nameElement = document.createElement("h2");
  nameElement.textContent = `Name: ${data.name}`;

  const ageElement = document.createElement("p");
  ageElement.textContent = `Age: ${data.age}`;

  card.appendChild(nameElement);
  card.appendChild(ageElement);

  return card;
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("myForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get values from the form
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;

    // Validate the values
    if (name.trim() === "" || isNaN(age)) {
      alert("Please enter valid values for name and age.");
      return;
    }

    // You can perform further actions here, such as sending the data to a server or processing it in some way.
    // For now, let's just log the values to the console.

    window.ipcRenderer.send("some-message", { name, age });
    window.ipcRenderer.on("recieve-response", (data) => {
      console.log({ data });
      const container = document.getElementById("card-container");
      container.innerHTML = "";

      data.forEach((item) => {
        const card = createCard(item);
        container.appendChild(card);
      });
    });

    // Optionally, you can reset the form after submission
    form.reset();
  });
});
