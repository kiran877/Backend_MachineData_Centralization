/* 
   FIX COLUMNS ONLY SCRIPT
   Run this to add the missing columns to the 'machines' table.
*/

USE BestGroup;
GO

-- 1. Add updated_by
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_by')
BEGIN
    ALTER TABLE machines ADD updated_by INT NULL;
    ALTER TABLE machines ADD CONSTRAINT FK_Machines_UpdatedBy FOREIGN KEY (updated_by) REFERENCES users(user_id);
    PRINT 'SUCCESS: Added updated_by';
END
GO

-- 2. Add updated_at
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_at')
BEGIN
    ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE();
    PRINT 'SUCCESS: Added updated_at';
END
GO

-- 3. Add created_by
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'created_by')
BEGIN
    ALTER TABLE machines ADD created_by INT NULL;
    ALTER TABLE machines ADD CONSTRAINT FK_Machines_CreatedBy FOREIGN KEY (created_by) REFERENCES users(user_id);
    PRINT 'SUCCESS: Added created_by';
END
GO

PRINT 'Fix Complete.';
