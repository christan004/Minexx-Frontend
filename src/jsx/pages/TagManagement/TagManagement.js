/**
 * Tag Management: generate tag batches, assign ranges to companies, track every tag
 * (available → assigned → used / void) and review the audit trail.
 * Backend: /tag-management/* (MinexxAPI src/controller/TagManagement.js).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tagApi, errorMessage } from './api';
import { isAdminUser, canManageTags } from './shared';
import { tr } from './i18n';
import OverviewTab from './OverviewTab';
import BatchesTab from './BatchesTab';
import AllocationsTab from './AllocationsTab';
import TagsTab from './TagsTab';
import BalancesTab from './BalancesTab';
import EventsTab from './EventsTab';
import IssuesTab from './IssuesTab';
import SettingsTab from './SettingsTab';
import StockAlerts from './StockAlerts';
import TagDetailModal from './TagDetailModal';

const NO_ALERTS = { system: [], companies: [] };

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
  { key: 'batches', label: 'Batches', icon: 'fa-layer-group', managerOnly: true },
  { key: 'allocations', label: 'Allocations', icon: 'fa-share-alt' },
  { key: 'tags', label: 'Tags', icon: 'fa-tag' },
  { key: 'balances', label: 'Balances', icon: 'fa-balance-scale' },
  // Hidden for now; remove `hidden` to bring these tabs back
  { key: 'issues', label: 'Tag Issues', icon: 'fa-exclamation-triangle', hidden: true },
  { key: 'events', label: 'Audit Log', icon: 'fa-history', managerOnly: true, hidden: true },
  // Settings stays for Minexx (type minexx) only
  { key: 'settings', label: 'Settings', icon: 'fa-cog', adminOnly: true },
];

const TagManagement = () => {
  // isAdmin (minexx): Settings tab. canManage (everyone with Tag Management in the menu): all other actions
  const isAdmin = isAdminUser();
  const canManage = canManageTags();
  const platform = localStorage.getItem('_dash') || '3ts';

  // The open tab and every tab's filters live in the page address, so a report can be shared
  const [params, setParams] = useSearchParams();
  const visibleTabs = TABS.filter((t) => !t.hidden && (!t.managerOnly || canManage) && (!t.adminOnly || isAdmin));
  const tab = visibleTabs.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview';
  const setTab = (key) => {
    const next = new URLSearchParams(params);
    next.set('tab', key);
    setParams(next, { replace: true });
  };

  const [types, setTypes] = useState([]);
  const [summary, setSummary] = useState([]);
  const [allCompanies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openTag, setOpenTag] = useState(null);

  // Users who are not tag managers only pick from their own companies (the API limits the data the same way)
  const companies = useMemo(() => {
    if (canManage) return allCompanies;
    let user = null;
    try { user = JSON.parse(localStorage.getItem('_authUsr')); } catch (e) { user = null; }
    const own = [user?.company, ...(user?.companies || [])].filter(Boolean).map(String);
    return allCompanies.filter((c) => own.includes(String(c.id)));
  }, [allCompanies, canManage]);

  const [openIssues, setOpenIssues] = useState(0);
  const [stockAlerts, setStockAlerts] = useState(NO_ALERTS);

  const loadSummary = useCallback(() => tagApi.summary().then(setSummary), []);
  // Alerts never block the page: on any error the banner is simply not shown
  const loadStockAlerts = useCallback(
    () => tagApi.stockAlerts().then(setStockAlerts).catch(() => setStockAlerts(NO_ALERTS)),
    []
  );
  const loadOpenIssues = useCallback(
    () => (canManage
      ? tagApi.useFailures({ status: 'OPEN', limit: 1 }).then((res) => setOpenIssues(res.total)).catch(() => {})
      : Promise.resolve()),
    [canManage]
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
    loadStockAlerts();
  }, [loadOpenIssues, loadStockAlerts]);

  // After any change: refresh types (settings), the stock summary and alerts, and let every tab reload its list
  const handleChanged = useCallback(() => {
    tagApi.types().then(setTypes).catch(() => {});
    loadSummary().catch(() => {});
    loadOpenIssues();
    loadStockAlerts();
    setRefreshKey((k) => k + 1);
  }, [loadSummary, loadOpenIssues, loadStockAlerts]);

  // Open the Tags tab filtered on a batch or allocation ({ batchId } or { allocationId })
  const showTags = (preset) => {
    const next = new URLSearchParams(params);
    [...next.keys()].filter((key) => key.startsWith('tags.')).forEach((key) => next.delete(key));
    Object.entries(preset).forEach(([key, value]) => next.set(`tags.${key}`, String(value)));
    next.set('tab', 'tags');
    setParams(next, { replace: true });
  };

  // The tabs' isAdmin prop means "may do the actions" (generate, assign, return, void, cancel)
  const shared = { types, companies, isAdmin: canManage, refreshKey, onChanged: handleChanged, onOpenTag: setOpenTag };

  return (
    <>
      <div className="page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active"><Link to="/overview">{tr('Dashboard')}</Link></li>
          <li className="breadcrumb-item"><Link to="/tag-management">{tr('Tag Management')}</Link></li>
        </ol>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <ul className="nav nav-pills" role="tablist">
          {visibleTabs.map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`nav-link ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <i className={`fa ${t.icon} me-2`} />{tr(t.label)}
                {t.key === 'issues' && openIssues > 0 && (
                  <span className="badge badge-danger ms-2" aria-label={tr('{n} open issues', { n: openIssues })}>{openIssues}</span>
                )}
                {t.key === 'balances' && stockAlerts.companies.length > 0 && (
                  <span className="badge badge-danger ms-2" aria-label={tr('{n} companies low on tags', { n: stockAlerts.companies.length })}>
                    {stockAlerts.companies.length}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <span className="badge light badge-primary" title={tr('Switch platform from the header')}>
          {tr('Platform')}: {platform.toUpperCase()}{canManage ? '' : ` · ${tr('read only')}`}
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="text-center py-5"><span className="spinner-border text-primary" role="status" /></div>
      )}

      {!loading && !error && (
        <StockAlerts alerts={stockAlerts} isAdmin={canManage} onOpenSettings={isAdmin ? () => setTab('settings') : null} />
      )}

      {!loading && !error && (
        <>
          {tab === 'overview' && (
            <OverviewTab summary={summary} types={types} stockAlerts={stockAlerts} companies={companies} onOpenTag={setOpenTag} />
          )}
          {tab === 'batches' && canManage && <BatchesTab {...shared} onShowTags={showTags} />}
          {tab === 'allocations' && <AllocationsTab {...shared} onShowTags={showTags} />}
          {tab === 'tags' && <TagsTab {...shared} />}
          {tab === 'balances' && <BalancesTab {...shared} stockAlerts={stockAlerts} />}
          {tab === 'issues' && <IssuesTab {...shared} />}
          {tab === 'events' && canManage && <EventsTab {...shared} />}
          {tab === 'settings' && isAdmin && <SettingsTab {...shared} />}
        </>
      )}

      <TagDetailModal tagCode={openTag} onClose={() => setOpenTag(null)} />
    </>
  );
};

export default TagManagement;
