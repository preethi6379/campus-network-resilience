"""
Unit Tests for Campus Graph Model & Recovery Engine
===================================================
Author: Avanish Ayyappan (Backend & Algorithm Lead)
"""

import unittest
from backend.algorithms.graph_model import CampusGraphModel, NetworkNode, NetworkLink


class TestGraphModel(unittest.TestCase):

    def setUp(self):
        self.gm = CampusGraphModel()
        # Add sample campus nodes
        self.gm.add_node(NetworkNode("GW", "Gateway Router", "GATEWAY"))
        self.gm.add_node(NetworkNode("CORE", "Core Router", "CORE_ROUTER"))
        self.gm.add_node(NetworkNode("LMS", "LMS Server", "SERVER"))
        self.gm.add_node(NetworkNode("CSE", "CSE Lab", "LAB"))

        # Add links
        self.gm.add_link(NetworkLink("LINK_GW_CORE", "GW", "CORE", latency_ms=2.0, cost=5, status="ACTIVE", is_tree_edge=True))
        self.gm.add_link(NetworkLink("LINK_CORE_LMS", "CORE", "LMS", latency_ms=1.5, cost=3, status="ACTIVE", is_tree_edge=True))
        self.gm.add_link(NetworkLink("LINK_CORE_CSE", "CORE", "CSE", latency_ms=3.0, cost=6, status="ACTIVE", is_tree_edge=True))

        # Add standby redundant backup link
        self.gm.add_link(NetworkLink("LINK_BACKUP_GW_LMS", "GW", "LMS", latency_ms=4.0, cost=10, status="STANDBY", is_tree_edge=False))

        # Register services
        self.gm.register_service("SRV_LMS", "Learning Management System", "Course portal", ["LMS", "CORE"])

    def test_initial_connectivity_and_service_impact(self):
        """Initially, GW is connected to LMS and LMS service is operational."""
        self.assertTrue(self.gm.is_connected("GW", "LMS"))
        impact = self.gm.compute_service_impact("GW")
        self.assertEqual(impact["available_count"], 1)
        self.assertEqual(impact["impacted_count"], 0)

    def test_link_failure_disconnects_and_impacts_service(self):
        """Failing bridge link LINK_CORE_LMS cuts component and marks service impacted."""
        res = self.gm.fail_link("LINK_CORE_LMS")
        self.assertTrue(res["cut_success"])
        self.assertFalse(self.gm.is_connected("GW", "LMS"))

        impact = self.gm.compute_service_impact("GW")
        self.assertEqual(impact["available_count"], 0)
        self.assertEqual(impact["impacted_count"], 1)
        self.assertEqual(impact["impacted"][0]["id"], "SRV_LMS")

    def test_recovery_candidate_detection(self):
        """When bridge fails, redundant standby link must be identified as recovery candidate."""
        self.gm.fail_link("LINK_CORE_LMS")
        candidates = self.gm.find_replacement_candidates()
        self.assertGreater(len(candidates), 0)
        self.assertEqual(candidates[0]["link_id"], "LINK_BACKUP_GW_LMS")

    def test_recovery_application_restores_service(self):
        """Applying backup recovery link restores dynamic connectivity and services."""
        self.gm.fail_link("LINK_CORE_LMS")
        recovery_res = self.gm.apply_recovery_link("LINK_BACKUP_GW_LMS")
        self.assertTrue(recovery_res["success"])
        self.assertTrue(self.gm.is_connected("GW", "LMS"))

        impact = self.gm.compute_service_impact("GW")
        # Since CORE is still connected to GW, and LMS is now connected via backup link, LMS service is back operational!
        self.assertEqual(impact["available_count"], 1)
        self.assertEqual(impact["impacted_count"], 0)

    def test_restore_original_link(self):
        """Restoring original link resets link to ACTIVE."""
        self.gm.fail_link("LINK_CORE_CSE")
        self.assertFalse(self.gm.is_connected("GW", "CSE"))
        restore_res = self.gm.restore_link("LINK_CORE_CSE")
        self.assertTrue(restore_res["restored"])
        self.assertTrue(self.gm.is_connected("GW", "CSE"))


if __name__ == "__main__":
    unittest.main()
