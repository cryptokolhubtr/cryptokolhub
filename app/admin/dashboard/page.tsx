"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Application {
  id: string; name: string; email: string; type?: string;
  role: string; telegram?: string; twitter?: string; country?: string;
  message?: string; submittedAt: string;
}
interface Partner {
  id: string; name: string; logoUrl: string; website: string;
  description?: string; addedAt: string;
}
interface Event {
  id: string; name: string; date: string; location: string;
  description: string; imageUrl: string; link?: string; addedAt: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"applications" | "partners" | "events">("applications");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) router.replace("/admin");
        else { setAuthed(true); setChecking(false); }
      })
      .catch(() => router.replace("/admin"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
  };

  if (checking || !authed) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "applications", label: "Applications" },
    { key: "partners", label: "Partners" },
    { key: "events", label: "Events" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.07] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CKH" className="w-8 h-8 object-contain" style={{ mixBlendMode: "screen" }} />
            <div>
              <span className="font-bold text-white text-sm">Crypto KOL Hub</span>
              <span className="ml-2 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-white/40 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              View Site ↗
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all">
              <LogoutIcon /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.06] w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "applications" && <ApplicationsTab />}
        {tab === "partners" && <PartnersTab />}
        {tab === "events" && <EventsTab />}
      </div>
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────
function ApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<"all" | "individual" | "company">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filter !== "all" ? `?type=${filter}` : "";
    fetch(`/api/admin/applications${q}`)
      .then(r => r.json())
      .then(d => { setApps(d.applications ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const filterBtns = [
    { key: "all", label: "All" },
    { key: "individual", label: "Individual / Şahıs" },
    { key: "company", label: "Company / Firma" },
  ] as const;

  return (
    <div>
      {/* Filter + count */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-2">
          {filterBtns.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === btn.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.08]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <span className="text-white/40 text-sm">{apps.length} application{apps.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 text-white/30">No applications yet</div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 hover:border-indigo-500/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300">
                    {app.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{app.name}</div>
                    <div className="text-white/40 text-xs">{app.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                    app.type === "company"
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }`}>
                    {app.type === "company" ? "Firma" : "Şahıs"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.05] text-white/60 border border-white/[0.08]">
                    {app.role}
                  </span>
                  <span className="text-white/30 text-xs">
                    {new Date(app.submittedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/40">
                {app.telegram && <span>Telegram: <span className="text-white/60">{app.telegram}</span></span>}
                {app.twitter && <span>X: <span className="text-white/60">{app.twitter}</span></span>}
                {app.country && <span>Country: <span className="text-white/60">{app.country}</span></span>}
              </div>

              {app.message && (
                <div className="mt-3 px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.05] text-white/50 text-xs leading-relaxed">
                  {app.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Partners Tab ─────────────────────────────────────────────────────────────
function PartnersTab() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", logoUrl: "", website: "", description: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/partners")
      .then(r => r.json())
      .then(d => { setPartners(d.partners ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await res.json();
    if (d.url) setForm(f => ({ ...f, logoUrl: d.url }));
    setUploadingLogo(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", logoUrl: "", website: "", description: "" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this partner?")) return;
    await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-white/40 text-sm">{partners.length} partner{partners.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all">
          <PlusIcon /> Add Partner
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 bg-white/[0.03] border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">New Partner</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="admin-label">Partner Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. CoinDesk" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Website URL</label>
              <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://..." className="admin-input" />
            </div>
          </div>

          <div className="mb-4">
            <label className="admin-label">Logo</label>
            <div className="flex items-center gap-3">
              <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                placeholder="URL or upload below" className="admin-input flex-1" />
              <button type="button" onClick={() => fileRef.current?.click()}
                disabled={uploadingLogo}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white/60 hover:text-white text-sm transition-all whitespace-nowrap">
                <UploadIcon /> {uploadingLogo ? "Uploading..." : "Upload"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </div>
            {form.logoUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.logoUrl} alt="preview" className="w-10 h-10 object-contain rounded-lg bg-white/[0.05] p-1" />
                <span className="text-white/30 text-xs">Preview</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="admin-label">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description" className="admin-input" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Add Partner"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-white/[0.05] text-white/60 hover:text-white text-sm rounded-xl transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-20 text-white/30">No partners yet. Add your first one!</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(p => (
            <div key={p.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 hover:border-white/[0.12] transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-white/30 text-xl font-bold">{p.name[0]}</span>
                  )}
                </div>
                <button onClick={() => handleDelete(p.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1">
                  <TrashIcon />
                </button>
              </div>
              <h3 className="font-semibold text-white mb-1">{p.name}</h3>
              {p.description && <p className="text-white/40 text-xs mb-2 line-clamp-2">{p.description}</p>}
              {p.website && (
                <a href={p.website} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors truncate block">
                  {p.website.replace("https://", "")}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────
function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", location: "", description: "", imageUrl: "", link: "" });
  const imgRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/events")
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await res.json();
    if (d.url) setForm(f => ({ ...f, imageUrl: d.url }));
    setUploadingImg(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", date: "", location: "", description: "", imageUrl: "", link: "" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-white/40 text-sm">{events.length} event{events.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all">
          <PlusIcon /> Add Event
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 bg-white/[0.03] border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">New Event</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="admin-label">Event Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Istanbul Blockchain Week" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Istanbul, Turkey" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Event Link</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://..." className="admin-input" />
            </div>
          </div>

          <div className="mb-4">
            <label className="admin-label">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Event description..." className="admin-input resize-none" />
          </div>

          <div className="mb-5">
            <label className="admin-label">Event Photo</label>
            <div className="flex items-center gap-3">
              <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="URL or upload" className="admin-input flex-1" />
              <button type="button" onClick={() => imgRef.current?.click()} disabled={uploadingImg}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white/60 hover:text-white text-sm transition-all whitespace-nowrap">
                <UploadIcon /> {uploadingImg ? "Uploading..." : "Upload Photo"}
              </button>
              <input ref={imgRef} type="file" accept="image/*" onChange={handleImgUpload} className="hidden" />
            </div>
            {form.imageUrl && (
              <div className="mt-2">
                <img src={form.imageUrl} alt="preview" className="w-full max-w-xs h-32 object-cover rounded-xl" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Add Event"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-white/[0.05] text-white/60 hover:text-white text-sm rounded-xl transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-white/30">No events yet. Add your first one!</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => (
            <div key={ev.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all group">
              {/* Photo */}
              <div className="h-40 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 relative overflow-hidden">
                {ev.imageUrl ? (
                  <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">📅</div>
                )}
                <button onClick={() => handleDelete(ev.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 bg-black/60 rounded-lg flex items-center justify-center text-white/60 hover:text-red-400 transition-all">
                  <TrashIcon />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{ev.name}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ev.date && (
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {new Date(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {ev.location && (
                    <span className="text-xs text-white/40">📍 {ev.location}</span>
                  )}
                </div>
                {ev.description && <p className="text-white/40 text-xs line-clamp-2">{ev.description}</p>}
                {ev.link && (
                  <a href={ev.link} target="_blank" rel="noopener noreferrer"
                    className="mt-2 text-indigo-400 text-xs hover:text-indigo-300 transition-colors block truncate">
                    {ev.link.replace("https://", "")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
