-- ========================================================================
-- Campus Network Resilience Visualizer - Seed Data
-- 3D Buildings & Spacious Satellite Coordinates
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
('BLD_DC', 'Campus Data Center & Vault', 'DATACENTER', 'East Wing Underground');

-- 2. Network Nodes (Each represents a 3D Campus Building & Its Hardware)
INSERT INTO network_nodes (node_id, name, node_type, building_id, x_pos, y_pos) VALUES
('NODE_GW', 'Telecom Gateway Tower', 'GATEWAY', 'BLD_GATEWAY', 500, 70),
('NODE_CORE', 'Main Academic Core Block', 'CORE_ROUTER', 'BLD_MAIN', 500, 320),
('NODE_CSE_SW', 'Computer Science Department', 'SWITCH', 'BLD_CSE', 150, 480),
('NODE_CSE_LAB1', 'High-Perf Computing Lab', 'LAB', 'BLD_CSE', 150, 680),
('NODE_DC_SW', 'Cloud Data Center Hub', 'SWITCH', 'BLD_DC', 850, 320),
('NODE_LMS_SRV', 'LMS e-Learning Server', 'SERVER', 'BLD_DC', 1040, 240),
('NODE_LIB_PORTAL', 'Digital Library Vault', 'SERVER', 'BLD_DC', 1040, 400),
('NODE_ADMIN_SW', 'Administrative HQ', 'SWITCH', 'BLD_ADMIN', 400, 640),
('NODE_LIB_SW', 'Central University Library', 'SWITCH', 'BLD_LIB', 750, 640);

-- 3. Network Links
INSERT INTO network_links (link_id, source_node_id, target_node_id, latency_ms, cost, status, is_tree_edge) VALUES
-- Primary Backbone (Link-Cut Tree Forest)
('LINK_GW_CORE', 'NODE_GW', 'NODE_CORE', 2.1, 5, 'ACTIVE', TRUE),
('LINK_CORE_DC', 'NODE_CORE', 'NODE_DC_SW', 1.2, 3, 'ACTIVE', TRUE),
('LINK_DC_LMS', 'NODE_DC_SW', 'NODE_LMS_SRV', 0.5, 1, 'ACTIVE', TRUE),
('LINK_DC_LIBPORTAL', 'NODE_DC_SW', 'NODE_LIB_PORTAL', 0.8, 1, 'ACTIVE', TRUE),
('LINK_CORE_CSE', 'NODE_CORE', 'NODE_CSE_SW', 3.4, 8, 'ACTIVE', TRUE),
('LINK_CSE_LAB1', 'NODE_CSE_SW', 'NODE_CSE_LAB1', 1.0, 2, 'ACTIVE', TRUE),
('LINK_CORE_ADMIN', 'NODE_CORE', 'NODE_ADMIN_SW', 2.8, 6, 'ACTIVE', TRUE),
('LINK_ADMIN_LIB', 'NODE_ADMIN_SW', 'NODE_LIB_SW', 4.5, 12, 'ACTIVE', TRUE),

-- Redundant Backup Fiber Links (Standby non-tree routes)
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
