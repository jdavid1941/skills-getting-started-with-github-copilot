from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Basketball" in data


def test_signup_and_remove_participant():
    email = "test_user@example.com"

    # Ensure test email not present
    for act in activities.values():
        if email in act["participants"]:
            act["participants"].remove(email)

    # Sign up for Basketball
    resp = client.post(f"/activities/Basketball/signup?email={email}")
    assert resp.status_code == 200
    assert f"Signed up {email}" in resp.json().get("message", "")

    # Verify participant present
    resp = client.get("/activities")
    assert resp.status_code == 200
    assert email in resp.json()["Basketball"]["participants"]

    # Duplicate signup should fail (global uniqueness)
    resp = client.post(f"/activities/Basketball/signup?email={email}")
    assert resp.status_code == 400

    # Remove participant
    resp = client.delete(f"/activities/Basketball/participants?email={email}")
    assert resp.status_code == 200
    assert f"Removed {email}" in resp.json().get("message", "")

    # Verify removed
    resp = client.get("/activities")
    assert email not in resp.json()["Basketball"]["participants"]
