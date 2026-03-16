// ============================================================================
// MediWaste AI - MongoDB Guide Queries
// ============================================================================
// Run these commands in your `mongosh` (MongoDB Shell) or a tool like MongoDB Compass.
// 
// First, switch to your project database (as defined in your .env file)
// ============================================================================

use mediwaste_db;

// ---------------------------------------------------------
// 1. 👥 USERS COLLECTION QUERIES
// ---------------------------------------------------------

// Find all common users
db.users.find({ role: "common" });

// Find users for a specific hospital
db.users.find({ hospital_id: "HOSP_123" });

// Count total users by role (Aggregates how many users per role)
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
]);

// ---------------------------------------------------------
// 2. 📸 SCANS COLLECTION QUERIES
// ---------------------------------------------------------

// Show the most recent 5 scans
db.scans.find().sort({ timestamp: -1 }).limit(5);

// Find all scans for "hazardous" waste
db.scans.find({ hazard_status: "hazardous" });

// Find all mis-segregated waste (is_correct_bin = false) 
// - Useful for alerts or reporting
db.scans.find({ is_correct_bin: false });

// Group scans by waste type to see what is most commonly scanned
db.scans.aggregate([
  { $group: { _id: "$waste_type", totalScans: { $sum: 1 } } },
  { $sort: { totalScans: -1 } }
]);

// Calculate overall compliance score (percentage of correctly binned waste)
db.scans.aggregate([
  {
    $group: {
      _id: null,
      totalScans: { $sum: 1 },
      correctScans: { 
        $sum: { $cond: [{ $eq: ["$is_correct_bin", true] }, 1, 0] } 
      }
    }
  },
  {
    $project: {
      _id: 0,
      totalScans: 1,
      correctScans: 1,
      compliancePercentage: { 
        $multiply: [{ $divide: ["$correctScans", "$totalScans"] }, 100] 
      }
    }
  }
]);

// ---------------------------------------------------------
// 3. 📊 ACTIVITY LOGS QUERIES
// ---------------------------------------------------------

// Show the 10 most recent activity logs
db.activity_logs.find().sort({ timestamp: -1 }).limit(10);

// Find logs for a specific user action (e.g., 'scan_waste', 'login', etc.)
db.activity_logs.find({ action: "scan_waste" });

// Count the total number of actions performed by a specific user
db.activity_logs.find({ user_id: "USER_ID_GOES_HERE" }).count();
