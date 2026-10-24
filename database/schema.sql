-- ========================================================================
-- Campus Network Resilience Visualizer - Database Schema
-- Compatible with MySQL 8.0+ and SQLite (for tests and zero-dependency mode)
-- ========================================================================

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS operation_history;
DROP TABLE IF EXISTS recovery_events;
DROP TABLE IF EXISTS failure_events;
DROP TABLE IF EXISTS service_dependencies;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS network_links;
DROP TABLE IF EXISTS network_nodes;
DROP TABLE IF EXISTS buildings;

-- 1. Buildings
CREATE TABLE buildings (
    building_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    building_type VARCHAR(50) NOT NULL,
    location_label VARCHAR(100)
);

-- 2. Network Nodes (Routers, Switches, Labs, Servers)
CREATE TABLE network_nodes (
    node_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL, -- 'CORE_ROUTER', 'GATEWAY', 'SWITCH', 'SERVER', 'LAB'
    building_id VARCHAR(50),
    x_pos INT DEFAULT 0,
    y_pos INT DEFAULT 0,
    CONSTRAINT fk_nodes_building FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE SET NULL
);

-- 3. Network Links (Fiber, Ethernet, Wireless)
CREATE TABLE network_links (
    link_id VARCHAR(50) PRIMARY KEY,
    source_node_id VARCHAR(50) NOT NULL,
    target_node_id VARCHAR(50) NOT NULL,
    latency_ms FLOAT NOT NULL DEFAULT 5.0,
    cost INT NOT NULL DEFAULT 10,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'FAILED', 'RECOVERED'
    is_tree_edge BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = primary LCT tree edge, FALSE = redundant candidate
    CONSTRAINT fk_links_source FOREIGN KEY (source_node_id) REFERENCES network_nodes(node_id) ON DELETE CASCADE,
    CONSTRAINT fk_links_target FOREIGN KEY (target_node_id) REFERENCES network_nodes(node_id) ON DELETE CASCADE
);

-- 4. Services (LMS, Portal, Library, Cloud, ERP)
CREATE TABLE services (
    service_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Service Dependencies (which nodes must be reachable for service to function)
CREATE TABLE service_dependencies (
    service_id VARCHAR(50) NOT NULL,
    node_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (service_id, node_id),
    CONSTRAINT fk_sd_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    CONSTRAINT fk_sd_node FOREIGN KEY (node_id) REFERENCES network_nodes(node_id) ON DELETE CASCADE
);

-- 6. Failure Events Timeline
CREATE TABLE failure_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    link_id VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'RESOLVED'
    notes TEXT,
    CONSTRAINT fk_fe_link FOREIGN KEY (link_id) REFERENCES network_links(link_id) ON DELETE CASCADE
);

-- 7. Recovery Events Log
CREATE TABLE recovery_events (
    recovery_id INT AUTO_INCREMENT PRIMARY KEY,
    failure_event_id INT,
    action_type VARCHAR(50) NOT NULL, -- 'RESTORE_ORIGINAL', 'ACTIVATE_REDUNDANT'
    link_id VARCHAR(50) NOT NULL,
    cost_used INT DEFAULT 0,
    recovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    outcome VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'PARTIAL', 'FAILED'
    CONSTRAINT fk_re_event FOREIGN KEY (failure_event_id) REFERENCES failure_events(event_id) ON DELETE SET NULL,
    CONSTRAINT fk_re_link FOREIGN KEY (link_id) REFERENCES network_links(link_id) ON DELETE CASCADE
);

-- 8. Operation History (Undo / Redo and Audit Trail)
CREATE TABLE operation_history (
    operation_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL, -- 'FAIL_LINK', 'RESTORE_LINK', 'APPLY_RECOVERY', 'ADD_NODE', 'ADD_LINK'
    payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    undone_at TIMESTAMP NULL DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX idx_links_nodes ON network_links(source_node_id, target_node_id);
CREATE INDEX idx_links_status ON network_links(status);
CREATE INDEX idx_fe_status ON failure_events(status);
