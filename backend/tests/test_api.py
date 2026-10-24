"""
Integration Tests for Flask API Endpoints
==========================================
Author: Avanish Ayyappan (Backend & Integration Lead)
"""

import unittest
import json
from backend.app import app


class TestFlaskAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_health_check(self):
        """GET /api/health returns 200 OK."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["status"], "HEALTHY")

    def test_get_network(self):
        """GET /api/network returns seeded campus topology."""
        res = self.client.get("/api/network")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("nodes", data)
        self.assertIn("links", data)
        self.assertIn("services", data)
        self.assertGreater(len(data["nodes"]), 0)

    def test_fail_and_restore_link_api(self):
        """Test POST /api/links/<id>/fail and /api/links/<id>/restore."""
        # Fail LINK_GW_CORE
        res_fail = self.client.post("/api/links/LINK_GW_CORE/fail", json={"severity": "HIGH"})
        self.assertEqual(res_fail.status_code, 200)
        data_fail = json.loads(res_fail.data)
        self.assertEqual(data_fail["event"]["status"], "FAILED")
        self.assertIn("lct_trace", data_fail)

        # Restore LINK_GW_CORE
        res_restore = self.client.post("/api/links/LINK_GW_CORE/restore")
        self.assertEqual(res_restore.status_code, 200)
        data_restore = json.loads(res_restore.data)
        self.assertEqual(data_restore["link"]["status"], "ACTIVE")

    def test_recovery_plan_api(self):
        """Test POST /api/recovery/plan returns candidate redundant links."""
        res = self.client.post("/api/recovery/plan")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("candidates", data)

    def test_history_api(self):
        """Test GET /api/history returns event audit records."""
        res = self.client.get("/api/history")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("failure_events", data)
        self.assertIn("recovery_events", data)
        self.assertIn("operations", data)


if __name__ == "__main__":
    unittest.main()
