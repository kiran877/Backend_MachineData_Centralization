/* =====================================================
   BestGroup Manufacturing Digitization Platform
   Version: 2.0 (Enterprise Ready)
   ISA-95 + Collection Layer + Tag Engineering
   ===================================================== */

IF DB_ID('BestGroup') IS NOT NULL
BEGIN
    DROP DATABASE BestGroup;
END
GO

CREATE DATABASE BestGroup;
GO

USE BestGroup;
GO

/* ============================
   ORGANIZATION HIERARCHY (ISA-95)
   ============================ */

CREATE TABLE plants (
    plant_id INT IDENTITY(1,1) PRIMARY KEY,
    plant_code NVARCHAR(50) NOT NULL UNIQUE,
    plant_name NVARCHAR(150) NOT NULL,
    location NVARCHAR(150),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE areas (
    area_id INT IDENTITY(1,1) PRIMARY KEY,
    plant_id INT NOT NULL,
    area_name NVARCHAR(150) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id)
);
GO

CREATE TABLE lines (
    line_id INT IDENTITY(1,1) PRIMARY KEY,
    area_id INT NOT NULL,
    line_code NVARCHAR(50) NOT NULL,
    line_name NVARCHAR(150) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (area_id) REFERENCES areas(area_id)
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
    digitization_status NVARCHAR(100) DEFAULT 'Not Assessed',
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (line_id) REFERENCES lines(line_id)
);
GO

/* ============================
   PROCESS & PARAMETERS
   ============================ */

CREATE TABLE processes (
    process_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    process_name NVARCHAR(150) NOT NULL,
    part_name NVARCHAR(150),
    cycle_time_seconds INT,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);
GO

CREATE TABLE process_parameters (
    parameter_id INT IDENTITY(1,1) PRIMARY KEY,
    process_id INT NOT NULL,
    parameter_name NVARCHAR(150) NOT NULL,
    unit NVARCHAR(50),
    control_limit_min FLOAT,
    control_limit_max FLOAT,
    set_point FLOAT,
    alarm_enabled BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (process_id) REFERENCES processes(process_id)
);
GO

/* ============================
   PLC / HMI
   ============================ */

CREATE TABLE plcs (
    plc_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    plc_make NVARCHAR(150),
    plc_model NVARCHAR(150),
    plc_software_version NVARCHAR(50),
    plc_firmware_version NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);
GO

CREATE TABLE hmis (
    hmi_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    hmi_make NVARCHAR(150),
    hmi_model NVARCHAR(150),
    hmi_ip NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
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
    default_port INT,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE machine_protocols (
    machine_protocol_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    protocol_id INT NOT NULL,
    is_primary BIT DEFAULT 0,
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id),
    FOREIGN KEY (protocol_id) REFERENCES protocols(protocol_id)
);
GO

/* ============================
   PLC TAG ENGINEERING LAYER
   ============================ */

CREATE TABLE plc_tags (
    tag_id INT IDENTITY(1,1) PRIMARY KEY,
    machine_id INT NOT NULL,
    tag_name NVARCHAR(255) NOT NULL,
    tag_path NVARCHAR(500),
    description NVARCHAR(255),
    data_type NVARCHAR(50),
    io_type NVARCHAR(50),
    plc_address NVARCHAR(100),
    engineering_unit NVARCHAR(50),
    raw_min FLOAT,
    raw_max FLOAT,
    eng_min FLOAT,
    eng_max FLOAT,
    deadband FLOAT,
    history_enabled BIT DEFAULT 0,
    security_level NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
);
GO

/* ============================
   ALARM CONFIGURATION
   ============================ */

CREATE TABLE tag_alarm_configs (
    alarm_id INT IDENTITY(1,1) PRIMARY KEY,
    tag_id INT NOT NULL,
    alarm_type NVARCHAR(20),
    threshold FLOAT,
    priority INT,
    is_enabled BIT DEFAULT 1,
    FOREIGN KEY (tag_id) REFERENCES plc_tags(tag_id)
);
GO

/* ============================
   ROLE / DEPARTMENT / USERS
   ============================ */

CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(100) NOT NULL UNIQUE
);
GO

CREATE TABLE departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    department_code NVARCHAR(50) NOT NULL UNIQUE,
    department_name NVARCHAR(150) NOT NULL
);
GO

CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NOT NULL,
    plant_id INT NULL,
    line_id INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (plant_id) REFERENCES plants(plant_id),
    FOREIGN KEY (line_id) REFERENCES lines(line_id)
);
GO

PRINT 'BestGroup Manufacturing Schema v2.0 Created Successfully';
GO
