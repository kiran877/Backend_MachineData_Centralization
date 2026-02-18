/* =====================================================
   Manufacturing Digitization Collection Layer Schema
   Version: 1.1
   Includes: Departments
   Database: ManufacturingDB
   ===================================================== */

IF DB_ID('BestGroup') IS NULL
BEGIN
    CREATE DATABASE BestGroup;
END
GO

USE BestGroup;
GO

/* ============================
   ORGANIZATION LAYER
   ============================ */

CREATE TABLE plants (
    plant_id INT IDENTITY(1,1) PRIMARY KEY,
    plant_code NVARCHAR(50) NOT NULL UNIQUE,
    plant_name NVARCHAR(150) NOT NULL,
    location NVARCHAR(150),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE lines (
    line_id INT IDENTITY(1,1) PRIMARY KEY,
    plant_id INT NOT NULL,
    line_code NVARCHAR(50) NOT NULL,
    line_name NVARCHAR(150) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);
GO

/* ============================
   MACHINE MASTER
   ============================ */

CREATE TABLE machines (
    machine_id INT IDENTITY(1,1) PRIMARY KEY,
    line_id INT NOT NULL,
    machine_code NVARCHAR(50) NOT NULL UNIQUE,
    machine_name NVARCHAR(150) NOT NULL,
    machine_type NVARCHAR(100),
    automation_type NVARCHAR(100),
    machine_picture_path NVARCHAR(255),
    digitization_status NVARCHAR(100) DEFAULT 'Not Assessed',
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (line_id) REFERENCES lines(line_id)
);
GO

/* ============================
   PLC LAYER
   ============================ */

CREATE TABLE plcs (
    plc_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    plc_make NVARCHAR(150),
    plc_model NVARCHAR(150),
    plc_software_name NVARCHAR(150),
    plc_software_version NVARCHAR(50),
    plc_firmware_version NVARCHAR(50),
    plc_picture_path NVARCHAR(255),
    total_ports INT,
    available_ports INT,
    admin_password VARBINARY(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);
GO

/* ============================
   HMI LAYER
   ============================ */

CREATE TABLE hmis (
    hmi_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    hmi_make NVARCHAR(150),
    hmi_model NVARCHAR(150),
    hmi_firmware_version NVARCHAR(50),
    hmi_software_name NVARCHAR(150),
    hmi_software_version NVARCHAR(50),
    hmi_ip NVARCHAR(50),
    total_ports INT,
    available_ports INT,
    hmi_picture_path NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);
GO

/* ============================
   NETWORK / DIGITIZATION LAYER
   ============================ */

CREATE TABLE machine_network_configs (
    network_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    vlan_details NVARCHAR(255),
    firewall_rules NVARCHAR(MAX),
    opc_ua_available BIT DEFAULT 0,
    opc_ua_server_type NVARCHAR(100),
    ethernet_enabled BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);
GO

/* ============================
   PROTOCOL ARCHITECTURE
   ============================ */

CREATE TABLE protocols (
    protocol_id INT IDENTITY(1,1) PRIMARY KEY,
    protocol_name NVARCHAR(100) NOT NULL UNIQUE,
    protocol_category NVARCHAR(100),
    default_port INT NULL,
    is_standard BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE machine_protocols (
    machine_protocol_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    protocol_id INT NOT NULL,
    is_enabled BIT DEFAULT 1,
    is_primary BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE,
    FOREIGN KEY (protocol_id) REFERENCES protocols(protocol_id),
    CONSTRAINT uq_machine_protocol UNIQUE(machine_id, protocol_id)
);
GO

CREATE TABLE machine_protocol_configs (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_protocol_id INT NOT NULL,
    ip_address NVARCHAR(50),
    port INT,
    rack NVARCHAR(50),
    slot NVARCHAR(50),
    node_id NVARCHAR(50),
    baud_rate NVARCHAR(50),
    security_mode NVARCHAR(100),
    certificate_path NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_protocol_id)
        REFERENCES machine_protocols(machine_protocol_id)
        ON DELETE CASCADE
);
GO

/* ============================
   ROLE & DEPARTMENT MANAGEMENT
   ============================ */

CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO roles (role_name)
VALUES ('Operator'),
       ('Supervisor'),
       ('Plant Head'),
       ('Management'),
       ('Admin');
GO

CREATE TABLE departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    department_code NVARCHAR(50) NOT NULL UNIQUE,
    department_name NVARCHAR(150) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

INSERT INTO departments (department_code, department_name)
VALUES ('PROD', 'Production'),
       ('MAINT', 'Maintenance'),
       ('QUALITY', 'Quality'),
       ('IT', 'IT'),
       ('DSI', 'Digitization & Innovation');
GO

/* ============================
   USERS
   ============================ */

CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(150) UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NOT NULL,
    plant_id INT NULL,
    line_id INT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    FOREIGN KEY (line_id) REFERENCES lines(line_id)
);
GO

/* ============================
   PERFORMANCE INDEXES
   ============================ */

CREATE INDEX idx_lines_plant ON lines(plant_id);
CREATE INDEX idx_machines_line ON machines(line_id);
CREATE INDEX idx_plc_machine ON plcs(machine_id);
CREATE INDEX idx_hmi_machine ON hmis(machine_id);
CREATE INDEX idx_network_machine ON machine_network_configs(machine_id);
CREATE INDEX idx_machine_protocol_machine ON machine_protocols(machine_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department_id);
GO

PRINT 'Schema Version 1.1 Successfully Created';
GO
