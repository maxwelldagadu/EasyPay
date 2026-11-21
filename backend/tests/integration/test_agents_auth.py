from fastapi.testclient import TestClient

from main import app


# Keep agent configuration inaccessible until Better Auth validates a session.
def test_agent_api_rejects_unauthenticated_requests():
    # An anonymous request must fail before attempting database-backed agent operations.
    with TestClient(app) as client:
        response = client.get("/api/v1/agents")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


# Guard the versioned feature prefix so frontend server actions always target the intended router.
def test_agent_management_routes_are_mounted_under_v1():
    # The OpenAPI route map verifies the complete Phase 2 API is reachable at its feature prefix.
    paths = app.openapi()["paths"]

    assert "/api/v1/agents" in paths
    assert "/api/v1/agents/{agent_id}" in paths
    assert "/api/v1/agents/{agent_id}/status" in paths
    assert "/api/v1/agents/{agent_id}/pin" in paths


def test_agent_conversation_routes_are_mounted_under_v1():
    # Confirm the complete conversation and proposal-review contract is mounted under the protected API.
    paths = app.openapi()["paths"]

    assert "/api/v1/agents/{agent_id}/conversation" in paths
    assert "/api/v1/agents/{agent_id}/conversation/{message_id}/apply" in paths
    assert "/api/v1/agents/{agent_id}/conversation/{message_id}/dismiss" in paths


def test_agent_conversation_rejects_unauthenticated_requests():
    # Conversation access must fail before reading message history from the database.
    with TestClient(app) as client:
        response = client.get("/api/v1/agents/agent-1/conversation")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"
