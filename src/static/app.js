document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select (keep the placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Title and basic info
        const titleEl = document.createElement("h4");
        titleEl.textContent = name;

        const descEl = document.createElement("p");
        descEl.textContent = details.description;

        const scheduleEl = document.createElement("p");
        scheduleEl.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availabilityEl = document.createElement("p");
        availabilityEl.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        activityCard.appendChild(titleEl);
        activityCard.appendChild(descEl);
        activityCard.appendChild(scheduleEl);
        activityCard.appendChild(availabilityEl);

        // Participants section
        const participantsHeader = document.createElement("p");
        participantsHeader.innerHTML = "<strong>Participants:</strong>";

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.className = "participant-item";
            li.textContent = email;
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "participants-empty";
          li.textContent = "No participants yet";
          participantsList.appendChild(li);
        }

        activityCard.appendChild(participantsHeader);
        activityCard.appendChild(participantsList);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
