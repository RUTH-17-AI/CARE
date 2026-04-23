/**
 * CareAI - Node.js + Express + MongoDB Backend
 * Run: npm install express mongoose cors dotenv
 *      node server.js
 * Requires MongoDB running locally or set MONGO_URI env variable
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── MONGO CONNECTION ──────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/careai";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected:", MONGO_URI))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── SCHEMAS ───────────────────────────────────────────────────────────────

const PatientSchema = new mongoose.Schema(
  {
    patientId:       { type: String, unique: true, required: true },
    name:            { type: String, required: true },
    age:             { type: Number, required: true },
    gender:          { type: String, enum: ["Male", "Female", "Other"] },
    blood:           String,
    phone:           String,
    email:           String,
    address:         String,
    diagnosis:       String,
    risk:            { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
    status:          { type: String, default: "Monitoring" },
    doctor:          String,
    ward:            String,
    admitted:        String,
    lastVisit:       String,
    nextVisit:       String,
    weight:          String,
    height:          String,
    bp:              String,
    pulse:           String,
    temp:            String,
    riskFactors:     [String],
    recommendations: [String],
  },
  { timestamps: true }
);

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true, required: true },
    patientId:     { type: String, required: true },
    patientName:   String,
    doctor:        String,
    department:    String,
    date:          String,
    time:          String,
    type:          String,
    status:        { type: String, default: "Pending" },
    notes:         String,
  },
  { timestamps: true }
);

const AlertSchema = new mongoose.Schema(
  {
    patientId:   String,
    patientName: String,
    message:     String,
    risk:        String,
    sentAt:      { type: Date, default: Date.now },
    confirmed:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Patient     = mongoose.model("Patient",     PatientSchema);
const Appointment = mongoose.model("Appointment", AppointmentSchema);
const Alert       = mongoose.model("Alert",       AlertSchema);

// ─── SEED DATA ─────────────────────────────────────────────────────────────
async function seedIfEmpty() {
  const count = await Patient.countDocuments();
  if (count > 0) return;
  console.log("🌱 Seeding initial data...");

  await Patient.insertMany([
    { patientId:"PT-001", name:"Ravi Kumar",    age:55, gender:"Male",   blood:"B+", phone:"9876543210", email:"ravi@email.com",    address:"12 MG Road, Hyderabad",        diagnosis:"Hypertension, Post-op care",          risk:"High",   status:"Alert Needed",  doctor:"Dr. Sharma", ward:"Cardiology",    admitted:"2026-01-15", lastVisit:"2026-04-10", nextVisit:"2026-04-26", weight:"72kg", height:"168cm", bp:"150/95",  pulse:"88", temp:"98.6°F", riskFactors:["Recent surgery","Poor follow-up","Chronic condition"],      recommendations:["Schedule visit in 3 days","Medication review","Monitor vital signs","Patient education"] },
    { patientId:"PT-002", name:"Anjali Singh",  age:42, gender:"Female", blood:"O+", phone:"9123456789", email:"anjali@email.com",  address:"45 Banjara Hills, Hyderabad",  diagnosis:"Type 2 Diabetes, Hypertension",       risk:"Medium", status:"Follow-up Call",doctor:"Dr. Mehta",  ward:"General",       admitted:"2026-02-20", lastVisit:"2026-04-05", nextVisit:"2026-05-02", weight:"65kg", height:"162cm", bp:"130/85",  pulse:"76", temp:"98.2°F", riskFactors:["Diabetes management","Irregular medication","Hypertension"],    recommendations:["Phone consultation","Lab tests","Diet counseling"] },
    { patientId:"PT-003", name:"Suresh Babu",   age:29, gender:"Male",   blood:"A+", phone:"9988776655", email:"suresh@email.com",  address:"78 Jubilee Hills, Hyderabad",  diagnosis:"Post-recovery anemia",                risk:"Low",    status:"Monitoring",    doctor:"Dr. Reddy",  ward:"General",       admitted:"2026-03-10", lastVisit:"2026-04-15", nextVisit:"2026-05-15", weight:"70kg", height:"175cm", bp:"118/76",  pulse:"72", temp:"98.4°F", riskFactors:["Post-recovery","Mild anemia"],                               recommendations:["Monthly check-in","Iron supplements","Regular exercise"] },
    { patientId:"PT-004", name:"Priya Nair",    age:38, gender:"Female", blood:"AB+",phone:"9001122334", email:"priya@email.com",   address:"22 Gachibowli, Hyderabad",     diagnosis:"Asthma, Allergic rhinitis",           risk:"Medium", status:"Follow-up Call",doctor:"Dr. Mehta",  ward:"Pulmonology",   admitted:"2026-02-05", lastVisit:"2026-04-12", nextVisit:"2026-04-28", weight:"58kg", height:"158cm", bp:"122/80",  pulse:"80", temp:"98.8°F", riskFactors:["Asthma attacks","Seasonal allergy"],                         recommendations:["Inhaler review","Avoid triggers","Spirometry test"] },
    { patientId:"PT-005", name:"Mohammed Ali",  age:61, gender:"Male",   blood:"B-", phone:"9765432100", email:"mali@email.com",    address:"5 Old City, Hyderabad",        diagnosis:"Chronic kidney disease stage 3",      risk:"High",   status:"Alert Needed",  doctor:"Dr. Sharma", ward:"Nephrology",    admitted:"2026-01-08", lastVisit:"2026-04-08", nextVisit:"2026-04-25", weight:"78kg", height:"170cm", bp:"160/100", pulse:"90", temp:"99.1°F", riskFactors:["CKD progression","Fluid retention","High BP"],              recommendations:["Dialysis prep","Fluid restriction","Urgent nephrology consult"] },
    { patientId:"PT-006", name:"Lakshmi Devi",  age:50, gender:"Female", blood:"O-", phone:"9234567890", email:"lakshmi@email.com", address:"33 Secunderabad, Hyderabad",   diagnosis:"Thyroid disorder, Obesity",           risk:"Low",    status:"Monitoring",    doctor:"Dr. Reddy",  ward:"Endocrinology", admitted:"2026-03-22", lastVisit:"2026-04-18", nextVisit:"2026-05-20", weight:"85kg", height:"155cm", bp:"124/82",  pulse:"68", temp:"97.9°F", riskFactors:["Hypothyroidism"],                                           recommendations:["TSH test monthly","Weight management","Medication compliance"] },
  ]);

  await Appointment.insertMany([
    { appointmentId:"APT-001", patientId:"PT-001", patientName:"Ravi Kumar",   doctor:"Dr. Sharma", department:"Cardiology",    date:"2026-04-26", time:"10:00 AM", type:"Follow-up",    status:"Confirmed", notes:"Post-surgery check, bring reports" },
    { appointmentId:"APT-002", patientId:"PT-002", patientName:"Anjali Singh", doctor:"Dr. Mehta",  department:"Diabetology",   date:"2026-05-02", time:"11:30 AM", type:"Consultation", status:"Confirmed", notes:"HbA1c review" },
    { appointmentId:"APT-003", patientId:"PT-005", patientName:"Mohammed Ali", doctor:"Dr. Sharma", department:"Nephrology",    date:"2026-04-25", time:"09:00 AM", type:"Urgent",       status:"Confirmed", notes:"Immediate kidney function tests" },
    { appointmentId:"APT-004", patientId:"PT-004", patientName:"Priya Nair",   doctor:"Dr. Mehta",  department:"Pulmonology",   date:"2026-04-28", time:"02:00 PM", type:"Follow-up",    status:"Pending",   notes:"Inhaler therapy review" },
    { appointmentId:"APT-005", patientId:"PT-003", patientName:"Suresh Babu",  doctor:"Dr. Reddy",  department:"General",       date:"2026-05-15", time:"03:30 PM", type:"Check-up",     status:"Confirmed", notes:"Routine monthly monitoring" },
    { appointmentId:"APT-006", patientId:"PT-006", patientName:"Lakshmi Devi", doctor:"Dr. Reddy",  department:"Endocrinology", date:"2026-05-20", time:"10:30 AM", type:"Routine",      status:"Pending",   notes:"Thyroid panel + weight check" },
    { appointmentId:"APT-007", patientId:"PT-001", patientName:"Ravi Kumar",   doctor:"Dr. Gupta",  department:"Physiotherapy", date:"2026-05-01", time:"04:00 PM", type:"Therapy",      status:"Confirmed", notes:"Post-op physiotherapy session 3" },
  ]);

  console.log("✅ Seed complete.");
}
mongoose.connection.once("open", seedIfEmpty);

// ─── PATIENT ROUTES ────────────────────────────────────────────────────────

// GET all patients (with optional search & risk filter)
app.get("/api/patients", async (req, res) => {
  try {
    const { search, risk } = req.query;
    const query = {};
    if (risk && risk !== "All") query.risk = risk;
    if (search) query.$or = [
      { name:      { $regex: search, $options: "i" } },
      { patientId: { $regex: search, $options: "i" } },
      { diagnosis: { $regex: search, $options: "i" } },
    ];
    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single patient
app.get("/api/patients/:patientId", async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create patient
app.post("/api/patients", async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    const patientId = `PT-${String(count + 1).padStart(3, "0")}`;
    const patient = new Patient({ patientId, ...req.body });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update patient
app.put("/api/patients/:patientId", async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { patientId: req.params.patientId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE patient
app.delete("/api/patients/:patientId", async (req, res) => {
  try {
    await Patient.findOneAndDelete({ patientId: req.params.patientId });
    await Appointment.deleteMany({ patientId: req.params.patientId });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── APPOINTMENT ROUTES ────────────────────────────────────────────────────

// GET all appointments (with optional patientId / status filter)
app.get("/api/appointments", async (req, res) => {
  try {
    const { patientId, status, search } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (status && status !== "All") query.status = status;
    if (search) query.$or = [
      { patientName: { $regex: search, $options: "i" } },
      { department:  { $regex: search, $options: "i" } },
      { doctor:      { $regex: search, $options: "i" } },
    ];
    const appointments = await Appointment.find(query).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create appointment
app.post("/api/appointments", async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    const appointmentId = `APT-${String(count + 1).padStart(3, "0")}`;
    const appt = new Appointment({ appointmentId, ...req.body });
    await appt.save();
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update appointment
app.put("/api/appointments/:appointmentId", async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.appointmentId },
      req.body,
      { new: true }
    );
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE appointment
app.delete("/api/appointments/:appointmentId", async (req, res) => {
  try {
    await Appointment.findOneAndDelete({ appointmentId: req.params.appointmentId });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ALERT ROUTES ──────────────────────────────────────────────────────────

// GET all alerts
app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ sentAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send alert
app.post("/api/alerts", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT confirm alert
app.put("/api/alerts/:id/confirm", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { confirmed: true }, { new: true });
    res.json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const [totalPatients, highRisk, mediumRisk, lowRisk, totalAppointments, pendingAppts, confirmedAppts, urgentAppts, recentAlerts] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ risk: "High" }),
      Patient.countDocuments({ risk: "Medium" }),
      Patient.countDocuments({ risk: "Low" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "Pending" }),
      Appointment.countDocuments({ status: "Confirmed" }),
      Appointment.countDocuments({ type: "Urgent" }),
      Alert.countDocuments({ confirmed: false }),
    ]);
    res.json({ totalPatients, highRisk, mediumRisk, lowRisk, totalAppointments, pendingAppts, confirmedAppts, urgentAppts, recentAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CareAI backend running on http://localhost:${PORT}`));