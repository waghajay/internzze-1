document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const number = document.getElementById("number").value;
        const college = document.getElementById("college").value;
        const linkedin = document.getElementById("linkedin").value;
        const github = document.getElementById("github").value;
        const program = document.getElementById("program").value;
        const description = document.getElementById("description").value;
        const referral = document.getElementById("referral").value;
        const priceElement = document.getElementById("price");

        try {
            const response = await fetch("https://internzze.com/api/StartupRegister", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, number, college, linkedin, github, program, description, referral }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`✅ Registration Successful!! Your Course price is updated ${result.price}`);
                
               
                if (priceElement) {
                    priceElement.textContent = `${result.price}`;
                }
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Something went wrong. Try again!");
        }
    });
});
