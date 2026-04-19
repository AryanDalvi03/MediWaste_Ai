/**
 * ============================================================
 *  MEDIWASTE AI — COMPLETE DATABASE SETUP SCRIPT
 *  Run this in MongoDB Shell (mongosh) to fully initialize
 *  the mediwaste_db database from scratch.
 *
 *  Usage:
 *    mongosh "mongodb://localhost:27017" --file mediwaste_db_setup.js
 *
 *  Or paste block-by-block into mongosh interactive shell.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// STEP 0 : Connect to / Create the Database
// ─────────────────────────────────────────────────────────────
use mediwaste_db;
print("✔ Using database: mediwaste_db");


// ─────────────────────────────────────────────────────────────
// STEP 1 : Drop Existing Collections (clean slate)
// ─────────────────────────────────────────────────────────────
db.users.drop();
db.scans.drop();
db.staff.drop();
db.bins.drop();
db.work_log.drop();
db.reports_statistics.drop();
db.activity_logs.drop();
print("✔ Dropped all existing collections");


// ─────────────────────────────────────────────────────────────
// STEP 2 : Create Collections Explicitly
// ─────────────────────────────────────────────────────────────
db.createCollection("users");
db.createCollection("scans");
db.createCollection("staff");
db.createCollection("bins");
db.createCollection("work_log");
db.createCollection("reports_statistics");
db.createCollection("activity_logs");
print("✔ All collections created");


// ─────────────────────────────────────────────────────────────
// STEP 3 : Create Indexes
// ─────────────────────────────────────────────────────────────

// users — unique email
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_users_email_unique" });

// scans — filter by user, sort by time, multi-hospital support
db.scans.createIndex({ "user_id": 1 },    { name: "idx_scans_user_id" });
db.scans.createIndex({ "timestamp": -1 }, { name: "idx_scans_timestamp_desc" });
db.scans.createIndex({ "hospital_id": 1}, { name: "idx_scans_hospital_id" });

// staff — unique name (used as FK reference by bins.worker)
db.staff.createIndex({ "name": 1 }, { unique: true, name: "idx_staff_name_unique" });

// bins — unique human-readable ID + fast floor queries
db.bins.createIndex({ "id": 1 },    { unique: true, name: "idx_bins_id_unique" });
db.bins.createIndex({ "floor": 1 }, { name: "idx_bins_floor" });

// work_log — sort by time descending for audit trail
db.work_log.createIndex({ "timestamp": -1 }, { name: "idx_work_log_timestamp_desc" });
db.work_log.createIndex({ "staff_name": 1 }, { name: "idx_work_log_staff_name" });
db.work_log.createIndex({ "bin_id": 1 },     { name: "idx_work_log_bin_id" });

// reports_statistics — lookup by period key
db.reports_statistics.createIndex({ "period": 1 }, { name: "idx_reports_period" });

// activity_logs — audit trail filter
db.activity_logs.createIndex({ "user_id": 1 },   { name: "idx_activity_user_id" });
db.activity_logs.createIndex({ "timestamp": -1 }, { name: "idx_activity_timestamp" });

print("✔ All indexes created");


// ─────────────────────────────────────────────────────────────
// STEP 4 : Seed — staff Collection
//   Rule: 1 staff member per floor (floors 1, 2, 3)
//   Field: name is used as FK in bins.worker
// ─────────────────────────────────────────────────────────────
db.staff.insertMany([
  {
    name     : "jay gupta",
    ward     : "Radiology Ward",
    floor    : 1,
    accuracy : 98.5,
    items    : 342,
    rank     : 1,
    role     : "Waste Supervisor"
  },
  {
    name     : "kishore sharma",
    ward     : "Surgery Ward",
    floor    : 2,
    accuracy : 97.2,
    items    : 428,
    rank     : 2,
    role     : "Disposal Coordinator"
  },
  {
    name     : "Asha pathak",
    ward     : "ICU Ward",
    floor    : 3,
    accuracy : 96.8,
    items    : 567,
    rank     : 3,
    role     : "Segregation Officer"
  }
]);
print("✔ staff collection seeded (3 documents)");


// ─────────────────────────────────────────────────────────────
// STEP 5 : Seed — bins Collection
//   Naming: F<floor><sequence>  e.g. F11 = Floor 1 Bin 1
//   Compartments: fill % for Infectious / Sharps / General / Chemical
//   overallFill: highest compartment value (triggers alerts at ≥80)
// ─────────────────────────────────────────────────────────────
db.bins.insertMany([

  // ── FLOOR 1 — Assigned to: jay gupta ──────────────────────
  {
    id           : "F11",
    floor        : 1,
    roomId       : "ER-1",
    compartments : { Infectious: 72, Sharps: 91, General: 40, Chemical: 10 },
    worker       : "jay gupta",
    workerRole   : "Waste Supervisor",
    lastCollected: new Date(),
    collections  : 8,
    status       : "Full",
    overallFill  : 91
  },
  {
    id           : "F12",
    floor        : 1,
    roomId       : "ICU-1",
    compartments : { Infectious: 40, Sharps: 20, General: 72, Chemical: 5 },
    worker       : "jay gupta",
    workerRole   : "Waste Supervisor",
    lastCollected: new Date(),
    collections  : 5,
    status       : "Active",
    overallFill  : 72
  },

  // ── FLOOR 2 — Assigned to: kishore sharma ─────────────────
  {
    id           : "F21",
    floor        : 2,
    roomId       : "SURG-2",
    compartments : { Infectious: 67, Sharps: 89, General: 12, Chemical: 4 },
    worker       : "kishore sharma",
    workerRole   : "Disposal Coordinator",
    lastCollected: new Date(),
    collections  : 9,
    status       : "Full",
    overallFill  : 89
  },
  {
    id           : "F22",
    floor        : 2,
    roomId       : "CARD-2",
    compartments : { Infectious: 14, Sharps: 20, General: 60, Chemical: 0 },
    worker       : "kishore sharma",
    workerRole   : "Disposal Coordinator",
    lastCollected: new Date(),
    collections  : 5,
    status       : "Active",
    overallFill  : 60
  },

  // ── FLOOR 3 — Assigned to: Asha pathak ────────────────────
  {
    id           : "F31",
    floor        : 3,
    roomId       : "PED-3",
    compartments : { Infectious: 55, Sharps: 30, General: 42, Chemical: 5 },
    worker       : "Asha pathak",
    workerRole   : "Segregation Officer",
    lastCollected: new Date(),
    collections  : 4,
    status       : "Active",
    overallFill  : 55
  },
  {
    id           : "F32",
    floor        : 3,
    roomId       : "ONC-3",
    compartments : { Infectious: 80, Sharps: 65, General: 22, Chemical: 45 },
    worker       : "Asha pathak",
    workerRole   : "Segregation Officer",
    lastCollected: new Date(),
    collections  : 6,
    status       : "Full",
    overallFill  : 80
  }

]);
print("✔ bins collection seeded (6 documents)");


// ─────────────────────────────────────────────────────────────
// STEP 6 : Seed — reports_statistics Collection
//   Base template document. The API dynamically adjusts
//   waste_generation.total_current_year by adding live scan
//   counts before returning to the frontend.
// ─────────────────────────────────────────────────────────────
db.reports_statistics.insertOne({
  period       : "base",
  generated_at : new Date(),

  waste_generation : {
    monthly_data : [
      { month: "Jan", current: 850,  previous: 760 },
      { month: "Feb", current: 790,  previous: 710 },
      { month: "Mar", current: 860,  previous: 740 },
      { month: "Apr", current: 920,  previous: 810 },
      { month: "May", current: 880,  previous: 800 },
      { month: "Jun", current: 930,  previous: 850 },
      { month: "Jul", current: 970,  previous: 890 },
      { month: "Aug", current: 990,  previous: 900 },
      { month: "Sep", current: 920,  previous: 840 },
      { month: "Oct", current: 900,  previous: 810 },
      { month: "Nov", current: 880,  previous: 850 },
      { month: "Dec", current: 950,  previous: 880 }
    ],
    total_current_year   : 10840,
    total_previous_year  : 9840,
    yearly_growth_pct    : 10.2,
    waste_per_bed_day    : 0.12,
    total_beds           : 250
  },

  composition : {
    breakdown : [
      { category: "General (Non-hazardous)", percentage: 58.2, kg: 6308 },
      { category: "Infectious",              percentage: 19.5, kg: 2113 },
      { category: "Sharps",                  percentage: 7.8,  kg: 845  },
      { category: "Pathological",            percentage: 5.3,  kg: 574  },
      { category: "Pharmaceutical",          percentage: 4.7,  kg: 509  },
      { category: "Chemical",                percentage: 3.2,  kg: 346  },
      { category: "Radioactive",             percentage: 1.3,  kg: 140  }
    ],
    hazardous_pct              : 41.8,
    who_benchmark              : 15.0,
    deviation_from_benchmark   : 26.8
  },

  financial : {
    cost_per_kg_general   : 12.0,
    cost_per_kg_hazardous : 45.0
  },

  environmental : {
    pct_incinerated        : 42.5,
    pct_autoclaved         : 31.2,
    pct_recycled           : 18.8,
    pct_landfill           : 7.5,
    co2_per_kg_incinerated : 1.2
  }
});
print("✔ reports_statistics collection seeded (1 document)");


// ─────────────────────────────────────────────────────────────
// STEP 7 : Seed — work_log Collection (Sample Audit Entries)
//   These are example entries showing what staff activity
//   looks like. Real entries are created via the API.
// ─────────────────────────────────────────────────────────────
db.work_log.insertMany([
  {
    bin_id      : "F11",
    staff_email : "jay.gupta@hospital.com",
    staff_name  : "jay gupta",
    action      : "bin_collected",
    note        : "Bin was at 91% — urgent collection done",
    timestamp   : new Date(Date.now() - 3600000)   // 1 hour ago
  },
  {
    bin_id      : "F21",
    staff_email : "kishore.sharma@hospital.com",
    staff_name  : "kishore sharma",
    action      : "bin_collected",
    note        : "",
    timestamp   : new Date(Date.now() - 7200000)   // 2 hours ago
  },
  {
    bin_id      : "F11",
    staff_email : "jay.gupta@hospital.com",
    staff_name  : "jay gupta",
    action      : "waste_disposed",
    note        : "Transferred to central incineration unit",
    timestamp   : new Date(Date.now() - 1800000)   // 30 mins ago
  },
  {
    bin_id      : "F32",
    staff_email : "asha.pathak@hospital.com",
    staff_name  : "Asha pathak",
    action      : "noted",
    note        : "Bin compartment seal damaged — maintenance required",
    timestamp   : new Date(Date.now() - 900000)    // 15 mins ago
  }
]);
print("✔ work_log collection seeded (4 sample documents)");


// ─────────────────────────────────────────────────────────────
// STEP 8 : Seed — scans Collection (Sample Scan History)
//   Real entries are inserted by the AI Scanner via the API.
//   These samples populate the Dashboard's Live Stream.
// ─────────────────────────────────────────────────────────────
db.scans.insertMany([
  { waste_type: "Syringe", confidence: 99.12, disposal_bin: "Red Sharps Bin",     hazard_status: "Hazardous",     user_email: "staff@hospital.com", timestamp: new Date(Date.now() - 300000)   },
  { waste_type: "Gauze",   confidence: 97.45, disposal_bin: "Yellow Clinical Bin", hazard_status: "Hazardous",     user_email: "staff@hospital.com", timestamp: new Date(Date.now() - 900000)   },
  { waste_type: "Gloves",  confidence: 98.76, disposal_bin: "Yellow Clinical Bin", hazard_status: "Hazardous",     user_email: "staff@hospital.com", timestamp: new Date(Date.now() - 1500000)  },
  { waste_type: "Mask",    confidence: 98.20, disposal_bin: "Blue Recycling Bin",  hazard_status: "Non-Hazardous", user_email: "staff@hospital.com", timestamp: new Date(Date.now() - 2100000)  },
  { waste_type: "Syringe", confidence: 96.88, disposal_bin: "Red Sharps Bin",     hazard_status: "Hazardous",     user_email: "staff@hospital.com", timestamp: new Date(Date.now() - 3300000)  },
  { waste_type: "Paper",   confidence: 99.89, disposal_bin: "Blue Recycling Bin",  hazard_status: "Non-Hazardous", user_email: "staff@hospital.com", timestamp: new Date(Date.now() - 4200000)  }
]);
print("✔ scans collection seeded (6 sample documents)");


// ─────────────────────────────────────────────────────────────
// STEP 9 : Verify — Print document counts for all collections
// ─────────────────────────────────────────────────────────────
print("\n══════════════════════════════════════════");
print("  DATABASE SETUP COMPLETE — VERIFICATION");
print("══════════════════════════════════════════");
print("  users              :", db.users.countDocuments());
print("  scans              :", db.scans.countDocuments());
print("  staff              :", db.staff.countDocuments());
print("  bins               :", db.bins.countDocuments());
print("  work_log           :", db.work_log.countDocuments());
print("  reports_statistics :", db.reports_statistics.countDocuments());
print("  activity_logs      :", db.activity_logs.countDocuments());
print("══════════════════════════════════════════");
print("  Database: mediwaste_db is ready!");
print("══════════════════════════════════════════\n");


// ─────────────────────────────────────────────────────────────
// STEP 10 : Sample Operational Queries (for reference/testing)
// ─────────────────────────────────────────────────────────────

// -- Get all bins on Floor 1
// db.bins.find({ floor: 1 }).pretty();

// -- Get all full bins needing urgent attention
// db.bins.find({ status: "Full" }).pretty();

// -- Get staff member details by name
// db.staff.findOne({ name: "jay gupta" });

// -- Get all bins assigned to a specific staff member
// db.bins.find({ worker: "jay gupta" }).pretty();

// -- Get audit trail (most recent 10 entries)
// db.work_log.find({}).sort({ timestamp: -1 }).limit(10).pretty();

// -- Count bins per floor
// db.bins.aggregate([ { $group: { _id: "$floor", count: { $sum: 1 } } } ]);

// -- Get hazardous scan count
// db.scans.countDocuments({ hazard_status: "Hazardous" });

// -- Group scans by waste type
// db.scans.aggregate([ { $group: { _id: "$waste_type", count: { $sum: 1 } } }, { $sort: { count: -1 } } ]);

// -- Cascade assign all Floor 1 bins to a new worker
// db.bins.updateMany({ floor: 1 }, { $set: { worker: "new name", workerRole: "new role" } });

// -- Delete a specific bin by ID
// db.bins.deleteOne({ id: "F13" });

// -- Find all work logs for today
// db.work_log.find({ timestamp: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
