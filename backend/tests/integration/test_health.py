from fastapi.testclient import TestClient

from main import app


# Confirm the API starts and its unauthenticated liveness route responds with the service status.
def test_health_endpoint():
    # The smoke test verifies that the application can start and serve its public health route.
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "easypay-api"}
