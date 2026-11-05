/**
 * Tag Management: generate tag batches, assign ranges to companies, track every tag
 * (available → assigned → used / void) and review the audit trail.
 * Backend: /tag-management/* (MinexxAPI src/controller/TagManagement.js).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tagApi, errorMessage } from './api';
import { isAdminUser } from './shared';
import OverviewTab from './OverviewTab';
import BatchesTab from './BatchesTab';
import AllocationsTab from './AllocationsTab';
import TagsTab from './TagsTab';
import BalancesTab from './BalancesTab';
import EventsTab from './EventsTab';
import IssuesTab from './IssuesTab';
import TagDetailModal from './TagDetailModal';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
  { key: 'batches', label: 'Batches', icon: 'fa-layer-group' },
  { key: 'allocations', label: 'Allocations', icon: 'fa-share-alt' },
  { key: 'tags', label: 'Tags', icon: 'fa-tag' },
  { key: 'balances', label: 'Balances', icon: 'fa-balance-scale' },
  // Hidden for now; remove `hidden` to bring these tabs back
  { key: 'issues', label: 'Tag Issues', icon: 'fa-exclamation-triangle', hidden: true },
  { key: 'events', label: 'Audit Log', icon: 'fa-history', adminOnly: true, hidden: true },
];

const TagManagement = () => {
  const isAdmin = isAdminUser();
  const platform = localStorage.getItem('_dash') || '3ts';

  const [tab, setTab] = useState('overview');
  const [types, setTypes] = useState([]);
  const [summary, setSummary] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tagPreset, setTagPreset] = useState(null);
  const [openTag, setOpenTag] = useState(null);

  const [openIssues, setOpenIssues] = useState(0);

  const loadSummary = useCallback(() => tagApi.summary().then(setSummary), []);
  const loadOpenIssues = useCallback(
    () => tagApi.useFailures({ status: 'OPEN', limit: 1 }).then((res) => setOpenIssues(res.total)).catch(() => {}),
    []
  );

  useEffect(() => {
    Promise.all([tagApi.types(), tagApi.summary(), tagApi.companies()])
      .then(([typeRows, summaryRows, companyRows]) => {
        setTypes(typeRows);
        setSummary(summaryRows);
        setCompanies(companyRows);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
    loadOpenIssues();
  }, [loadOpenIssues]);

  // After any change: refresh the stock summary and let every tab reload its list
  const handleChanged = useCallback(() => {
    loadSummary().catch(() => {});
    loadOpenIssues();
    setRefreshKey((k) => k + 1);
  }, [loadSummary, loadOpenIssues]);

  const showTags = (preset) => {
    setTagPreset(preset);
    setTab('tags');
  };

  const shared = { types, companies, isAdmin, refreshKey, onChanged: handleChanged, onOpenTag: setOpenTag };

  return (
    <>
      <div className="page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active"><Link to="/overview">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/tag-management">Tag Management</Link></li>
        </ol>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <ul className="nav nav-pills" role="tablist">
          {TABS.filter((t) => !t.hidden && (!t.adminOnly || isAdmin)).map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`nav-link ${tab === t.key ? 'active' : ''}`}
                onClick={() => { setTab(t.key); if (t.key !== 'tags') setTagPreset(null); }}
              >
                <i className={`fa ${t.icon} me-2`} />{t.label}
                {t.key === 'issues' && openIssues > 0 && (
                  <span className="badge badge-danger ms-2" aria-label={`${openIssues} open issues`}>{openIssues}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <span className="badge light badge-primary" title="Switch platform from the header">
          Platform: {platform.toUpperCase()}{isAdmin ? '' : ' · read only'}
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="text-center py-5"><span className="spinner-border text-primary" role="status" /></div>
      )}

      {!loading && !error && (
        <>
          {tab === 'overview' && <OverviewTab summary={summary} companies={companies} onOpenTag={setOpenTag} />}
          {tab === 'batches' && <BatchesTab {...shared} onShowTags={showTags} />}
          {tab === 'allocations' && <AllocationsTab {...shared} onShowTags={showTags} />}
          {tab === 'tags' && <TagsTab {...shared} preset={tagPreset} onClearPreset={() => setTagPreset(null)} />}
          {tab === 'balances' && <BalancesTab {...shared} />}
          {tab === 'issues' && <IssuesTab {...shared} />}
          {tab === 'events' && isAdmin && <EventsTab {...shared} />}
        </>
      )}

      <TagDetailModal tagCode={openTag} onClose={() => setOpenTag(null)} />
    </>
  );
};

export default TagManagement;
