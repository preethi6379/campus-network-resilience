"""
Unit Tests for Link-Cut Tree (LCT) Dynamic Forest
=================================================
Author: Avanish Ayyappan (Backend & Algorithm Lead)
"""

import unittest
from backend.algorithms.link_cut_tree import LinkCutTree


class TestLinkCutTree(unittest.TestCase):

    def setUp(self):
        self.lct = LinkCutTree()

    def test_single_node_connectivity(self):
        """Single node must be connected to itself, but not to other nodes."""
        self.assertTrue(self.lct.connected("A", "A"))
        self.assertFalse(self.lct.connected("A", "B"))

    def test_link_and_connectivity(self):
        """Linking u and v must establish connectivity in O(log V) time."""
        linked = self.lct.link("A", "B")
        self.assertTrue(linked)
        self.assertTrue(self.lct.connected("A", "B"))

        # Chain link A - B - C
        self.lct.link("B", "C")
        self.assertTrue(self.lct.connected("A", "C"))
        self.assertFalse(self.lct.connected("A", "D"))

    def test_cycle_rejection(self):
        """LCT must reject linking already connected nodes to maintain forest invariant."""
        self.lct.link("A", "B")
        self.lct.link("B", "C")
        # Attempt to link A and C (would form cycle)
        cycle_linked = self.lct.link("A", "C")
        self.assertFalse(cycle_linked, "LCT must reject cycle-inducing edges.")

    def test_self_loop_rejection(self):
        """LCT must reject self-loops."""
        self.assertFalse(self.lct.link("A", "A"))

    def test_cut_and_disconnection(self):
        """Cutting an existing edge must partition the component."""
        self.lct.link("A", "B")
        self.lct.link("B", "C")
        self.assertTrue(self.lct.connected("A", "C"))

        # Cut B - C
        cut_success = self.lct.cut("B", "C")
        self.assertTrue(cut_success)
        self.assertTrue(self.lct.connected("A", "B"))
        self.assertFalse(self.lct.connected("A", "C"))
        self.assertFalse(self.lct.connected("B", "C"))

    def test_repeated_link_and_cut(self):
        """Repeated link/cut stress test."""
        for _ in range(5):
            self.lct.link("X", "Y")
            self.assertTrue(self.lct.connected("X", "Y"))
            self.lct.cut("X", "Y")
            self.assertFalse(self.lct.connected("X", "Y"))

    def test_path_latency_aggregation(self):
        """LCT must accurately aggregate path metrics in O(log V)."""
        node_gw = self.lct.get_or_create_node("GW", val=2.0)
        node_core = self.lct.get_or_create_node("CORE", val=3.0)
        node_lms = self.lct.get_or_create_node("LMS", val=1.5)

        self.lct.link("GW", "CORE")
        self.lct.link("CORE", "LMS")

        path_metrics = self.lct.query_path("GW", "LMS")
        self.assertIsNotNone(path_metrics)
        # Sum = 2.0 + 3.0 + 1.5 = 6.5
        self.assertAlmostEqual(path_metrics["path_latency_sum"], 6.5)
        # Max = 3.0
        self.assertAlmostEqual(path_metrics["path_max_latency"], 3.0)
        # Count = 3 nodes
        self.assertEqual(path_metrics["path_node_count"], 3)

    def test_educational_trace_generation(self):
        """Operations must log educational trace steps for UI visualization."""
        self.lct.clear_trace()
        self.lct.link("ALPHA", "BETA")
        trace = self.lct.trace
        self.assertGreater(len(trace), 0)
        # Verify trace structure
        first_step = trace[0]
        self.assertIn("step", first_step)
        self.assertIn("operation", first_step)
        self.assertIn("explanation", first_step)


if __name__ == "__main__":
    unittest.main()
