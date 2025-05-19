document.getElementById("userForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value
    };

    fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to create user");
            return res.json();
        })
    .then(data => {
        document.getElementById("statusMessage").textContent = "✅ User created successfully!";
        document.getElementById("statusMessage").style.color = "green";
        localStorage.setItem("user", JSON.stringify(data));
    })
    .catch(err => {
        document.getElementById("statusMessage").textContent = "❌ Error: " + err.message;
        document.getElementById("statusMessage").style.color = "red";
    });
});