const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, enum: ['GRADUATED', 'REVERTED', 'BLOCKED'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  affectedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
