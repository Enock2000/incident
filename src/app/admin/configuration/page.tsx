'use client';
import React, { useState } from 'react';

/**
 * Admin Dashboard - Incident Configuration
 * Single-file React + TypeScript SPA that contains pages/components for the 15
 * configuration sections requested. This is a frontend-only scaffold (no backend)
 * meant to be dropped into a Next.js / Vite app and iterated on.
 *
 * Styling: TailwindCSS utility classes are used. Icons are simple SVGs.
 *
 * Features included per page (minimal working UI):
 * 1. Incident Types Manager
 * 2. Incident Category Manager
 * 3. Severity Level Configuration
 * 4. Department Assignment Rules
 * 5. Escalation Workflow Builder
 * 6. Incident Status Configuration
 * 7. Location Hierarchy Manager
 * 8. SLA & Response Time Settings
 * 9. Automated Notification Rules
 * 10. Custom Fields Builder
 * 11. User Roles & Permissions
 * 12. Audit Logs & Change Tracking
 * 13. Integration Settings (SMS, Email, GIS)
 * 14. Election-Mode Settings
 * 15. AI-Assisted Classification Rules
 */

// ----------------------------- Types ---------------------------------

type IncidentType = { id: string; name: string; enabled: boolean; defaultSeverity?: string };
type Category = { id: string; name: string; parentId?: string };
type Severity = { id: string; name: string; level: number; color: string };
type DepartmentRule = { id: string; incidentTypeId: string; departmentId: string; priority: number };
type EscalationStep = { id: string; name: string; waitMinutes: number; roleId?: string };

type Status = { id: string; name: string; order: number };

type LocationNode = { id: string; name: string; type: 'province'|'district'|'ward'|'village'; parentId?: string };

type SLA = { id: string; incidentTypeId: string; severityId: string; responseMinutes: number };

type NotificationRule = { id: string; name: string; channels: string[]; incidentTypes: string[] };

type CustomField = { id: string; name: string; type: 'text'|'number'|'select'|'checkbox'|'date'|'file'; options?: string[] };

type Role = { id: string; name: string; permissions: string[] };

type AuditEntry = { id: string; user: string; action: string; timestamp: string; details?: string };

type IntegrationSettings = { smsGateway?: string; emailServer?: string; mapProvider?: string };

type AIConfig = { id: string; name: string; enabled: boolean; model?: string };

// -------------------------- Utilities --------------------------------

const uid = (prefix = '') => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

// ------------------------ Main Dashboard -------------------------------

export default function AdminIncidentConfigDashboard(): JSX.Element {
  const pages = [
    'Incident Types', 'Categories', 'Severities', 'Dept Rules', 'Escalations', 'Statuses', 'Locations',
    'SLAs', 'Notifications', 'Custom Fields', 'Roles', 'Audit Logs', 'Integrations', 'Election Mode', 'AI Rules'
  ];

  const [active, setActive] = useState<number>(0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <aside className="w-72 bg-white border-r shadow-sm">
          <div className="p-4 border-b">
            <h1 className="text-lg font-semibold">Admin • Incident Config</h1>
            <p className="text-sm text-gray-500">Manage system-wide incident settings</p>
          </div>
          <nav className="p-4">
            {pages.map((p, i) => (
              <button
                key={p}
                onClick={() => setActive(i)}
                className={`w-full text-left p-3 rounded-md mb-1 ${active === i ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{pages[active]}</h2>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
              <button className="px-4 py-2 border rounded-md">Preview</button>
            </div>
          </div>

          <div className="space-y-6">
            {active === 0 && <IncidentTypesPage />}
            {active === 1 && <CategoriesPage />}
            {active === 2 && <SeveritiesPage />}
            {active === 3 && <DepartmentRulesPage />}
            {active === 4 && <EscalationBuilderPage />}
            {active === 5 && <StatusesPage />}
            {active === 6 && <LocationsPage />}
            {active === 7 && <SlaPage />}
            {active === 8 && <NotificationsPage />}
            {active === 9 && <CustomFieldsPage />}
            {active === 10 && <RolesPage />}
            {active === 11 && <AuditLogsPage />}
            {active === 12 && <IntegrationsPage />}
            {active === 13 && <ElectionModePage />}
            {active === 14 && <AiRulesPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ------------------------ Page Components ------------------------------

function IncidentTypesPage() {
  const [types, setTypes] = useState<IncidentType[]>([
    { id: uid('t_'), name: 'Fire', enabled: true, defaultSeverity: 'high' },
    { id: uid('t_'), name: 'Road Accident', enabled: true, defaultSeverity: 'critical' },
  ]);
  const [name, setName] = useState('');

  function addType() {
    if (!name.trim()) return;
    setTypes(s => [{ id: uid('t_'), name: name.trim(), enabled: true }, ...s]);
    setName('');
  }

  function toggle(id: string) {
    setTypes(s => s.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Incident Types Manager</h3>
      <div className="flex gap-4 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New incident type" className="flex-1 border p-2 rounded" />
        <button onClick={addType} className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
      </div>

      <div className="divide-y">
        {types.map(t => (
          <div key={t.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-500">Default severity: {t.defaultSeverity ?? '—'}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggle(t.id)} className="px-3 py-1 border rounded">{t.enabled ? 'Enabled' : 'Disabled'}</button>
              <button className="text-sm text-gray-500">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([ { id: uid('c_'), name: 'Security' }, { id: uid('c_'), name: 'Natural Disaster' }]);
  const [name, setName] = useState('');

  function add() { if (!name.trim()) return; setCats(s => [{ id: uid('c_'), name: name.trim() }, ...s]); setName(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Incident Category Manager</h3>
      <div className="flex gap-4 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New category name" className="flex-1 border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
      </div>

      <ul className="list-disc pl-5 space-y-2">
        {cats.map(c => (
          <li key={c.id} className="flex items-center justify-between">
            <span>{c.name}</span>
            <div className="text-sm text-gray-500">Edit</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeveritiesPage() {
  const [sevs, setSevs] = useState<Severity[]>([
    { id: uid('s_'), name: 'Low', level: 1, color: 'green' },
    { id: uid('s_'), name: 'Medium', level: 2, color: 'yellow' },
    { id: uid('s_'), name: 'High', level: 3, color: 'orange' },
  ]);
  const [name, setName] = useState('');
  const [level, setLevel] = useState(2);

  function add() {
    if (!name.trim()) return; setSevs(s => [{ id: uid('s_'), name: name.trim(), level, color: 'gray' }, ...s]); setName(''); setLevel(2);
  }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Severity Level Configuration</h3>
      <div className="flex gap-4 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Severity name" className="border p-2 rounded" />
        <input type="number" value={level} onChange={e => setLevel(Number(e.target.value))} className="w-24 border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
      </div>
      <table className="w-full table-auto">
        <thead><tr><th className="text-left">Name</th><th>Level</th><th>Color</th></tr></thead>
        <tbody>
          {sevs.map(s => (
            <tr key={s.id} className="border-t"><td>{s.name}</td><td className="text-center">{s.level}</td><td className="text-center">{s.color}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DepartmentRulesPage() {
  const [rules, setRules] = useState<DepartmentRule[]>([]);
  const [incidentTypeId, setIncidentTypeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  function add() {
    if (!incidentTypeId || !departmentId) return;
    setRules(s => [{ id: uid('r_'), incidentTypeId, departmentId, priority: 1 }, ...s]);
    setIncidentTypeId(''); setDepartmentId('');
  }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Department Assignment Rules</h3>
      <div className="flex gap-3 mb-4">
        <input placeholder="Incident Type ID" value={incidentTypeId} onChange={e => setIncidentTypeId(e.target.value)} className="border p-2 rounded" />
        <input placeholder="Department ID" value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add Rule</button>
      </div>
      <ul className="space-y-2">
        {rules.map(r => <li key={r.id} className="flex justify-between"><span>{r.incidentTypeId} → {r.departmentId}</span><span className="text-sm text-gray-500">Priority {r.priority}</span></li>)}
      </ul>
    </section>
  );
}

function EscalationBuilderPage() {
  const [steps, setSteps] = useState<EscalationStep[]>([ { id: uid('e_'), name: 'Ward Officer', waitMinutes: 15 }, { id: uid('e_'), name: 'District HQ', waitMinutes: 60 }]);
  const [name, setName] = useState('');
  const [wait, setWait] = useState(15);

  function add() { if (!name.trim()) return; setSteps(s => [...s, { id: uid('e_'), name: name.trim(), waitMinutes: wait }]); setName(''); setWait(15); }

  function remove(id: string) { setSteps(s => s.filter(x => x.id !== id)); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Escalation Workflow Builder</h3>
      <div className="flex gap-3 mb-4">
        <input placeholder="Step name" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" />
        <input type="number" value={wait} onChange={e => setWait(Number(e.target.value))} className="w-28 border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-indigo-600 text-white rounded">Add Step</button>
      </div>

      <ol className="border rounded p-4 space-y-3">
        {steps.map(s => (
          <li key={s.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">Wait: {s.waitMinutes} minutes</div>
            </div>
            <div className="flex gap-2">
              <button className="text-sm text-gray-500">Edit</button>
              <button onClick={() => remove(s.id)} className="text-sm text-red-500">Remove</button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StatusesPage() {
  const [statuses, setStatuses] = useState<Status[]>([ { id: uid('st_'), name: 'Received', order: 1 }, { id: uid('st_'), name: 'Verified', order: 2 }]);
  const [name, setName] = useState('');

  function add() { if (!name.trim()) return; setStatuses(s => [...s, { id: uid('st_'), name: name.trim(), order: s.length + 1 }]); setName(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Incident Status Configuration</h3>
      <div className="flex gap-3 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New status name" className="border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {statuses.map(s => <li key={s.id} className="flex justify-between"><span>{s.order}. {s.name}</span><span className="text-sm text-gray-500">Edit</span></li>)}
      </ul>
    </section>
  );
}

function LocationsPage() {
  const [nodes, setNodes] = useState<LocationNode[]>([ { id: uid('l_'), name: 'Lusaka Province', type: 'province' }]);
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationNode['type']>('district');

  function add() { if (!name.trim()) return; setNodes(s => [...s, { id: uid('l_'), name: name.trim(), type }]); setName(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Location Hierarchy Manager</h3>
      <div className="flex gap-3 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Location name" className="border p-2 rounded" />
        <select value={type} onChange={e => setType(e.target.value as any)} className="border p-2 rounded">
          <option value="province">Province</option>
          <option value="district">District</option>
          <option value="ward">Ward</option>
          <option value="village">Village</option>
        </select>
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['province','district','ward','village'].map(t => (
          <div key={t} className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold capitalize mb-2">{t}s</h4>
            <ul className="text-sm space-y-1">
              {nodes.filter(n => n.type === t as any).map(n => <li key={n.id}>{n.name}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function SlaPage() {
  const [slas, setSlas] = useState<SLA[]>([]);
  const [it, setIt] = useState('');
  const [sev, setSev] = useState('');
  const [minutes, setMinutes] = useState(60);

  function add() { if (!it || !sev) return; setSlas(s => [{ id: uid('sla_'), incidentTypeId: it, severityId: sev, responseMinutes: minutes }, ...s]); setIt(''); setSev(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">SLA & Response Time Settings</h3>
      <div className="flex gap-3 mb-4">
        <input value={it} onChange={e => setIt(e.target.value)} placeholder="Incident Type ID" className="border p-2 rounded" />
        <input value={sev} onChange={e => setSev(e.target.value)} placeholder="Severity ID" className="border p-2 rounded" />
        <input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="w-32 border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add SLA</button>
      </div>
      <ul className="space-y-2">
        {slas.map(s => <li key={s.id}>{s.incidentTypeId} / {s.severityId} → {s.responseMinutes} min</li>)}
      </ul>
    </section>
  );
}

function NotificationsPage() {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [name, setName] = useState('');
  const [channels, setChannels] = useState('sms');

  function add() { if (!name) return; setRules(s => [{ id: uid('n_'), name, channels: channels.split(','), incidentTypes: [] }, ...s]); setName(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Automated Notification Rules</h3>
      <div className="flex gap-3 mb-4">
        <input placeholder="Rule name" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded" />
        <input placeholder="channels (sms,email)" value={channels} onChange={e => setChannels(e.target.value)} className="border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
      </div>
      <ul className="space-y-2">
        {rules.map(r => <li key={r.id}>{r.name} • {r.channels.join(', ')}</li>)}
      </ul>
    </section>
  );
}

function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomField['type']>('text');

  function add() { if (!name) return; setFields(s => [{ id: uid('f_'), name, type }, ...s]); setName(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Custom Fields Builder</h3>
      <div className="flex gap-3 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Field name" className="border p-2 rounded" />
        <select value={type} onChange={e => setType(e.target.value as any)} className="border p-2 rounded">
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="select">Select</option>
          <option value="checkbox">Checkbox</option>
          <option value="date">Date</option>
        </select>
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Add Field</button>
      </div>
      <ul className="space-y-2">
        {fields.map(f => <li key={f.id}>{f.name} • {f.type}</li>)}
      </ul>
    </section>
  );
}

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([ { id: uid('role_'), name: 'Admin', permissions: ['*'] }]);
  const [name, setName] = useState('');

  function add() { if (!name) return; setRoles(s => [{ id: uid('role_'), name, permissions: [] }, ...s]); setName(''); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">User Roles & Permissions</h3>
      <div className="flex gap-3 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Role name" className="border p-2 rounded" />
        <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded">Create Role</button>
      </div>
      <ul className="space-y-2">
        {roles.map(r => <li key={r.id}>{r.name} • {r.permissions.length} perms</li>)}
      </ul>
    </section>
  );
}

function AuditLogsPage() {
  const [logs] = useState<AuditEntry[]>([ { id: uid('a_'), user: 'system', action: 'Created severity High', timestamp: new Date().toISOString(), details: '' }]);

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Audit Logs & Change Tracking</h3>
      <div className="text-sm text-gray-600 mb-2">All configuration changes are recorded here.</div>
      <ul className="space-y-2">
        {logs.map(l => <li key={l.id} className="border p-2 rounded"><div className="font-medium">{l.action}</div><div className="text-xs text-gray-500">By {l.user} • {new Date(l.timestamp).toLocaleString()}</div></li>)}
      </ul>
    </section>
  );
}

function IntegrationsPage() {
  const [cfg, setCfg] = useState<IntegrationSettings>({ smsGateway: 'MTN SMS', emailServer: 'smtp.example.com', mapProvider: 'Mapbox' });

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Integration Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm block mb-1">SMS Gateway</label>
          <input value={cfg.smsGateway} onChange={e => setCfg(s => ({ ...s, smsGateway: e.target.value }))} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="text-sm block mb-1">Email Server</label>
          <input value={cfg.emailServer} onChange={e => setCfg(s => ({ ...s, emailServer: e.target.value }))} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="text-sm block mb-1">Map Provider</label>
          <input value={cfg.mapProvider} onChange={e => setCfg(s => ({ ...s, mapProvider: e.target.value }))} className="border p-2 rounded w-full" />
        </div>
      </div>
    </section>
  );
}

function ElectionModePage() {
  const [enabled, setEnabled] = useState(false);

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Election-Mode Settings</h3>
      <div className="flex items-center gap-4">
        <label className="font-medium">Enable Election Mode</label>
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="h-5 w-5" />
      </div>

      <div className="mt-4 text-sm text-gray-600">When enabled, the system exposes election-related incident types, polling station maps, and stricter escalation rules.</div>
    </section>
  );
}

function AiRulesPage() {
  const [rules, setRules] = useState<AIConfig[]>([ { id: uid('ai_'), name: 'Duplicate Detector', enabled: true, model: 'v1-dedupe' }]);

  function toggle(id: string) { setRules(s => s.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)); }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">AI-Assisted Classification Rules</h3>
      <ul className="space-y-2">
        {rules.map(r => (
          <li key={r.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-500">Model: {r.model}</div>
            </div>
            <div>
              <button onClick={() => toggle(r.id)} className={`px-3 py-1 rounded ${r.enabled ? 'bg-green-600 text-white' : 'border'}`}>{r.enabled ? 'Enabled' : 'Disabled'}</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
