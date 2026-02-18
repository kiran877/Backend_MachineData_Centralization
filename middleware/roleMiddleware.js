const roles = {
    Admin: ['Admin'],
    Manager: ['Admin', 'Manager'],
    Supervisor: ['Admin', 'Manager', 'Supervisor'],
    User: ['Admin', 'Manager', 'Supervisor', 'Operator', 'Plant Head', 'Management']
    // Note: 'User' broadly covers everyone for read access. 
    // Refined based on DB roles: 'Operator', 'Supervisor', 'Plant Head', 'Management', 'Admin'
};

// Map DB Role Names to Logical Levels if needed, or just use direct array checks.

module.exports = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.user.role; // e.g., 'Admin', 'Supervisor'

        // Define Hierarchy or Specific Allow Lists
        // Admin > Manager > Supervisor > Operator/User

        let allowed = false;

        if (requiredRole === 'Admin' && userRole === 'Admin') allowed = true;
        if (requiredRole === 'Manager' && ['Admin', 'Manager', 'Plant Head'].includes(userRole)) allowed = true;
        if (requiredRole === 'Supervisor' && ['Admin', 'Manager', 'Plant Head', 'Supervisor'].includes(userRole)) allowed = true;
        if (requiredRole === 'User') allowed = true; // Everyone is a user

        if (!allowed) {
            return res.status(403).json({ message: 'Access Forbidden' });
        }
        next();
    };
};
