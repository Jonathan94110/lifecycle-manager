const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Mock API endpoints
let employees = [
  { id: 'EMP-001', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Software Engineer', department: 'Engineering', startDate: '2026-03-20', status: 'onboarding', manager: 'Alex Rivera', location: 'San Francisco', photo: null },
  { id: 'EMP-002', name: 'Marcus Johnson', email: 'marcus.j@company.com', role: 'Product Designer', department: 'Design', startDate: '2026-03-22', status: 'onboarding', manager: 'Priya Patel', location: 'San Francisco', photo: null },
  { id: 'EMP-003', name: 'Elena Vasquez', email: 'elena.v@company.com', role: 'Data Analyst', department: 'Analytics', startDate: '2026-03-25', status: 'pending', manager: 'James Kim', location: 'Remote', photo: null },
  { id: 'EMP-004', name: 'David Park', email: 'david.park@company.com', role: 'DevOps Engineer', department: 'Engineering', startDate: '2026-01-15', status: 'active', manager: 'Alex Rivera', location: 'San Francisco', photo: null },
  { id: 'EMP-005', name: 'Rachel Torres', email: 'rachel.t@company.com', role: 'Marketing Manager', department: 'Marketing', startDate: '2025-06-01', status: 'offboarding', endDate: '2026-03-28', manager: 'Lisa Wong', location: 'New York', photo: null },
  { id: 'EMP-006', name: 'Tyler Brooks', email: 'tyler.b@company.com', role: 'Sales Rep', department: 'Sales', startDate: '2025-03-15', status: 'offboarding', endDate: '2026-03-30', manager: 'Nina Patel', location: 'Remote', photo: null },
  { id: 'EMP-007', name: 'Aisha Mohammed', email: 'aisha.m@company.com', role: 'Security Engineer', department: 'Security', startDate: '2026-04-01', status: 'pending', manager: 'Alex Rivera', location: 'San Francisco', photo: null },
  { id: 'EMP-008', name: 'Kevin Liu', email: 'kevin.liu@company.com', role: 'Frontend Engineer', department: 'Engineering', startDate: '2025-09-01', status: 'active', manager: 'Alex Rivera', location: 'San Francisco', photo: null },
];

let onboardingTasks = {
  'EMP-001': [
    { id: 1, category: 'accounts', task: 'Create Google Workspace account', status: 'completed', assignee: 'IT', automated: true },
    { id: 2, category: 'accounts', task: 'Create Slack account', status: 'completed', assignee: 'IT', automated: true },
    { id: 3, category: 'accounts', task: 'Set up SSO/Okta profile', status: 'completed', assignee: 'IT', automated: true },
    { id: 4, category: 'accounts', task: 'Provision GitHub access', status: 'in_progress', assignee: 'IT', automated: false },
    { id: 5, category: 'devices', task: 'Order MacBook Pro 16"', status: 'completed', assignee: 'IT', automated: false },
    { id: 6, category: 'devices', task: 'Enroll device in Kandji MDM', status: 'pending', assignee: 'IT', automated: true },
    { id: 7, category: 'devices', task: 'Install security profiles', status: 'pending', assignee: 'IT', automated: true },
    { id: 8, category: 'access', task: 'Assign engineering security group', status: 'in_progress', assignee: 'IT', automated: true },
    { id: 9, category: 'access', task: 'Grant AWS console access', status: 'pending', assignee: 'IT', automated: false },
    { id: 10, category: 'access', task: 'Add to VPN config', status: 'pending', assignee: 'IT', automated: true },
    { id: 11, category: 'hr', task: 'Complete I-9 verification', status: 'completed', assignee: 'HR', automated: false },
    { id: 12, category: 'hr', task: 'Benefits enrollment', status: 'in_progress', assignee: 'HR', automated: false },
    { id: 13, category: 'hr', task: 'Assign onboarding buddy', status: 'completed', assignee: 'HR', automated: false },
    { id: 14, category: 'facilities', task: 'Assign desk/badge', status: 'pending', assignee: 'Facilities', automated: false },
  ],
  'EMP-002': [
    { id: 1, category: 'accounts', task: 'Create Google Workspace account', status: 'completed', assignee: 'IT', automated: true },
    { id: 2, category: 'accounts', task: 'Create Slack account', status: 'completed', assignee: 'IT', automated: true },
    { id: 3, category: 'accounts', task: 'Set up SSO/Okta profile', status: 'in_progress', assignee: 'IT', automated: true },
    { id: 4, category: 'accounts', task: 'Provision Figma access', status: 'pending', assignee: 'IT', automated: false },
    { id: 5, category: 'devices', task: 'Order MacBook Pro 14"', status: 'completed', assignee: 'IT', automated: false },
    { id: 6, category: 'devices', task: 'Enroll device in Kandji MDM', status: 'pending', assignee: 'IT', automated: true },
    { id: 7, category: 'access', task: 'Assign design security group', status: 'pending', assignee: 'IT', automated: true },
    { id: 8, category: 'hr', task: 'Complete I-9 verification', status: 'pending', assignee: 'HR', automated: false },
    { id: 9, category: 'hr', task: 'Benefits enrollment', status: 'pending', assignee: 'HR', automated: false },
    { id: 10, category: 'facilities', task: 'Assign desk/badge', status: 'pending', assignee: 'Facilities', automated: false },
  ]
};

let offboardingTasks = {
  'EMP-005': [
    { id: 1, category: 'accounts', task: 'Disable Google Workspace account', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 2, category: 'accounts', task: 'Revoke Slack access', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 3, category: 'accounts', task: 'Deactivate SSO profile', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 4, category: 'accounts', task: 'Transfer Google Drive files to manager', status: 'in_progress', assignee: 'IT', automated: false },
    { id: 5, category: 'devices', task: 'Remote wipe MacBook', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 6, category: 'devices', task: 'Unenroll from MDM', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 7, category: 'access', task: 'Remove from all security groups', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 8, category: 'access', task: 'Revoke VPN access', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 9, category: 'access', task: 'Disable MFA tokens', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-28' },
    { id: 10, category: 'hr', task: 'Final paycheck processing', status: 'in_progress', assignee: 'HR', automated: false },
    { id: 11, category: 'hr', task: 'COBRA benefits notification', status: 'pending', assignee: 'HR', automated: false },
    { id: 12, category: 'hr', task: 'Exit interview scheduled', status: 'completed', assignee: 'HR', automated: false },
    { id: 13, category: 'facilities', task: 'Collect badge and keys', status: 'pending', assignee: 'Facilities', automated: false },
    { id: 14, category: 'facilities', task: 'Collect equipment', status: 'pending', assignee: 'Facilities', automated: false },
  ],
  'EMP-006': [
    { id: 1, category: 'accounts', task: 'Disable Google Workspace account', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-30' },
    { id: 2, category: 'accounts', task: 'Revoke Slack access', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-30' },
    { id: 3, category: 'accounts', task: 'Deactivate SSO profile', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-30' },
    { id: 4, category: 'accounts', task: 'Transfer Salesforce data', status: 'pending', assignee: 'IT', automated: false },
    { id: 5, category: 'devices', task: 'Ship return box for equipment', status: 'in_progress', assignee: 'IT', automated: false },
    { id: 6, category: 'devices', task: 'Remote wipe MacBook', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-30' },
    { id: 7, category: 'access', task: 'Remove from all security groups', status: 'pending', assignee: 'IT', automated: true, scheduledDate: '2026-03-30' },
    { id: 8, category: 'hr', task: 'Final paycheck processing', status: 'pending', assignee: 'HR', automated: false },
    { id: 9, category: 'hr', task: 'Exit interview scheduled', status: 'pending', assignee: 'HR', automated: false },
  ]
};

let tickets = [
  { id: 'TK-1042', title: 'Cannot access Google Drive', requester: 'Kevin Liu', priority: 'high', status: 'open', created: '2026-03-17T09:30:00', category: 'Access' },
  { id: 'TK-1041', title: 'MFA token not working on VPN', requester: 'David Park', priority: 'critical', status: 'open', created: '2026-03-17T08:15:00', category: 'Identity' },
  { id: 'TK-1040', title: 'New MacBook keyboard issue', requester: 'Kevin Liu', priority: 'medium', status: 'in_progress', created: '2026-03-16T14:00:00', category: 'Hardware' },
  { id: 'TK-1039', title: 'Slack channel permissions request', requester: 'David Park', priority: 'low', status: 'resolved', created: '2026-03-16T10:00:00', category: 'Access' },
  { id: 'TK-1038', title: 'Conference room AV not working', requester: 'Lisa Wong', priority: 'high', status: 'in_progress', created: '2026-03-15T16:30:00', category: 'Facilities' },
];

let automations = [
  { id: 'AUTO-001', name: 'New Hire Account Provisioning', trigger: 'Employee status → Onboarding', actions: ['Create Google Workspace', 'Create Slack account', 'Setup SSO profile', 'Add to department group'], status: 'active', lastRun: '2026-03-17T08:00:00', runs: 47, successRate: 98 },
  { id: 'AUTO-002', name: 'Offboarding Access Revocation', trigger: 'Employee status → Offboarding', actions: ['Disable all SaaS accounts', 'Revoke SSO', 'Remove security groups', 'Disable MFA'], status: 'active', lastRun: '2026-03-15T17:00:00', runs: 23, successRate: 100 },
  { id: 'AUTO-003', name: 'MDM Auto-Enrollment', trigger: 'Device assigned to employee', actions: ['Enroll in Kandji', 'Push config profiles', 'Install security agents', 'Enable FileVault'], status: 'active', lastRun: '2026-03-16T10:30:00', runs: 52, successRate: 96 },
  { id: 'AUTO-004', name: 'SOC 2 Compliance Check', trigger: 'Weekly schedule (Monday 6AM)', actions: ['Audit user access', 'Check MFA enrollment', 'Verify encryption status', 'Generate report'], status: 'active', lastRun: '2026-03-16T06:00:00', runs: 38, successRate: 100 },
  { id: 'AUTO-005', name: 'License Reclamation', trigger: 'Account inactive > 30 days', actions: ['Send warning email', 'Wait 7 days', 'Revoke license', 'Notify manager'], status: 'active', lastRun: '2026-03-14T09:00:00', runs: 15, successRate: 93 },
  { id: 'AUTO-006', name: 'Password Rotation Reminder', trigger: 'Password age > 90 days', actions: ['Send Slack DM', 'Send email reminder', 'Escalate after 7 days'], status: 'paused', lastRun: '2026-03-10T08:00:00', runs: 120, successRate: 88 },
];

// API Routes
app.get('/api/employees', (req, res) => res.json(employees));
app.get('/api/employees/:id', (req, res) => {
  const emp = employees.find(e => e.id === req.params.id);
  if (emp) res.json(emp);
  else res.status(404).json({ error: 'Not found' });
});

app.get('/api/onboarding/:id/tasks', (req, res) => {
  res.json(onboardingTasks[req.params.id] || []);
});

app.get('/api/offboarding/:id/tasks', (req, res) => {
  res.json(offboardingTasks[req.params.id] || []);
});

app.post('/api/onboarding/:id/tasks/:taskId/toggle', (req, res) => {
  const tasks = onboardingTasks[req.params.id];
  if (tasks) {
    const task = tasks.find(t => t.id === parseInt(req.params.taskId));
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      res.json(task);
      return;
    }
  }
  res.status(404).json({ error: 'Not found' });
});

app.post('/api/offboarding/:id/tasks/:taskId/toggle', (req, res) => {
  const tasks = offboardingTasks[req.params.id];
  if (tasks) {
    const task = tasks.find(t => t.id === parseInt(req.params.taskId));
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      res.json(task);
      return;
    }
  }
  res.status(404).json({ error: 'Not found' });
});

app.get('/api/tickets', (req, res) => res.json(tickets));
app.get('/api/automations', (req, res) => res.json(automations));

app.get('/api/stats', (req, res) => {
  res.json({
    totalEmployees: employees.filter(e => e.status === 'active').length,
    onboarding: employees.filter(e => e.status === 'onboarding' || e.status === 'pending').length,
    offboarding: employees.filter(e => e.status === 'offboarding').length,
    openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
    activeAutomations: automations.filter(a => a.status === 'active').length,
    complianceScore: 94,
    devicesManaged: 156,
    saasApps: 24,
  });
});

app.listen(PORT, () => {
  console.log(`Lifecycle Manager running on http://localhost:${PORT}`);
});
