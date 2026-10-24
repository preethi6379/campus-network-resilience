-- ========================================================================
-- Campus Network Resilience Visualizer - Seed Data
-- ========================================================================

-- Clear existing data
DELETE FROM operation_history;
DELETE FROM recovery_events;
DELETE FROM failure_events;
DELETE FROM service_dependencies;
DELETE FROM services;
DELETE FROM network_links;
DELETE FROM network_nodes;
DELETE FROM buildings;

-- 1. Campus Buildings
INSERT INTO buildings (building_id, name, building_type, location_label) VALUES
('BLD_GATEWAY', 'Campus Gate & Telecom Tower', 'INFRASTRUCTURE', 'North Perimeter'),
('BLD_MAIN', 'Main Academic Block', 'ACADEMIC', 'Central Campus'),
('BLD_CSE', 'Computer Science Department', 'ACADEMIC', 'East Wing'),
('BLD_LIB', 'Central Library', 'LIBRARY', 'South Quad'),
('BLD_ADMIN', 'Administrative Headquarters', 'ADMIN', 'West Wing'),
('BLD_DC', 'Campus Data Center & Cloud Hub', 'DATACENTER', 'Core Underground');

-- 2. Network Nodes
-- x_pos and y_pos calibrated for Cytoscape.js canvas layout
INSERT INTO network_nodes (node_id, name, node_type, building_id, x_pos, y_pos) VALUES
('NODE_GW', 'Gateway Router (ISP)', 'GATEWAY', 'BLD_GATEWAY', 400, 100),
('NODE_CORE', 'Campus Core Router', 'CORE_ROUTER', 'BLD_MAIN', 400, 240),
('NODE_DC_SW', 'Data Center Core Switch', 'SWITCH', 'BLD_DC', 600, 240),
('NODE_LMS_SRV', 'LMS Server (e-Learning)', 'SERVER', 'BLD_DC', 750, 240),
('NODE_LIB_PORTAL', 'Digital Library Portal', 'SERVER', 'BLD_DC', 750, 340),
('NODE_CSE_SW', 'CSE Lab Distribution Switch', 'SWITCH', 'BLD_CSE', 200, 360),
('NODE_CSE_LAB1', 'CSE High-Perf Computing Lab', 'LAB', 'BLD_CSE', 100, 480),
('NODE_ADMIN_SW', 'Admin Wing Switch', 'SWITCH', 'BLD_ADMIN', 400, 420),
('NODE_LIB_SW', 'Central Library Access Switch', 'SWITCH', 'BLD_LIB', 580, 460);

-- 3. Network Links
-- Primary tree edges form the baseline spanning forest for the Link-Cut Tree.
-- Non-tree edges represent redundant/standby backup fiber routes for resilience recovery.
INSERT INTO network_links (link_id, source_node_id, target_node_id, latency_ms, cost, status, is_tree_edge) VALUES
-- Core Infrastructure Backbone (Tree Edges)
('LINK_GW_CORE', 'NODE_GW', 'NODE_CORE', 2.1, 5, 'ACTIVE', TRUE),
('LINK_CORE_DC', 'NODE_CORE', 'NODE_DC_SW', 1.2, 3, 'ACTIVE', TRUE),
('LINK_DC_LMS', 'NODE_DC_SW', 'NODE_LMS_SRV', 0.5, 1, 'ACTIVE', TRUE),
('LINK_DC_LIBPORTAL', 'NODE_DC_SW', 'NODE_LIB_PORTAL', 0.8, 1, 'ACTIVE', TRUE),
('LINK_CORE_CSE', 'NODE_CORE', 'NODE_CSE_SW', 3.4, 8, 'ACTIVE', TRUE),
('LINK_CSE_LAB1', 'NODE_CSE_SW', 'NODE_CSE_LAB1', 1.0, 2, 'ACTIVE', TRUE),
('LINK_CORE_ADMIN', 'NODE_CORE', 'NODE_ADMIN_SW', 2.8, 6, 'ACTIVE', TRUE),
('LINK_ADMIN_LIB', 'NODE_ADMIN_SW', 'NODE_LIB_SW', 4.5, 12, 'ACTIVE', TRUE),

-- Redundant Backup Links (Non-Tree Edges - initially STANDBY / can be activated on failure)
('LINK_BACKUP_CSE_DC', 'NODE_CSE_SW', 'NODE_DC_SW', 4.2, 15, 'STANDBY', FALSE),
('LINK_BACKUP_GW_DC', 'NODE_GW', 'NODE_DC_SW', 3.8, 20, 'STANDBY', FALSE),
('LINK_BACKUP_LIB_DC', 'NODE_LIB_SW', 'NODE_DC_SW', 5.0, 18, 'STANDBY', FALSE);

-- 4. Campus Services
INSERT INTO services (service_id, name, description) VALUES
('SRV_LMS', 'Student Learning Management System', 'Hosts lecture slides, quizzes, and course submissions'),
('SRV_LIB', 'Digital Library Database', 'Access to IEEE, ACM, and campus research repositories'),
('SRV_INTERNET', 'External Internet Connectivity', 'Uplink access via campus Gateway ISP router'),
('SRV_ERP', 'University Admin & Payroll ERP', 'Administrative portals, attendance and fee records');

-- 5. Service Dependencies (which nodes are essential for service availability)
INSERT INTO service_dependencies (service_id, node_id) VALUES
('SRV_LMS', 'NODE_LMS_SRV'),
('SRV_LMS', 'NODE_DC_SW'),
('SRV_LIB', 'NODE_LIB_PORTAL'),
('SRV_LIB', 'NODE_DC_SW'),
('SRV_INTERNET', 'NODE_GW'),
('SRV_ERP', 'NODE_ADMIN_SW'),
('SRV_ERP', 'NODE_DC_SW');
