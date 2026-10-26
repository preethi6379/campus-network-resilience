-- ========================================================================
-- Campus Network Resilience Visualizer - Seed Data
-- Spacious Coordinates to Guarantee Zero Text / Building Overlap
-- ========================================================================

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
('BLD_MAIN', 'Main Academic Core Block', 'ACADEMIC', 'Central Campus'),
('BLD_CSE', 'Computer Science Department', 'ACADEMIC', 'West Wing'),
('BLD_LIB', 'Central University Library', 'LIBRARY', 'South-East Quad'),
('BLD_ADMIN', 'Administrative Headquarters', 'ADMIN', 'South-West Wing'),
('BLD_DC', 'Campus Data Center & Cloud Vault', 'DATACENTER', 'East Wing Underground');

-- 2. Network Nodes with Spacious Layout
INSERT INTO network_nodes (node_id, name, node_type, building_id, x_pos, y_pos) VALUES
('NODE_GW', 'Gateway Router (ISP)', 'GATEWAY', 'BLD_GATEWAY', 500, 90),
('NODE_CORE', 'Campus Core Router', 'CORE_ROUTER', 'BLD_MAIN', 500, 290),
('NODE_DC_SW', 'Data Center Core Switch', 'SWITCH', 'BLD_DC', 850, 270),
('NODE_LMS_SRV', 'LMS Server (e-Learning)', 'SERVER', 'BLD_DC', 970, 230),
('NODE_LIB_PORTAL', 'Digital Library Portal', 'SERVER', 'BLD_DC', 970, 340),
('NODE_CSE_SW', 'CSE Distribution Switch', 'SWITCH', 'BLD_CSE', 160, 420),
('NODE_CSE_LAB1', 'CSE High-Perf Computing Lab', 'LAB', 'BLD_CSE', 160, 560),
('NODE_ADMIN_SW', 'Admin Wing Switch', 'SWITCH', 'BLD_ADMIN', 390, 600),
('NODE_LIB_SW', 'Central Library Access Switch', 'SWITCH', 'BLD_LIB', 670, 600);

-- 3. Network Links
INSERT INTO network_links (link_id, source_node_id, target_node_id, latency_ms, cost, status, is_tree_edge) VALUES
-- Primary tree edges (Link-Cut Tree Backbone)
('LINK_GW_CORE', 'NODE_GW', 'NODE_CORE', 2.1, 5, 'ACTIVE', TRUE),
('LINK_CORE_DC', 'NODE_CORE', 'NODE_DC_SW', 1.2, 3, 'ACTIVE', TRUE),
('LINK_DC_LMS', 'NODE_DC_SW', 'NODE_LMS_SRV', 0.5, 1, 'ACTIVE', TRUE),
('LINK_DC_LIBPORTAL', 'NODE_DC_SW', 'NODE_LIB_PORTAL', 0.8, 1, 'ACTIVE', TRUE),
('LINK_CORE_CSE', 'NODE_CORE', 'NODE_CSE_SW', 3.4, 8, 'ACTIVE', TRUE),
('LINK_CSE_LAB1', 'NODE_CSE_SW', 'NODE_CSE_LAB1', 1.0, 2, 'ACTIVE', TRUE),
('LINK_CORE_ADMIN', 'NODE_CORE', 'NODE_ADMIN_SW', 2.8, 6, 'ACTIVE', TRUE),
('LINK_ADMIN_LIB', 'NODE_ADMIN_SW', 'NODE_LIB_SW', 4.5, 12, 'ACTIVE', TRUE),

-- Redundant Backup Links (Standby non-tree routes)
('LINK_BACKUP_CSE_DC', 'NODE_CSE_SW', 'NODE_DC_SW', 4.2, 15, 'STANDBY', FALSE),
('LINK_BACKUP_GW_DC', 'NODE_GW', 'NODE_DC_SW', 3.8, 20, 'STANDBY', FALSE),
('LINK_BACKUP_LIB_DC', 'NODE_LIB_SW', 'NODE_DC_SW', 5.0, 18, 'STANDBY', FALSE);

-- 4. Campus Services
INSERT INTO services (service_id, name, description) VALUES
('SRV_LMS', 'Student Learning Management System', 'Lecture slides, assignments, grading and quiz server'),
('SRV_LIB', 'Digital Research Library Portal', 'IEEE Xplore, ScienceDirect and university archives'),
('SRV_INTERNET', 'External Internet Uplink', 'Gateway ISP fiber optic redundant transceiver'),
('SRV_ERP', 'University Admin & Student ERP', 'Course registration, fee management and attendance');

-- 5. Service Dependencies
INSERT INTO service_dependencies (service_id, node_id) VALUES
('SRV_LMS', 'NODE_LMS_SRV'),
('SRV_LMS', 'NODE_DC_SW'),
('SRV_LIB', 'NODE_LIB_PORTAL'),
('SRV_LIB', 'NODE_DC_SW'),
('SRV_INTERNET', 'NODE_GW'),
('SRV_ERP', 'NODE_ADMIN_SW'),
('SRV_ERP', 'NODE_DC_SW');
