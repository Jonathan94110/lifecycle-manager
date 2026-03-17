// ===== STATE =====
let state = {
  currentPage: 'dashboard',
  stats: {},
  employees: [],
  tickets: [],
  automations: [],
};

// ===== NAVIGATION =====
function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  renderPage();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== DATA FETCHING =====
async function fetchData() {
  const [stats, employees, tickets, automations] = await Promise.all([
    fetch('/api/stats').then(r => r.json()),
    fetch('/api/employees').then(r => r.json()),
    fetch('/api/tickets').then(r => r.json()),
    fetch('/api/automations').then(r => r.json()),
  ]);
  state = { ...state, stats, employees, tickets, automations };
}

// ===== RENDER ROUTER =====
function renderPage() {
  const el = document.getElementById('pageContent');
  const renderers = {
    dashboard: renderDashboard,
    onboarding: renderOnboarding,
    offboarding: renderOffboarding,
    directory: renderDirectory,
    identity: renderIdentity,
    devices: renderDevices,
    saas: renderSaaS,
    automations: renderAutomations,
    tickets: renderTickets,
    runbooks: renderRunbooks,
    compliance: renderCompliance,
  };
  (renderers[state.currentPage] || renderDashboard)(el);
}

// ===== HELPERS =====
const avatarColors = ['#6366f1','#a855f7','#ec4899','#f43f5e','#f59e0b','#22c55e','#06b6d4','#3b82f6'];
function getAvatarColor(name) { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }
function getInitials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase(); }
function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date('2026-03-17T12:00:00');
  const h = Math.floor((now - d) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
function statusBadge(status) {
  const map = {
    active: '<span class="badge badge-success"><span class="badge-dot"></span>Active</span>',
    onboarding: '<span class="badge badge-info"><span class="badge-dot"></span>Onboarding</span>',
    pending: '<span class="badge badge-warning"><span class="badge-dot"></span>Pending</span>',
    offboarding: '<span class="badge badge-danger"><span class="badge-dot"></span>Offboarding</span>',
    completed: '<span class="badge badge-success"><span class="badge-dot"></span>Completed</span>',
    open: '<span class="badge badge-danger"><span class="badge-dot"></span>Open</span>',
    in_progress: '<span class="badge badge-warning"><span class="badge-dot"></span>In Progress</span>',
    resolved: '<span class="badge badge-success"><span class="badge-dot"></span>Resolved</span>',
    critical: '<span class="badge badge-danger"><span class="badge-dot"></span>Critical</span>',
    high: '<span class="badge badge-warning"><span class="badge-dot"></span>High</span>',
    medium: '<span class="badge badge-info"><span class="badge-dot"></span>Medium</span>',
    low: '<span class="badge badge-neutral"><span class="badge-dot"></span>Low</span>',
  };
  return map[status] || `<span class="badge badge-neutral">${status}</span>`;
}

function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function openModal(title, bodyHtml) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function handleSearch(val) {
  // simple global search placeholder
}

// ===== DASHBOARD =====
function renderDashboard(el) {
  const s = state.stats;
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Employee lifecycle overview — ${new Date('2026-03-17').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="showToast('Report exported', 'info')"><i class="fas fa-download"></i>Export Report</button>
        <button class="btn btn-primary" onclick="openNewHireModal()"><i class="fas fa-plus"></i>New Hire</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-header">
          <span class="stat-label">Active Employees</span>
          <div class="stat-icon accent"><i class="fas fa-users"></i></div>
        </div>
        <div class="stat-value">${s.totalEmployees || 0}</div>
        <div class="stat-change up"><i class="fas fa-arrow-up"></i> 12% this quarter</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header">
          <span class="stat-label">Onboarding</span>
          <div class="stat-icon success"><i class="fas fa-user-plus"></i></div>
        </div>
        <div class="stat-value">${s.onboarding || 0}</div>
        <div class="stat-change">Next 30 days</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-header">
          <span class="stat-label">Offboarding</span>
          <div class="stat-icon warning"><i class="fas fa-user-minus"></i></div>
        </div>
        <div class="stat-value">${s.offboarding || 0}</div>
        <div class="stat-change">Access revocation pending</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-header">
          <span class="stat-label">Open Tickets</span>
          <div class="stat-icon danger"><i class="fas fa-ticket-alt"></i></div>
        </div>
        <div class="stat-value">${s.openTickets || 0}</div>
        <div class="stat-change">1 critical</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card info">
        <div class="stat-header">
          <span class="stat-label">Devices Managed</span>
          <div class="stat-icon info"><i class="fas fa-laptop"></i></div>
        </div>
        <div class="stat-value">${s.devicesManaged || 0}</div>
        <div class="stat-change">MDM enrolled</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-header">
          <span class="stat-label">SaaS Apps</span>
          <div class="stat-icon accent"><i class="fas fa-cloud"></i></div>
        </div>
        <div class="stat-value">${s.saasApps || 0}</div>
        <div class="stat-change">Under management</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header">
          <span class="stat-label">Active Automations</span>
          <div class="stat-icon success"><i class="fas fa-robot"></i></div>
        </div>
        <div class="stat-value">${s.activeAutomations || 0}</div>
        <div class="stat-change up"><i class="fas fa-arrow-up"></i> 2 new this month</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-header">
          <span class="stat-label">Compliance Score</span>
          <div class="stat-icon accent"><i class="fas fa-shield-alt"></i></div>
        </div>
        <div class="stat-value">${s.complianceScore || 0}%</div>
        <div class="stat-change up"><i class="fas fa-arrow-up"></i> SOC 2 ready</div>
      </div>
    </div>

    <div class="grid-2-1" style="margin-top: 4px;">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-clock" style="margin-right:8px;color:var(--accent-light)"></i>Recent Activity</span>
          <button class="btn btn-sm btn-ghost">View All</button>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot success"></div>
              <div class="timeline-content"><strong>Sarah Chen</strong> — Google Workspace account created</div>
              <div class="timeline-time">2 hours ago &middot; Automated</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot success"></div>
              <div class="timeline-content"><strong>Sarah Chen</strong> — Slack account provisioned</div>
              <div class="timeline-time">2 hours ago &middot; Automated</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot warning"></div>
              <div class="timeline-content"><strong>Rachel Torres</strong> — Offboarding initiated, access revocation scheduled Mar 28</div>
              <div class="timeline-time">4 hours ago &middot; Manual</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot info"></div>
              <div class="timeline-content"><strong>David Park</strong> — MFA token issue reported (TK-1041)</div>
              <div class="timeline-time">5 hours ago &middot; Ticket</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot success"></div>
              <div class="timeline-content"><strong>SOC 2 Compliance Check</strong> — Weekly audit passed, score: 94%</div>
              <div class="timeline-time">Yesterday &middot; Automated</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot neutral"></div>
              <div class="timeline-content"><strong>Marcus Johnson</strong> — MacBook Pro 14" ordered for start date Mar 22</div>
              <div class="timeline-time">Yesterday &middot; Manual</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-bolt" style="margin-right:8px;color:var(--warning)"></i>Action Items</span>
        </div>
        <div class="card-body">
          <div class="task-list">
            <div class="task-item">
              <div class="task-checkbox in_progress"><i class="fas fa-spinner fa-spin" style="font-size:10px;color:var(--warning)"></i></div>
              <div class="task-content">
                <div class="task-title">Provision GitHub access for Sarah Chen</div>
                <div class="task-meta">Onboarding &middot; Due today</div>
              </div>
            </div>
            <div class="task-item">
              <div class="task-checkbox"><i class="fas"></i></div>
              <div class="task-content">
                <div class="task-title">Resolve MFA token issue — David Park</div>
                <div class="task-meta">Critical ticket &middot; TK-1041</div>
              </div>
            </div>
            <div class="task-item">
              <div class="task-checkbox"><i class="fas"></i></div>
              <div class="task-content">
                <div class="task-title">Order equipment for Elena Vasquez</div>
                <div class="task-meta">Start date: Mar 25</div>
              </div>
            </div>
            <div class="task-item">
              <div class="task-checkbox"><i class="fas"></i></div>
              <div class="task-content">
                <div class="task-title">Schedule Rachel Torres exit interview</div>
                <div class="task-meta">Offboarding &middot; Last day Mar 28</div>
              </div>
            </div>
            <div class="task-item">
              <div class="task-checkbox"><i class="fas"></i></div>
              <div class="task-content">
                <div class="task-title">Fix conference room AV — Bldg 2</div>
                <div class="task-meta">TK-1038 &middot; High priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== ONBOARDING =====
function renderOnboarding(el) {
  const onboarding = state.employees.filter(e => e.status === 'onboarding' || e.status === 'pending');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Onboarding</h1>
        <p class="page-subtitle">Manage new hire provisioning and access setup</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="showToast('Automation check complete — 3 tasks auto-completed', 'success')"><i class="fas fa-robot"></i>Run Automations</button>
        <button class="btn btn-primary" onclick="openNewHireModal()"><i class="fas fa-plus"></i>Add New Hire</button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-card info">
        <div class="stat-header">
          <span class="stat-label">Total Onboarding</span>
          <div class="stat-icon info"><i class="fas fa-user-plus"></i></div>
        </div>
        <div class="stat-value">${onboarding.length}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header">
          <span class="stat-label">Tasks Completed</span>
          <div class="stat-icon success"><i class="fas fa-check"></i></div>
        </div>
        <div class="stat-value">12</div>
        <div class="stat-change">of 24 total</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-header">
          <span class="stat-label">Automated</span>
          <div class="stat-icon accent"><i class="fas fa-robot"></i></div>
        </div>
        <div class="stat-value">67%</div>
        <div class="stat-change up"><i class="fas fa-arrow-up"></i> Tasks handled by automation</div>
      </div>
    </div>

    <div class="grid-2" id="onboardingCards">
      ${onboarding.map(emp => `
        <div class="employee-card" onclick="openOnboardingDetail('${emp.id}')">
          <div class="emp-card-header">
            <div class="emp-avatar" style="background:${getAvatarColor(emp.name)}">${getInitials(emp.name)}</div>
            <div>
              <div class="emp-name">${emp.name}</div>
              <div class="emp-role">${emp.role} — ${emp.department}</div>
            </div>
            ${statusBadge(emp.status)}
          </div>
          <div class="emp-details">
            <div class="emp-detail">
              <span class="emp-detail-label">Start Date</span>
              <span class="emp-detail-value">${new Date(emp.startDate).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</span>
            </div>
            <div class="emp-detail">
              <span class="emp-detail-label">Manager</span>
              <span class="emp-detail-value">${emp.manager}</span>
            </div>
            <div class="emp-detail">
              <span class="emp-detail-label">Location</span>
              <span class="emp-detail-value">${emp.location}</span>
            </div>
          </div>
          <div class="emp-progress-section">
            <div class="emp-progress-label">
              <span>Setup Progress</span>
              <span style="color:var(--accent-light)">${emp.status === 'onboarding' ? '45%' : '0%'}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill accent" style="width:${emp.status === 'onboarding' ? '45' : '0'}%"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function openOnboardingDetail(empId) {
  const emp = state.employees.find(e => e.id === empId);
  const tasks = await fetch(`/api/onboarding/${empId}/tasks`).then(r => r.json());

  if (!tasks.length) {
    showToast('No onboarding tasks found — run provisioning automation', 'info');
    return;
  }

  const categories = ['accounts', 'devices', 'access', 'hr', 'facilities'];
  const catLabels = { accounts: 'Account Setup', devices: 'Device Provisioning', access: 'Access Management', hr: 'HR & Benefits', facilities: 'Facilities' };
  const catIcons = { accounts: 'fa-user-circle', devices: 'fa-laptop', access: 'fa-key', hr: 'fa-file-alt', facilities: 'fa-building' };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pct = Math.round((completed / tasks.length) * 100);

  let html = `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <div class="emp-avatar" style="background:${getAvatarColor(emp.name)};width:48px;height:48px;font-size:18px">${getInitials(emp.name)}</div>
        <div>
          <div style="font-weight:700;font-size:16px">${emp.name}</div>
          <div style="color:var(--text-secondary);font-size:13px">${emp.role} — ${emp.department}</div>
        </div>
      </div>
      <div class="emp-progress-label">
        <span>Overall Progress</span>
        <span style="color:var(--accent-light);font-weight:700">${pct}% (${completed}/${tasks.length})</span>
      </div>
      <div class="progress-bar" style="height:8px">
        <div class="progress-fill accent" style="width:${pct}%"></div>
      </div>
    </div>
  `;

  categories.forEach(cat => {
    const catTasks = tasks.filter(t => t.category === cat);
    if (!catTasks.length) return;
    html += `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
          <i class="fas ${catIcons[cat]}"></i>${catLabels[cat]}
        </div>
        <div class="task-list" style="border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden">
          ${catTasks.map(t => `
            <div class="task-item" onclick="toggleOnboardingTask('${empId}', ${t.id})" style="cursor:pointer">
              <div class="task-checkbox ${t.status === 'completed' ? 'checked' : t.status === 'in_progress' ? 'in_progress' : ''}">
                ${t.status === 'completed' ? '<i class="fas fa-check"></i>' : t.status === 'in_progress' ? '<i class="fas fa-spinner fa-spin" style="font-size:10px;color:var(--warning)"></i>' : ''}
              </div>
              <div class="task-content">
                <div class="task-title ${t.status === 'completed' ? 'completed' : ''}">${t.task}</div>
                <div class="task-meta">${t.assignee}${t.automated ? ' &middot; <i class="fas fa-robot"></i> Automated' : ' &middot; Manual'}</div>
              </div>
              ${statusBadge(t.status)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  openModal(`Onboarding: ${emp.name}`, html);
}

async function toggleOnboardingTask(empId, taskId) {
  await fetch(`/api/onboarding/${empId}/tasks/${taskId}/toggle`, { method: 'POST' });
  showToast('Task updated', 'success');
  closeModal();
  openOnboardingDetail(empId);
}

// ===== OFFBOARDING =====
function renderOffboarding(el) {
  const offboarding = state.employees.filter(e => e.status === 'offboarding');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Offboarding</h1>
        <p class="page-subtitle">Manage employee exits, access revocation, and asset recovery</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-danger" onclick="showToast('Emergency access revocation initiated', 'warning')"><i class="fas fa-exclamation-triangle"></i>Emergency Revoke</button>
        <button class="btn btn-secondary" onclick="showToast('Offboarding workflow started', 'info')"><i class="fas fa-plus"></i>Start Offboarding</button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-card warning">
        <div class="stat-header">
          <span class="stat-label">Departing</span>
          <div class="stat-icon warning"><i class="fas fa-user-minus"></i></div>
        </div>
        <div class="stat-value">${offboarding.length}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-header">
          <span class="stat-label">Access to Revoke</span>
          <div class="stat-icon danger"><i class="fas fa-ban"></i></div>
        </div>
        <div class="stat-value">18</div>
        <div class="stat-change">SaaS accounts + groups</div>
      </div>
      <div class="stat-card info">
        <div class="stat-header">
          <span class="stat-label">Devices to Collect</span>
          <div class="stat-icon info"><i class="fas fa-laptop"></i></div>
        </div>
        <div class="stat-value">3</div>
      </div>
    </div>

    <div class="grid-2">
      ${offboarding.map(emp => `
        <div class="employee-card" onclick="openOffboardingDetail('${emp.id}')" style="border-left:3px solid var(--warning)">
          <div class="emp-card-header">
            <div class="emp-avatar" style="background:${getAvatarColor(emp.name)}">${getInitials(emp.name)}</div>
            <div>
              <div class="emp-name">${emp.name}</div>
              <div class="emp-role">${emp.role} — ${emp.department}</div>
            </div>
            ${statusBadge('offboarding')}
          </div>
          <div class="emp-details">
            <div class="emp-detail">
              <span class="emp-detail-label">Last Day</span>
              <span class="emp-detail-value" style="color:var(--warning);font-weight:700">${new Date(emp.endDate).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</span>
            </div>
            <div class="emp-detail">
              <span class="emp-detail-label">Manager</span>
              <span class="emp-detail-value">${emp.manager}</span>
            </div>
            <div class="emp-detail">
              <span class="emp-detail-label">Location</span>
              <span class="emp-detail-value">${emp.location}</span>
            </div>
          </div>
          <div class="emp-progress-section">
            <div class="emp-progress-label">
              <span>Offboarding Progress</span>
              <span style="color:var(--warning)">15%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill warning" style="width:15%"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function openOffboardingDetail(empId) {
  const emp = state.employees.find(e => e.id === empId);
  const tasks = await fetch(`/api/offboarding/${empId}/tasks`).then(r => r.json());
  if (!tasks.length) return;

  const categories = ['accounts', 'devices', 'access', 'hr', 'facilities'];
  const catLabels = { accounts: 'Account Deprovisioning', devices: 'Device Recovery', access: 'Access Revocation', hr: 'HR & Benefits', facilities: 'Facilities' };
  const catIcons = { accounts: 'fa-user-slash', devices: 'fa-laptop', access: 'fa-lock', hr: 'fa-file-alt', facilities: 'fa-building' };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pct = Math.round((completed / tasks.length) * 100);

  let html = `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:4px">
        <div class="emp-avatar" style="background:${getAvatarColor(emp.name)};width:48px;height:48px;font-size:18px">${getInitials(emp.name)}</div>
        <div>
          <div style="font-weight:700;font-size:16px">${emp.name}</div>
          <div style="color:var(--text-secondary);font-size:13px">${emp.role} &middot; Last day: <strong style="color:var(--warning)">${new Date(emp.endDate).toLocaleDateString('en-US', {month:'short',day:'numeric'})}</strong></div>
        </div>
      </div>
      <div style="background:var(--danger-bg);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-sm);padding:10px 14px;margin:16px 0;font-size:12px;color:var(--danger);display:flex;align-items:center;gap:8px">
        <i class="fas fa-exclamation-triangle"></i> All automated tasks will execute on employee's last day unless manually triggered
      </div>
      <div class="emp-progress-label">
        <span>Offboarding Progress</span>
        <span style="color:var(--warning);font-weight:700">${pct}% (${completed}/${tasks.length})</span>
      </div>
      <div class="progress-bar" style="height:8px">
        <div class="progress-fill warning" style="width:${pct}%"></div>
      </div>
    </div>
  `;

  categories.forEach(cat => {
    const catTasks = tasks.filter(t => t.category === cat);
    if (!catTasks.length) return;
    html += `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
          <i class="fas ${catIcons[cat]}"></i>${catLabels[cat]}
        </div>
        <div class="task-list" style="border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden">
          ${catTasks.map(t => `
            <div class="task-item" onclick="toggleOffboardingTask('${empId}', ${t.id})" style="cursor:pointer">
              <div class="task-checkbox ${t.status === 'completed' ? 'checked' : t.status === 'in_progress' ? 'in_progress' : ''}">
                ${t.status === 'completed' ? '<i class="fas fa-check"></i>' : t.status === 'in_progress' ? '<i class="fas fa-spinner fa-spin" style="font-size:10px;color:var(--warning)"></i>' : ''}
              </div>
              <div class="task-content">
                <div class="task-title ${t.status === 'completed' ? 'completed' : ''}">${t.task}</div>
                <div class="task-meta">${t.assignee}${t.automated ? ' &middot; <i class="fas fa-robot"></i> Automated' : ' &middot; Manual'}${t.scheduledDate ? ' &middot; Scheduled: ' + new Date(t.scheduledDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''}</div>
              </div>
              ${statusBadge(t.status)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += `<div style="display:flex;gap:10px;margin-top:20px">
    <button class="btn btn-danger" onclick="showToast('Emergency revocation executed for ${emp.name}', 'warning');closeModal()"><i class="fas fa-bolt"></i>Execute All Now</button>
    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
  </div>`;

  openModal(`Offboarding: ${emp.name}`, html);
}

async function toggleOffboardingTask(empId, taskId) {
  await fetch(`/api/offboarding/${empId}/tasks/${taskId}/toggle`, { method: 'POST' });
  showToast('Task updated', 'success');
  closeModal();
  openOffboardingDetail(empId);
}

// ===== DIRECTORY =====
function renderDirectory(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Employee Directory</h1>
        <p class="page-subtitle">All employees across the organization</p>
      </div>
    </div>
    <div class="filter-bar">
      <button class="filter-chip active" onclick="filterDir(this, 'all')">All (${state.employees.length})</button>
      <button class="filter-chip" onclick="filterDir(this, 'active')">Active</button>
      <button class="filter-chip" onclick="filterDir(this, 'onboarding')">Onboarding</button>
      <button class="filter-chip" onclick="filterDir(this, 'offboarding')">Offboarding</button>
      <button class="filter-chip" onclick="filterDir(this, 'pending')">Pending</button>
    </div>
    <div class="card">
      <div class="card-body no-pad">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Location</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Start Date</th>
              </tr>
            </thead>
            <tbody>
              ${state.employees.map(e => `
                <tr style="cursor:pointer" onclick="showToast('Opening ${e.name} profile...', 'info')">
                  <td style="display:flex;align-items:center;gap:10px">
                    <div class="emp-avatar" style="background:${getAvatarColor(e.name)};width:32px;height:32px;font-size:12px;border-radius:8px">${getInitials(e.name)}</div>
                    <div>
                      <div style="font-weight:600">${e.name}</div>
                      <div style="font-size:11px;color:var(--text-muted)">${e.email}</div>
                    </div>
                  </td>
                  <td>${e.role}</td>
                  <td>${e.department}</td>
                  <td>${e.location}</td>
                  <td>${e.manager}</td>
                  <td>${statusBadge(e.status)}</td>
                  <td style="color:var(--text-secondary)">${new Date(e.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function filterDir(btn, filter) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

// ===== IDENTITY & ACCESS =====
function renderIdentity(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Identity & Access Management</h1>
        <p class="page-subtitle">SSO, MFA, SCIM, and directory services overview</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="showToast('Access audit started', 'info')"><i class="fas fa-search"></i>Run Audit</button>
        <button class="btn btn-primary"><i class="fas fa-plus"></i>Add User</button>
      </div>
    </div>

    <div class="identity-grid">
      <div class="identity-card">
        <div class="identity-icon" style="background:var(--accent-glow);color:var(--accent-light)"><i class="fas fa-sign-in-alt"></i></div>
        <div class="identity-title">Single Sign-On (SSO)</div>
        <div class="identity-desc">SAML 2.0 & OIDC identity provider</div>
        <div class="identity-metric" style="color:var(--success)">24</div>
        <div class="identity-metric-label">Connected Applications</div>
        <div style="margin-top:12px"><span class="badge badge-success"><span class="badge-dot"></span>All Healthy</span></div>
      </div>
      <div class="identity-card">
        <div class="identity-icon" style="background:var(--success-bg);color:var(--success)"><i class="fas fa-shield-alt"></i></div>
        <div class="identity-title">Multi-Factor Auth (MFA)</div>
        <div class="identity-desc">TOTP, WebAuthn, and push notifications</div>
        <div class="identity-metric" style="color:var(--success)">97%</div>
        <div class="identity-metric-label">Enrollment Rate</div>
        <div style="margin-top:12px"><span class="badge badge-warning"><span class="badge-dot"></span>2 Users Pending</span></div>
      </div>
      <div class="identity-card">
        <div class="identity-icon" style="background:var(--info-bg);color:var(--info)"><i class="fas fa-sync-alt"></i></div>
        <div class="identity-title">SCIM Provisioning</div>
        <div class="identity-desc">Automated user lifecycle sync</div>
        <div class="identity-metric" style="color:var(--info)">8</div>
        <div class="identity-metric-label">Synced Applications</div>
        <div style="margin-top:12px"><span class="badge badge-success"><span class="badge-dot"></span>Last sync: 5m ago</span></div>
      </div>
    </div>

    <div style="margin-top:20px" class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Security Groups</span>
          <button class="btn btn-sm btn-secondary"><i class="fas fa-plus"></i>Add Group</button>
        </div>
        <div class="card-body no-pad">
          <table>
            <thead><tr><th>Group</th><th>Members</th><th>Apps</th><th>Type</th></tr></thead>
            <tbody>
              <tr><td style="font-weight:600">Engineering</td><td>24</td><td>12</td><td><span class="badge badge-accent">SCIM Synced</span></td></tr>
              <tr><td style="font-weight:600">Design</td><td>8</td><td>9</td><td><span class="badge badge-accent">SCIM Synced</span></td></tr>
              <tr><td style="font-weight:600">Sales</td><td>15</td><td>8</td><td><span class="badge badge-accent">SCIM Synced</span></td></tr>
              <tr><td style="font-weight:600">Marketing</td><td>10</td><td>7</td><td><span class="badge badge-neutral">Manual</span></td></tr>
              <tr><td style="font-weight:600">Admins</td><td>4</td><td>24</td><td><span class="badge badge-danger">Privileged</span></td></tr>
              <tr><td style="font-weight:600">Contractors</td><td>6</td><td>3</td><td><span class="badge badge-warning">Limited</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Access Events</span>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot success"></div>
              <div class="timeline-content">Sarah Chen added to <strong>Engineering</strong> group</div>
              <div class="timeline-time">2h ago &middot; SCIM auto-provision</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot warning"></div>
              <div class="timeline-content">David Park — MFA challenge failed (3 attempts)</div>
              <div class="timeline-time">5h ago &middot; Security alert</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot info"></div>
              <div class="timeline-content">New SSO integration: <strong>Linear</strong> connected</div>
              <div class="timeline-time">Yesterday</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot success"></div>
              <div class="timeline-content">Weekly access review completed — no anomalies</div>
              <div class="timeline-time">Yesterday &middot; Automated</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot danger"></div>
              <div class="timeline-content">Rachel Torres — access revocation scheduled</div>
              <div class="timeline-time">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== DEVICE MANAGEMENT =====
function renderDevices(el) {
  const devices = [
    { name: 'MBP-SC-001', user: 'Sarah Chen', model: 'MacBook Pro 16" M4', os: 'macOS 16.3', status: 'online', mdm: 'Enrolled', encrypted: true, compliant: true },
    { name: 'MBP-DP-001', user: 'David Park', model: 'MacBook Pro 14" M3', os: 'macOS 16.2', status: 'online', mdm: 'Enrolled', encrypted: true, compliant: true },
    { name: 'MBP-KL-001', user: 'Kevin Liu', model: 'MacBook Pro 16" M4', os: 'macOS 16.3', status: 'online', mdm: 'Enrolled', encrypted: true, compliant: true },
    { name: 'MBP-RT-001', user: 'Rachel Torres', model: 'MacBook Air M3', os: 'macOS 16.1', status: 'offline', mdm: 'Enrolled', encrypted: true, compliant: false },
    { name: 'MBP-TB-001', user: 'Tyler Brooks', model: 'MacBook Pro 14" M3', os: 'macOS 16.2', status: 'offline', mdm: 'Enrolled', encrypted: true, compliant: true },
    { name: 'MBP-MJ-001', user: 'Marcus Johnson', model: 'MacBook Pro 14" M4', os: 'macOS 16.3', status: 'pending', mdm: 'Pending', encrypted: false, compliant: false },
  ];

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Device Management</h1>
        <p class="page-subtitle">macOS endpoint management via Kandji MDM</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i class="fas fa-sync-alt"></i>Sync MDM</button>
        <button class="btn btn-primary"><i class="fas fa-plus"></i>Enroll Device</button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card success">
        <div class="stat-header">
          <span class="stat-label">Online</span>
          <div class="stat-icon success"><i class="fas fa-wifi"></i></div>
        </div>
        <div class="stat-value">${devices.filter(d => d.status === 'online').length}</div>
      </div>
      <div class="stat-card info">
        <div class="stat-header">
          <span class="stat-label">MDM Enrolled</span>
          <div class="stat-icon info"><i class="fas fa-check-circle"></i></div>
        </div>
        <div class="stat-value">${devices.filter(d => d.mdm === 'Enrolled').length}</div>
      </div>
      <div class="stat-card accent">
        <div class="stat-header">
          <span class="stat-label">Encrypted</span>
          <div class="stat-icon accent"><i class="fas fa-lock"></i></div>
        </div>
        <div class="stat-value">${devices.filter(d => d.encrypted).length}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-header">
          <span class="stat-label">Non-Compliant</span>
          <div class="stat-icon warning"><i class="fas fa-exclamation-triangle"></i></div>
        </div>
        <div class="stat-value">${devices.filter(d => !d.compliant).length}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Managed Devices</span>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm btn-ghost"><i class="fas fa-filter"></i>Filter</button>
          <button class="btn btn-sm btn-ghost"><i class="fas fa-download"></i>Export</button>
        </div>
      </div>
      <div class="card-body no-pad">
        <table>
          <thead>
            <tr><th>Device</th><th>User</th><th>Model</th><th>OS</th><th>Status</th><th>MDM</th><th>FileVault</th><th>Compliant</th></tr>
          </thead>
          <tbody>
            ${devices.map(d => `
              <tr>
                <td style="font-weight:600;display:flex;align-items:center;gap:8px"><i class="fas fa-laptop" style="color:var(--text-muted)"></i>${d.name}</td>
                <td>${d.user}</td>
                <td style="color:var(--text-secondary)">${d.model}</td>
                <td style="color:var(--text-secondary)">${d.os}</td>
                <td><span class="device-status ${d.status === 'online' ? 'online' : 'offline'}"></span> ${d.status === 'online' ? 'Online' : d.status === 'pending' ? 'Pending' : 'Offline'}</td>
                <td>${d.mdm === 'Enrolled' ? '<span class="badge badge-success">Enrolled</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
                <td>${d.encrypted ? '<i class="fas fa-lock" style="color:var(--success)"></i>' : '<i class="fas fa-unlock" style="color:var(--danger)"></i>'}</td>
                <td>${d.compliant ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-danger">No</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== SaaS APPS =====
function renderSaaS(el) {
  const apps = [
    { name: 'Google Workspace', icon: 'fa-google', color: '#4285f4', bg: 'rgba(66,133,244,0.1)', category: 'Productivity', users: 156, sso: true, scim: true, status: 'healthy' },
    { name: 'Slack', icon: 'fa-slack', color: '#e01e5a', bg: 'rgba(224,30,90,0.1)', category: 'Communication', users: 162, sso: true, scim: true, status: 'healthy' },
    { name: 'GitHub', icon: 'fa-github', color: '#f0f0f0', bg: 'rgba(240,240,240,0.1)', category: 'Development', users: 45, sso: true, scim: false, status: 'healthy' },
    { name: 'Figma', icon: 'fa-figma', color: '#a259ff', bg: 'rgba(162,89,255,0.1)', category: 'Design', users: 22, sso: true, scim: false, status: 'healthy' },
    { name: 'AWS Console', icon: 'fa-aws', color: '#ff9900', bg: 'rgba(255,153,0,0.1)', category: 'Infrastructure', users: 18, sso: true, scim: false, status: 'healthy' },
    { name: 'Linear', icon: 'fa-tasks', color: '#5e6ad2', bg: 'rgba(94,106,210,0.1)', category: 'Project Mgmt', users: 52, sso: true, scim: true, status: 'healthy' },
    { name: 'Notion', icon: 'fa-book-open', color: '#fff', bg: 'rgba(255,255,255,0.05)', category: 'Documentation', users: 98, sso: true, scim: false, status: 'healthy' },
    { name: 'Salesforce', icon: 'fa-cloud', color: '#00a1e0', bg: 'rgba(0,161,224,0.1)', category: 'CRM', users: 28, sso: true, scim: true, status: 'healthy' },
    { name: 'Kandji', icon: 'fa-shield-alt', color: '#6366f1', bg: 'var(--accent-glow)', category: 'MDM', users: 4, sso: true, scim: false, status: 'healthy' },
    { name: 'Zoom', icon: 'fa-video', color: '#2d8cff', bg: 'rgba(45,140,255,0.1)', category: 'Communication', users: 145, sso: true, scim: false, status: 'healthy' },
    { name: 'ChatGPT Team', icon: 'fa-brain', color: '#10a37f', bg: 'rgba(16,163,127,0.1)', category: 'AI Tools', users: 35, sso: true, scim: false, status: 'healthy' },
    { name: 'Claude', icon: 'fa-comment-dots', color: '#d4a574', bg: 'rgba(212,165,116,0.1)', category: 'AI Tools', users: 42, sso: false, scim: false, status: 'healthy' },
  ];

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">SaaS App Administration</h1>
        <p class="page-subtitle">Manage Google Workspace, Slack, AI tools, and ${apps.length - 3}+ core applications</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary"><i class="fas fa-sync-alt"></i>Sync All</button>
        <button class="btn btn-primary"><i class="fas fa-plus"></i>Add App</button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card accent">
        <div class="stat-header"><span class="stat-label">Total Apps</span><div class="stat-icon accent"><i class="fas fa-cloud"></i></div></div>
        <div class="stat-value">${apps.length}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header"><span class="stat-label">SSO Enabled</span><div class="stat-icon success"><i class="fas fa-sign-in-alt"></i></div></div>
        <div class="stat-value">${apps.filter(a => a.sso).length}</div>
      </div>
      <div class="stat-card info">
        <div class="stat-header"><span class="stat-label">SCIM Synced</span><div class="stat-icon info"><i class="fas fa-sync-alt"></i></div></div>
        <div class="stat-value">${apps.filter(a => a.scim).length}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header"><span class="stat-label">All Healthy</span><div class="stat-icon success"><i class="fas fa-heart"></i></div></div>
        <div class="stat-value">${apps.filter(a => a.status === 'healthy').length}</div>
      </div>
    </div>

    <div class="grid-3">
      ${apps.map(a => `
        <div class="app-card">
          <div class="app-icon" style="background:${a.bg};color:${a.color}"><i class="fab ${a.icon.startsWith('fa-') && !['fa-tasks','fa-book-open','fa-cloud','fa-shield-alt','fa-video','fa-brain','fa-comment-dots'].includes(a.icon) ? a.icon : ''}" ${['fa-tasks','fa-book-open','fa-cloud','fa-shield-alt','fa-video','fa-brain','fa-comment-dots'].includes(a.icon) ? '' : ''}></i>${['fa-tasks','fa-book-open','fa-cloud','fa-shield-alt','fa-video','fa-brain','fa-comment-dots'].includes(a.icon) ? `<i class="fas ${a.icon}"></i>` : ''}</div>
          <div class="app-info">
            <div class="app-name">${a.name}</div>
            <div class="app-category">${a.category}</div>
            <div class="app-users"><i class="fas fa-users" style="margin-right:4px"></i>${a.users} users &nbsp;${a.sso ? '<span class="badge badge-success" style="font-size:10px;padding:2px 6px">SSO</span>' : ''} ${a.scim ? '<span class="badge badge-info" style="font-size:10px;padding:2px 6px">SCIM</span>' : ''}</div>
          </div>
          <div class="toggle ${a.status === 'healthy' ? 'active' : ''}"></div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== AUTOMATIONS =====
function renderAutomations(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Automation Workflows</h1>
        <p class="page-subtitle">Eliminate toil with automated provisioning, deprovisioning, and compliance checks</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showToast('Workflow builder coming soon!', 'info')"><i class="fas fa-plus"></i>New Workflow</button>
      </div>
    </div>

    <div class="grid-2">
      ${state.automations.map(a => `
        <div class="auto-card">
          <div class="auto-card-header">
            <div>
              <div class="auto-name">${a.name}</div>
              <div class="auto-trigger"><i class="fas fa-bolt" style="margin-right:4px"></i>${a.trigger}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="badge ${a.status === 'active' ? 'badge-success' : 'badge-neutral'}">${a.status === 'active' ? 'Active' : 'Paused'}</span>
              <div class="toggle ${a.status === 'active' ? 'active' : ''}"></div>
            </div>
          </div>
          <div class="auto-actions">
            ${a.actions.map(act => `<span class="auto-action-chip">${act}</span>`).join('')}
          </div>
          <div class="auto-stats">
            <div>Runs: <span class="auto-stat-value">${a.runs}</span></div>
            <div>Success: <span class="auto-stat-value" style="color:${a.successRate >= 95 ? 'var(--success)' : 'var(--warning)'}">${a.successRate}%</span></div>
            <div>Last: <span class="auto-stat-value">${timeAgo(a.lastRun)}</span></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== TICKETS =====
function renderTickets(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Support Tickets</h1>
        <p class="page-subtitle">Triage and resolve end-user issues across hardware, macOS, SaaS, and accounts</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i class="fas fa-plus"></i>New Ticket</button>
      </div>
    </div>

    <div class="filter-bar">
      <button class="filter-chip active">All (${state.tickets.length})</button>
      <button class="filter-chip">Open</button>
      <button class="filter-chip">In Progress</button>
      <button class="filter-chip">Resolved</button>
      <button class="filter-chip">Critical</button>
    </div>

    <div class="card">
      <div class="card-body no-pad">
        <table>
          <thead>
            <tr><th>ID</th><th>Title</th><th>Requester</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            ${state.tickets.map(t => `
              <tr style="cursor:pointer">
                <td style="font-weight:600;color:var(--accent-light)">${t.id}</td>
                <td style="font-weight:500">${t.title}</td>
                <td>${t.requester}</td>
                <td><span class="badge badge-neutral">${t.category}</span></td>
                <td>${statusBadge(t.priority)}</td>
                <td>${statusBadge(t.status)}</td>
                <td style="color:var(--text-muted)">${timeAgo(t.created)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== RUNBOOKS =====
function renderRunbooks(el) {
  const runbooks = [
    { title: 'New Hire Onboarding', desc: 'End-to-end account setup, device provisioning, and access configuration for new employees', icon: 'fa-user-plus', color: 'var(--success)', bg: 'var(--success-bg)', lang: 'Bash/Python', updated: '2 days ago' },
    { title: 'Employee Offboarding', desc: 'Complete access revocation, device wipe, and account deprovisioning procedures', icon: 'fa-user-minus', color: 'var(--warning)', bg: 'var(--warning-bg)', lang: 'Bash/Python', updated: '1 week ago' },
    { title: 'Emergency Access Revocation', desc: 'Immediate deactivation of all access for security incidents or terminations', icon: 'fa-exclamation-triangle', color: 'var(--danger)', bg: 'var(--danger-bg)', lang: 'Bash', updated: '3 days ago' },
    { title: 'MDM Enrollment', desc: 'Kandji MDM enrollment, configuration profiles, FileVault setup, and security agent deployment', icon: 'fa-laptop', color: 'var(--info)', bg: 'var(--info-bg)', lang: 'Bash', updated: '5 days ago' },
    { title: 'Google Workspace Admin', desc: 'User creation, group management, Drive permissions, and organizational unit setup', icon: 'fa-envelope', color: '#4285f4', bg: 'rgba(66,133,244,0.1)', lang: 'Python', updated: '1 week ago' },
    { title: 'SSO & MFA Troubleshooting', desc: 'Diagnosing SAML, OIDC, MFA token issues. Includes reset procedures and escalation paths', icon: 'fa-key', color: 'var(--accent-light)', bg: 'var(--accent-glow)', lang: 'Manual', updated: '4 days ago' },
    { title: 'Network & Office Infra', desc: 'VLANs, DNS, DHCP, firewall rules, conference room AV, and physical security systems', icon: 'fa-network-wired', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', lang: 'Bash/Terraform', updated: '2 weeks ago' },
    { title: 'SOC 2 Compliance Audit', desc: 'Weekly audit script for user access review, MFA enrollment, encryption status, and report generation', icon: 'fa-shield-alt', color: 'var(--success)', bg: 'var(--success-bg)', lang: 'Python', updated: '1 week ago' },
    { title: 'License Management', desc: 'SaaS license reclamation for inactive accounts. Cost optimization and vendor management', icon: 'fa-tag', color: 'var(--warning)', bg: 'var(--warning-bg)', lang: 'Python', updated: '2 weeks ago' },
  ];

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Runbooks & Documentation</h1>
        <p class="page-subtitle">Automation scripts (Bash/Python) and internal procedures</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary"><i class="fas fa-plus"></i>New Runbook</button>
      </div>
    </div>
    <div class="grid-3">
      ${runbooks.map(r => `
        <div class="runbook-card">
          <div class="runbook-icon-wrap" style="background:${r.bg};color:${r.color}"><i class="fas ${r.icon}"></i></div>
          <div class="runbook-title">${r.title}</div>
          <div class="runbook-desc">${r.desc}</div>
          <div class="runbook-meta">
            <span><i class="fas fa-code" style="margin-right:4px"></i>${r.lang}</span>
            <span><i class="fas fa-clock" style="margin-right:4px"></i>${r.updated}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== COMPLIANCE =====
function renderCompliance(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">SOC 2 Compliance</h1>
        <p class="page-subtitle">Continuous compliance monitoring and audit readiness</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="showToast('Compliance report generated', 'success')"><i class="fas fa-download"></i>Export Report</button>
        <button class="btn btn-primary" onclick="showToast('Audit scan started...', 'info')"><i class="fas fa-search"></i>Run Audit</button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card success">
        <div class="stat-header"><span class="stat-label">Overall Score</span><div class="stat-icon success"><i class="fas fa-shield-alt"></i></div></div>
        <div class="stat-value" style="color:var(--success)">94%</div>
        <div class="stat-change up"><i class="fas fa-arrow-up"></i> +2% this month</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header"><span class="stat-label">MFA Coverage</span><div class="stat-icon success"><i class="fas fa-fingerprint"></i></div></div>
        <div class="stat-value">97%</div>
      </div>
      <div class="stat-card success">
        <div class="stat-header"><span class="stat-label">Encryption</span><div class="stat-icon success"><i class="fas fa-lock"></i></div></div>
        <div class="stat-value">100%</div>
        <div class="stat-change">FileVault enabled all devices</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-header"><span class="stat-label">Findings</span><div class="stat-icon warning"><i class="fas fa-exclamation-circle"></i></div></div>
        <div class="stat-value">3</div>
        <div class="stat-change">Open items</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">Compliance Checks</span></div>
        <div class="card-body no-pad">
          <table>
            <thead><tr><th>Check</th><th>Status</th><th>Last Run</th></tr></thead>
            <tbody>
              <tr><td><i class="fas fa-check-circle" style="color:var(--success);margin-right:8px"></i>All users have MFA enabled</td><td><span class="badge badge-warning">97% (2 pending)</span></td><td>Today 6:00 AM</td></tr>
              <tr><td><i class="fas fa-check-circle" style="color:var(--success);margin-right:8px"></i>All devices encrypted (FileVault)</td><td><span class="badge badge-success">100% Pass</span></td><td>Today 6:00 AM</td></tr>
              <tr><td><i class="fas fa-check-circle" style="color:var(--success);margin-right:8px"></i>Access reviews completed</td><td><span class="badge badge-success">Pass</span></td><td>Today 6:00 AM</td></tr>
              <tr><td><i class="fas fa-check-circle" style="color:var(--success);margin-right:8px"></i>Offboarded users deprovisioned</td><td><span class="badge badge-success">Pass</span></td><td>Today 6:00 AM</td></tr>
              <tr><td><i class="fas fa-exclamation-circle" style="color:var(--warning);margin-right:8px"></i>Password rotation compliance</td><td><span class="badge badge-warning">88%</span></td><td>Today 6:00 AM</td></tr>
              <tr><td><i class="fas fa-check-circle" style="color:var(--success);margin-right:8px"></i>SSO enforcement on all apps</td><td><span class="badge badge-warning">92% (2 apps manual)</span></td><td>Today 6:00 AM</td></tr>
              <tr><td><i class="fas fa-check-circle" style="color:var(--success);margin-right:8px"></i>MDM enrollment coverage</td><td><span class="badge badge-success">100% Pass</span></td><td>Today 6:00 AM</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Open Findings</span></div>
        <div class="card-body">
          <div class="task-list">
            <div class="task-item">
              <div class="task-checkbox in_progress"><i class="fas fa-spinner fa-spin" style="font-size:10px;color:var(--warning)"></i></div>
              <div class="task-content">
                <div class="task-title">2 users missing MFA enrollment</div>
                <div class="task-meta">Elena Vasquez, Aisha Mohammed (not yet started) &middot; Due before onboarding</div>
              </div>
              <span class="badge badge-warning">Medium</span>
            </div>
            <div class="task-item">
              <div class="task-checkbox"><i class="fas"></i></div>
              <div class="task-content">
                <div class="task-title">12% of passwords older than 90 days</div>
                <div class="task-meta">Automated reminder workflow paused &middot; Needs re-activation</div>
              </div>
              <span class="badge badge-warning">Medium</span>
            </div>
            <div class="task-item">
              <div class="task-checkbox"><i class="fas"></i></div>
              <div class="task-content">
                <div class="task-title">2 SaaS apps without SSO enforcement</div>
                <div class="task-meta">Claude, 1 other &middot; Vendor SSO support pending</div>
              </div>
              <span class="badge badge-info">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== NEW HIRE MODAL =====
function openNewHireModal() {
  const html = `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="grid-2" style="gap:12px">
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">First Name</label>
          <input type="text" style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none" placeholder="First name">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Last Name</label>
          <input type="text" style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none" placeholder="Last name">
        </div>
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Email</label>
        <input type="email" style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none" placeholder="name@company.com">
      </div>
      <div class="grid-2" style="gap:12px">
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Role</label>
          <input type="text" style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none" placeholder="Job title">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Department</label>
          <select style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none">
            <option>Engineering</option>
            <option>Design</option>
            <option>Product</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>Analytics</option>
            <option>Security</option>
            <option>Operations</option>
          </select>
        </div>
      </div>
      <div class="grid-2" style="gap:12px">
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Start Date</label>
          <input type="date" style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none">
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Manager</label>
          <input type="text" style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none" placeholder="Manager name">
        </div>
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px">Location</label>
        <select style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-family:inherit;font-size:13px;outline:none">
          <option>San Francisco</option>
          <option>New York</option>
          <option>Remote</option>
        </select>
      </div>
      <div style="background:var(--accent-glow);border:1px solid rgba(99,102,241,0.2);border-radius:var(--radius-sm);padding:12px 16px;font-size:12px;color:var(--accent-light);display:flex;align-items:center;gap:8px">
        <i class="fas fa-robot"></i> Automation will automatically provision: Google Workspace, Slack, SSO, department group, and MDM enrollment
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="showToast('New hire added — onboarding workflow started!', 'success');closeModal()"><i class="fas fa-rocket"></i>Start Onboarding</button>
      </div>
    </div>
  `;
  openModal('Add New Hire', html);
}

// ===== INIT =====
async function init() {
  await fetchData();
  renderPage();
}

init();
