import React, { useContext, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { ThemeContext } from "../../../context/ThemeContext";
import axiosInstance from '../../../services/AxiosInstance';
import { Segment, Loader } from 'semantic-ui-react';

const baseURL_ = "https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/";



// ───────────────────────────────────────────── 
// API Functions
// ─────────────────────────────────────────────

const fetchKPIs = async (country = null) => {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    try {
        const response = await axiosInstance.get(`tag/kpis?${params}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        throw error;
    }
};

const fetchCompanyBreakdown = async (timePeriod, country = null) => {
    const params = new URLSearchParams({ timePeriod });
    if (country) params.append('country', country);
    try {
        const response = await axiosInstance.get(`tag/breakdown?${params}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching breakdown:', error);
        throw error;
    }
};

const fetchDashboard = async (country = null) => {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    try {
        const response = await axiosInstance.get(`tag/dashboard?${params}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        throw error;
    }
};

/**
 * Add tags for a company via the addTag endpoint
 * @param {string} companyId   - Company UniqueID
 * @param {string} tagCategory - 'Mine Bag' | 'Comptoir Tag' | 'Exported Tag'
 * @param {number} tagNumber   - Number of tags to add
 * @param {string} platform    - '3ts' | 'gold'
 */
const addTagAPI = async (companyId, tagCategory, tagNumber, platform = '3ts') => {
    try {
        const response = await axiosInstance.post(`tag/add`, {
            companyId,
            tagCategory,
            tagNumber,
        }, {
            headers: { 'x-platform': platform }
        });
        return response.data;
    } catch (error) {
        // Surface backend error message if available
        const message = error?.response?.data?.message || error.message;
        throw new Error(message);
    }
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

// Maps frontend key → backend tagCategory value
const TAG_TYPES = [
    { key: 'mine',     label: 'Mine Tags',     field: 'mineTags',       badge: 'success', category: 'Mine Bag'      },
    { key: 'comptoir', label: 'Comptoir Tags', field: 'comptroitTags',  badge: 'warning', category: 'Comptoir Tag'  },
    { key: 'export',   label: 'Export Tags',   field: 'exportTags',     badge: 'info',    category: 'Exported Tag'  },
];

// ─────────────────────────────────────────────
// AddTagModal
// ─────────────────────────────────────────────
const AddTagModal = ({ company, onClose, onSuccess }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [numTags, setNumTags]           = useState('');
    const [submitting, setSubmitting]     = useState(false);
    const [submitError, setSubmitError]   = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    // Reset state when modal opens for a new company
    useEffect(() => {
        if (company) {
            setSelectedType(null);
            setNumTags('');
            setSubmitError(null);
            setSubmitSuccess(null);
            setSubmitting(false);
        }
    }, [company]);

    if (!company) return null;

    const selectedTypeMeta = TAG_TYPES.find(t => t.key === selectedType);
    const currentCount     = selectedTypeMeta ? (company[selectedTypeMeta.field] || 0) : 0;
    const parsedNum        = parseInt(numTags, 10);
    const isValid          = selectedType && parsedNum > 0 && !submitting;

    const handleTypeSelect = (key) => {
        setSelectedType(key);
        setNumTags('');
        setSubmitError(null);
        setSubmitSuccess(null);
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            const result = await addTagAPI(
                company.id,                    // UniqueID from Company table
                selectedTypeMeta.category,     // 'Mine Bag' | 'Comptoir Tag' | 'Exported Tag'
                parsedNum,
                '3ts'
            );

            setSubmitSuccess(
                result.data?.action === 'updated_and_inserted'
                    ? `✅ Tags updated. New total for ${selectedTypeMeta.label} this month: ${result.data.newTotal}`
                    : `✅ ${parsedNum} ${selectedTypeMeta.label} added successfully`
            );

            // Notify parent to refresh breakdown data after short delay
            setTimeout(() => {
                onSuccess();
            }, 1200);

        } catch (err) {
            setSubmitError(`❌ ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
    };

    const borderColors = { success: '#22c55e', warning: '#eab308', info: '#0ea5e9' };
    const bgColors     = { success: 'rgba(34,197,94,0.08)', warning: 'rgba(234,179,8,0.08)', info: 'rgba(14,165,233,0.08)' };
    const textColors   = { success: '#4ade80', warning: '#facc15', info: '#38bdf8' };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 1050,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={handleOverlayClick}
        >
            <div
                style={{
                    background: '#1a2228',
                    border: '1px solid #2a3a4a',
                    borderRadius: '16px',
                    padding: '28px',
                    width: '440px',
                    maxWidth: '95vw',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                }}
            >
                {/* ── Header ───────────────────────────────────────── */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h5 className="mb-1" style={{ color: '#e2e8f0', fontWeight: 700 }}>
                            ➕ Add Tags
                        </h5>
                        <small style={{ color: '#64748b' }}>{company.name}</small>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{
                            background: 'none', border: 'none',
                            color: '#64748b', fontSize: '20px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            lineHeight: 1,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* ── Tag Type Selection ────────────────────────────── */}
                <label style={{
                    fontSize: '11px', fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    display: 'block', marginBottom: '8px'
                }}>
                    Type of Tags
                </label>
                <div className="row mb-3 g-2">
                    {TAG_TYPES.map(({ key, label, field, badge }) => {
                        const isSelected = selectedType === key;
                        return (
                            <div className="col-4" key={key}>
                                <button
                                    onClick={() => handleTypeSelect(key)}
                                    disabled={submitting}
                                    style={{
                                        width: '100%',
                                        background:  isSelected ? bgColors[badge]     : '#111c25',
                                        border:      `2px solid ${isSelected ? borderColors[badge] : '#1e2d3d'}`,
                                        color:       isSelected ? textColors[badge]   : '#94a3b8',
                                        borderRadius: '8px',
                                        padding: '10px 6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.18s',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {label}
                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                                        Current: {(company[field] || 0).toLocaleString()}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* ── Number of Tags Input ──────────────────────────── */}
                {selectedType && (
                    <div className="mb-4">
                        <label
                            htmlFor="numTagsInput"
                            style={{
                                fontSize: '11px', fontWeight: 700, color: '#94a3b8',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                display: 'block', marginBottom: '8px'
                            }}
                        >
                            Number of Tags to Add
                        </label>
                        <input
                            id="numTagsInput"
                            type="number"
                            min={1}
                            value={numTags}
                            onChange={e => {
                                setNumTags(e.target.value);
                                setSubmitError(null);
                                setSubmitSuccess(null);
                            }}
                            placeholder="Enter amount..."
                            disabled={submitting}
                            style={{
                                width: '100%',
                                background: '#0f1923',
                                border: '1px solid #243040',
                                color: '#e2e8f0',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                opacity: submitting ? 0.6 : 1,
                            }}
                        />
                        {parsedNum > 0 && !submitSuccess ? (
                            <small style={{ color: '#4ade80', marginTop: '4px', display: 'block' }}>
                                After addition: {(currentCount + parsedNum).toLocaleString()} tags total
                            </small>
                        ) : (
                            !submitSuccess && (
                                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                                    Current: {currentCount.toLocaleString()} tags
                                </small>
                            )
                        )}
                    </div>
                )}

                {/* ── Success Message ───────────────────────────────── */}
                {submitSuccess && (
                    <div style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        color: '#4ade80',
                        fontSize: '13px',
                    }}>
                        {submitSuccess}
                    </div>
                )}

                {/* ── Error Message ─────────────────────────────────── */}
                {submitError && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        color: '#f87171',
                        fontSize: '13px',
                    }}>
                        {submitError}
                    </div>
                )}

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="d-flex justify-content-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="btn btn-sm"
                        style={{
                            background: '#243040', color: '#94a3b8',
                            border: 'none', padding: '8px 18px',
                            borderRadius: '8px', fontWeight: 600,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="btn btn-sm btn-primary"
                        style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            minWidth: '90px',
                            opacity: !isValid ? 0.6 : 1,
                        }}
                    >
                        {submitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Saving...
                            </>
                        ) : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Tags (main component)
// ─────────────────────────────────────────────
const Tags = ({ language, country }) => {
    const { changeTitle }                         = useContext(ThemeContext);
    const [selectedPeriod, setSelectedPeriod]     = useState('today');
    const [searchInput, setSearchInput]           = useState('');
    const [loading, setLoading]                   = useState(true);
    const [breakdownLoading, setBreakdownLoading] = useState(false);
    const [error, setError]                       = useState(null);
    const [currentPage, setCurrentPage]           = useState(1);
    const [modalCompany, setModalCompany]         = useState(null);
    const [dashboardData, setDashboardData]       = useState(null);
    const [breakdownData, setBreakdownData]       = useState(null);

    const PAGE_SIZE = 20;
    const user = JSON.parse(localStorage.getItem(`_authUsr`));

    // ── Load dashboard + default breakdown together on mount/country change ──
    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                setError(null);
                setDashboardData(null);
                setBreakdownData(null);

                const [dashboard, breakdown] = await Promise.all([
                    fetchDashboard(country),
                    fetchCompanyBreakdown('today', country),
                ]);

                setDashboardData(dashboard);
                setBreakdownData(breakdown);
                setSelectedPeriod('today');
            } catch (err) {
                setError(err.message);
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [country]);

    useEffect(() => {
        changeTitle('Tags | Minexx');
    }, [changeTitle]);

    // ── Reload breakdown for the currently selected period ──────────────────
    const reloadBreakdown = async () => {
        try {
            setBreakdownLoading(true);
            const data = await fetchCompanyBreakdown(selectedPeriod, country);
            setBreakdownData(data);
        } catch (err) {
            console.error('Failed to reload breakdown:', err);
        } finally {
            setBreakdownLoading(false);
        }
    };

    // ── KPI card click → load new period breakdown ──────────────────────────
    const handleKPIClick = async (timePeriod) => {
        if (timePeriod === selectedPeriod) return;
        try {
            setBreakdownLoading(true);
            setSelectedPeriod(timePeriod);
            setSearchInput('');
            setCurrentPage(1);
            const data = await fetchCompanyBreakdown(timePeriod, country);
            setBreakdownData(data);
        } catch (err) {
            console.error('Failed to load breakdown:', err);
            setError(err.message);
        } finally {
            setBreakdownLoading(false);
        }
    };

    // ── Open modal — pass real company UniqueID ──────────────────────────────
    const handleOpenModal = (company) => {
        setModalCompany({
            id:           company['Company ID'],    // ← real UniqueID for API call
            name:         company['Company Name'],
            mineTags:     company['Tags at Mine'],
            comptroitTags: company['Tags at Comptoir'],
            exportTags:   company['Tags Exported'],
        });
    };

    return (
        <Segment>
            <Loader active={loading} />

            {/* ── Add Tag Modal ─────────────────────────────────────────── */}
            <AddTagModal
                company={modalCompany}
                onClose={() => setModalCompany(null)}
                onSuccess={() => {
                    setModalCompany(null);
                    reloadBreakdown();
                }}
            />

            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to="/overview">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="">Tag Management</Link>
                    </li>
                </ol>
            </div>

            {/* ── Error Banner ──────────────────────────────────────────── */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            )}

            {/* ── KPI Cards ─────────────────────────────────────────────── */}
            {!loading && dashboardData && dashboardData.kpis && (
                <div className="row mb-4">
                    {[
                        { key: 'today', label: 'Tags Used Today',      icon: 'fa-tags'     },
                        { key: 'week',  label: 'Tags Used This Week',  icon: 'fa-calendar' },
                        { key: 'month', label: 'Tags Used This Month', icon: 'fa-calendar' },
                    ].map(({ key, label, icon }) => (
                        <div className="col-xl-4 col-lg-6 col-md-6 mb-3" key={key}>
                            <div
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    border: selectedPeriod === key
                                        ? '2px solid #007bff'
                                        : '1px solid #e3e6f0',
                                    boxShadow: selectedPeriod === key
                                        ? '0 4px 12px rgba(0,123,255,0.15)'
                                        : 'none',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#1A2228',
                                    opacity: breakdownLoading && selectedPeriod !== key ? 0.6 : 1,
                                }}
                                onClick={() => handleKPIClick(key)}
                            >
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="text-muted mb-2 font-weight-bold">
                                                {label}
                                            </h6>
                                            <h2
                                                className="font-weight-bold text-primary mb-1"
                                                style={{ fontSize: '2.5rem' }}
                                            >
                                                {dashboardData.kpis[key].total.toLocaleString()}
                                            </h2>
                                            <small className="text-muted">
                                                Mine: {dashboardData.kpis[key].byStage.mine.toLocaleString()} |{' '}
                                                Comptoir: {dashboardData.kpis[key].byStage.processing.toLocaleString()} |{' '}
                                                Export: {dashboardData.kpis[key].byStage.export.toLocaleString()}
                                            </small>
                                        </div>
                                        <div style={{
                                            width: '50px', height: '50px',
                                            borderRadius: '8px',
                                            backgroundColor: '#1A1A1A',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px',
                                        }}>
                                            <i className={`fa ${icon}`} style={{ color: '#007bff' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Company Breakdown Table ───────────────────────────────── */}
            {/* ── Company Breakdown Table ───────────────────────────────── */}
{!loading && (
    <div className="row">
        <div className="col-xl-12">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">
                        Company Breakdown —{' '}
                        {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                        {breakdownLoading && (
                            <span
                                className="ms-2 spinner-border spinner-border-sm text-primary"
                                role="status"
                            />
                        )}
                    </h4>
                    <input
                        style={{ width: '350px' }}
                        className="form-control"
                        placeholder="Search company name..."
                        onChange={(e) => {
                            setSearchInput(e.currentTarget.value);
                            setCurrentPage(1);
                        }}
                        value={searchInput}
                    />
                </div>

                <div className="card-body">
                    <div className="w-100 table-responsive">
                        <div id="tagsTable_basic_table" className="dataTables_wrapper">
                            <table
                                id="tagsTable"
                                className="display dataTable w-100 no-footer"
                                role="grid"
                            >
                                <thead>
                                    <tr role="row">
                                        <th tabIndex={0} rowSpan={1} colSpan={1}>
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input" id="checkAll" />
                                                <label className="custom-control-label" htmlFor="checkAll" />
                                            </div>
                                        </th>
                                        <th tabIndex={0} rowSpan={1} colSpan={1}>Company Name</th>
                                        <th tabIndex={0} rowSpan={1} colSpan={1}>Mine Tags</th>
                                        <th tabIndex={0} rowSpan={1} colSpan={1}>Comptoir Tags</th>
                                        <th tabIndex={0} rowSpan={1} colSpan={1}>Export Tags</th>
                                        <th tabIndex={0} rowSpan={1} colSpan={1}>Total Tags Used</th>
                                        {user && user.email === 'beda@minexx.email' && (
                                            <th tabIndex={0} rowSpan={1} colSpan={1} style={{ textAlign: 'center' }}>
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {/* ── Loading skeleton rows ── */}
                                    {breakdownLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} role="row" className="odd">
                                                {Array.from({ length: user?.email === 'beda@minexx.email' ? 7 : 6 }).map((_, j) => (
                                                    <td key={j}>
                                                        <div style={{
                                                            height: '18px',
                                                            background: 'rgba(255,255,255,0.06)',
                                                            borderRadius: '4px',
                                                            animation: 'pulse 1.5s ease-in-out infinite',
                                                        }} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : !breakdownData || !breakdownData.companies || breakdownData.companies.length === 0 ? (
                                        <tr role="row" className="odd">
                                            <td
                                                colSpan={user && user.email === 'beda@minexx.email' ? 7 : 6}
                                                className="text-center"
                                            >
                                                No companies found
                                            </td>
                                        </tr>
                                    ) : (
                                        breakdownData.companies
                                            .filter(company =>
                                                !searchInput ||
                                                company['Company Name']?.toLowerCase().includes(searchInput.toLowerCase())
                                            )
                                            .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                                            .map((company, idx) => (
                                                <tr role="row" key={idx} className="odd">
                                                    <td className="sorting_1">
                                                        <div className="custom-control custom-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                className="custom-control-input"
                                                                id={`customCheckBox_${idx}`}
                                                            />
                                                            <label
                                                                className="custom-control-label"
                                                                htmlFor={`customCheckBox_${idx}`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>{company['Company Name']}</td>
                                                    <td>
                                                        <span className="badge light badge-success">
                                                            {(company['Tags at Mine'] ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge light badge-warning">
                                                            {(company['Tags at Comptoir'] ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge light badge-info">
                                                            {(company['Tags Exported'] ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-primary">
                                                            {(company['Tags Used (Total)'] ?? 0).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    {user && user.email === 'beda@minexx.email' && (
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleOpenModal(company)}
                                                                title={`Add tags for ${company['Company Name']}`}
                                                            >
                                                                + Add Tag
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {!breakdownLoading && breakdownData?.companies?.filter(c =>
                            !searchInput ||
                            c['Company Name']?.toLowerCase().includes(searchInput.toLowerCase())
                        ).length > PAGE_SIZE && (
                            <div className="d-flex justify-content-between align-items-center mt-3 px-1">
                                <div className="dataTables_info">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
                                    {Math.min(currentPage * PAGE_SIZE, breakdownData.companies.length)} of{' '}
                                    {breakdownData.companies.length} entries
                                </div>
                                <div className="dataTables_paginate paging_simple_numbers">
                                    <button
                                        className={`btn btn-sm btn-primary me-2 ${currentPage <= 1 ? 'disabled' : ''}`}
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage <= 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="mx-2">
                                        Page {currentPage} / {Math.ceil(breakdownData.companies.length / PAGE_SIZE) || 1}
                                    </span>
                                    <button
                                        className={`btn btn-sm btn-primary ${
                                            currentPage >= Math.ceil(breakdownData.companies.length / PAGE_SIZE) ? 'disabled' : ''
                                        }`}
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(breakdownData.companies.length / PAGE_SIZE)))}
                                        disabled={currentPage >= Math.ceil(breakdownData.companies.length / PAGE_SIZE)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
        </Segment>
    );
};

export default Tags;