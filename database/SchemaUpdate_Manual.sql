/* 
   MANUAL SCHEMA UPDATE SCRIPT
   Reason: The application user does not have permission to ALTER tables.
   Please run this script using a user with admin privileges (e.g., sa) in your SQL Server Management Studio.
*/

USE BestGroup;
GO

-- 1. Add updated_by column and Foreign Key
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_by')
BEGIN
    ALTER TABLE machines ADD updated_by INT NULL;
    ALTER TABLE machines ADD CONSTRAINT FK_Machines_UpdatedBy FOREIGN KEY (updated_by) REFERENCES users(user_id);
    PRINT 'Added updated_by column and FK.';
END
GO

-- 2. Add updated_at column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_at')
BEGIN
    ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE();
    PRINT 'Added updated_at column.';
END
GO

-- 3. Add created_by column and Foreign Key
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'created_by')
BEGIN
    ALTER TABLE machines ADD created_by INT NULL;
    ALTER TABLE machines ADD CONSTRAINT FK_Machines_CreatedBy FOREIGN KEY (created_by) REFERENCES users(user_id);
    PRINT 'Added created_by column and FK.';
END
GO

PRINT 'Schema Update Complete.';
