import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Dropdown, Modal, Button, Spinner } from 'react-bootstrap';
import axiosInstance from '../../../services/AxiosInstance';
import { toast } from 'react-toastify';

// ─── Safe localStorage parser ────────────────────────────────────────────────
const safeParseUser = () => {
    try {
        const raw = localStorage.getItem('_authUsr');
        if (!raw || raw === 'undefined' || raw === 'null') return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const Users = () => {
    const [sort, setsort] = useState(10);
    const { platform } = useParams();
    const activePag = useRef(0);

    const [edit, setedit] = useState(null);
    const [userstatus, setuserstatus] = useState(null);
    const [remove, setremove] = useState(null);
    const [add, setadd] = useState(false);
    const [loading, setloading] = useState(true);

    const dash = localStorage.getItem('_dash') || '3ts';

    // ── Safe user parse — never crashes on null/corrupt localStorage value ──
    const [user, setuser] = useState(safeParseUser);

    const [users, setusers] = useState([]);
    const [filtered, setfiltered] = useState([]);

    // ── Defensive default — keys always present even if API omits them ───────
    const [companies, setcompanies] = useState({ threets: [], gold: [] });

    const [type, settype] = useState('buyer');
    const [access, setaccess] = useState(dash === '3ts' ? '3ts' : 'gold');
    const [name, setname] = useState('');
    const [surname, setsurname] = useState('');
    const [email, setemail] = useState('');
    const [company, setcompany] = useState('ce62eb6o');
    const [mineral, setmineral] = useState(dash === '3ts' ? 'Tin' : 'Gold');

    // ─── Pagination helpers ───────────────────────────────────────────────────
    const onClick = (i) => {
        activePag.current = i;
    };

    const paggination = (arr) => {
        const pages = [];
        for (let x = 1; x <= Math.ceil(arr.length / sort); x++) {
            pages.push(x);
        }
        return pages;
    };

    const paginate = (arr) =>
        arr.slice(activePag.current * sort, activePag.current * sort + sort);

    // ─── Data fetching ────────────────────────────────────────────────────────
    const getUsers = () => {
        setusers([]);
        setfiltered([]);
        setloading(true);
        onClick(0);
        axiosInstance
            .get(`/users/${platform}`)
            .then((response) => {
                const list = Array.isArray(response.data.users) ? response.data.users : [];
                setusers(list);
                setfiltered(list);
                setloading(false);
            })
            .catch((err) => {
                setloading(false);
                toast.error(err.message, {
                    style: { fontFamily: 'Poppins', fontSize: 12 },
                });
            });
    };

    const getCompanies = () => {
        axiosInstance
            .get(`/companies/all`)
            .then((response) => {
                const raw = response.data.companies;
                // ── Defensive: ensure both keys are always arrays ─────────────
                setcompanies({
                    threets: Array.isArray(raw?.threets) ? raw.threets : [],
                    gold: Array.isArray(raw?.gold) ? raw.gold : [],
                });
            })
            .catch((err) => {
                toast.error(err.message, {
                    style: { fontFamily: 'Poppins', fontSize: 12 },
                });
            });
    };

    useEffect(() => {
        getUsers();
        getCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [platform]);

    // ─── Search filter ────────────────────────────────────────────────────────
    const filter = (e) => {
        const input = e.currentTarget.value.toLowerCase();
        onClick(0);
        setfiltered(
            users.filter(
                (u) =>
                    u.name?.toLowerCase().includes(input) ||
                    u.email?.toLowerCase().includes(input)
            )
        );
    };

    // ─── CRUD handlers ────────────────────────────────────────────────────────
    const createUser = () => {
        if (name.trim().length < 3) return toast.error('Please provide a valid first name');
        if (surname.trim().length < 3) return toast.error('Please provide a valid last name');
        if (email.trim().length < 10) return toast.error('Please provide a valid email address');

        setloading(true);
        axiosInstance
            .post(`/users`, {
                name,
                surname,
                email,
                type,
                access,
                companies: type === 'buyer' || type === 'investor' ? [company] : [],
                minerals: type === 'buyer' || type === 'investor' ? [mineral] : [],
            })
            .then(() => {
                setloading(false);
                setadd(false);
                setname('');
                setsurname('');
                setemail('');
                setaccess('3ts');
                getUsers();
                toast.success('The user has been successfully added.');
            })
            .catch((err) => {
                setloading(false);
                toast.error(err.message, {
                    style: { fontFamily: 'Poppins', fontSize: 12 },
                });
            });
    };

    const updateUser = () => {
        if (name.trim().length < 3) return toast.error('Please provide a valid first name');
        if (surname.trim().length < 3) return toast.error('Please provide a valid last name');
        if (email.trim().length < 10) return toast.error('Please provide a valid email address');

        setloading(true);
        axiosInstance
            .put(`/users/${edit.uid}`, {
                name,
                surname,
                email,
                access,
                uid: edit.uid,
            })
            .then(() => {
                setloading(false);
                setadd(false);
                setname('');
                setsurname('');
                setemail('');
                setaccess('3ts');
                setedit(null);
                getUsers();
                toast.success('The user has been successfully updated.');
            })
            .catch((err) => {
                setloading(false);
                toast.error(err.message, {
                    style: { fontFamily: 'Poppins', fontSize: 12 },
                });
            });
    };

    const removeUser = () => {
        const selected = remove;
        setremove(null);
        axiosInstance
            .delete(`/users/${selected.uid}`)
            .then(() => {
                toast.success(
                    `${selected.name} has been successfully deleted from dashboard users.`,
                    { style: { fontFamily: 'Poppins', fontSize: 12 } }
                );
                getUsers();
            })
            .catch((err) => {
                toast.error(err.message, {
                    style: { fontFamily: 'Poppins', fontSize: 12 },
                });
            });
    };

    const changeStatus = () => {
        const selected = userstatus;
        setuserstatus(null);
        axiosInstance
            .put(`/users/status/${selected.uid}`)
            .then(() => {
                toast.success(
                    `${selected.name} has been successfully ${
                        selected.status === 'suspended' ? 'activated' : 'suspended'
                    } from dashboard users.`,
                    { style: { fontFamily: 'Poppins', fontSize: 12 } }
                );
                getUsers();
            })
            .catch((err) => {
                toast.error(err.message, {
                    style: { fontFamily: 'Poppins', fontSize: 12 },
                });
            });
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active">
                        <Link to="#">Users</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="#">Users List</Link>
                    </li>
                </ol>
            </div>

            {/* ── Create User Modal ─────────────────────────────────────────── */}
            <Modal show={add} className="modal fade" id="addModal" onHide={() => setadd(false)}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Create New User Account</h3>
                        <Button
                            variant=""
                            type="button"
                            disabled={loading}
                            className="close"
                            onClick={() => setadd(false)}
                        >
                            <span>×</span>
                        </Button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>First Name</strong>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                disabled={loading}
                                placeholder="Name"
                                onChange={(e) => setname(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>Last Name</strong>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={surname}
                                placeholder="Surname"
                                onChange={(e) => setsurname(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>Email</strong>
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                placeholder="Email Address"
                                onChange={(e) => setemail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>Dashboard Access</strong>
                            </label>
                            <select
                                onChange={(e) => setaccess(e.target.value)}
                                value={access}
                                className="form-control"
                            >
                                <option value="3ts">3Ts</option>
                                <option value="gold">Gold</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>User Type</strong>
                            </label>
                            <select
                                onChange={(e) => settype(e.target.value)}
                                value={type}
                                className="form-control"
                            >
                                <option value="buyer">Buyer</option>
                                <option value="minexx">Admin</option>
                                <option value="investor">Investor</option>
                                <option value="regulator">Regulator</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="government">Government</option>
                            </select>
                        </div>

                        {(type === 'buyer' || type === 'investor') && (
                            <>
                                <div className="form-group">
                                    <label className="mb-2">
                                        <strong>Default Company</strong>
                                    </label>
                                    <select
                                        onChange={(e) => setcompany(e.target.value)}
                                        value={company}
                                        className="form-control"
                                    >
                                        {/* ── Safe .map() — arrays always defined ── */}
                                        {access === '3ts' &&
                                            companies.threets.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        {access === 'gold' &&
                                            companies.gold.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        {access === 'both' && (
                                            <>
                                                {companies.threets.map((c) => (
                                                    <option key={`3ts-${c.id}`} value={c.id}>
                                                        {c.name} [3Ts]
                                                    </option>
                                                ))}
                                                {companies.gold.map((c) => (
                                                    <option key={`gold-${c.id}`} value={c.id}>
                                                        {c.name} [Gold]
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="mb-2">
                                        <strong>Default Mineral</strong>
                                    </label>
                                    <select
                                        onChange={(e) => setmineral(e.target.value)}
                                        value={mineral}
                                        className="form-control"
                                    >
                                        {access === '3ts' || access === 'both' ? (
                                            <>
                                                <option value="Tin">Tin</option>
                                                <option value="Tantalum">Tantalum</option>
                                                <option value="Wolframite">Wolframite</option>
                                            </>
                                        ) : (
                                            <option value="Gold">Gold</option>
                                        )}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="text-center mt-2">
                            <small>
                                An auto-generated password will be sent to the user's email
                                shortly. Please ensure a smooth onboarding experience by
                                monitoring the process. Contact support if you have any
                                questions or concerns.
                            </small>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            disabled={loading}
                            className="btn btn-outline-danger"
                            onClick={() => setadd(false)}
                        >
                            Dismiss
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={createUser}
                            className="btn btn-primary"
                        >
                            {loading ? 'Please wait...' : 'Create User'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Edit User Modal ───────────────────────────────────────────── */}
            <Modal
                show={!!edit}
                className="modal fade"
                id="editModal"
                onHide={() => setedit(null)}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Update User Details</h3>
                        <Button
                            variant=""
                            type="button"
                            disabled={loading}
                            className="close"
                            onClick={() => setedit(null)}
                        >
                            <span>×</span>
                        </Button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>First Name</strong>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                disabled={loading}
                                placeholder="Name"
                                onChange={(e) => setname(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>Last Name</strong>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={surname}
                                placeholder="Surname"
                                onChange={(e) => setsurname(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>Email</strong>
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                placeholder="Email Address"
                                onChange={(e) => setemail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="mb-2">
                                <strong>Dashboard Access</strong>
                            </label>
                            <select
                                onChange={(e) => setaccess(e.target.value)}
                                value={access}
                                className="form-control"
                            >
                                <option value="3ts">3Ts</option>
                                <option value="gold">Gold</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            disabled={loading}
                            className="btn btn-outline-danger"
                            onClick={() => setedit(null)}
                        >
                            Dismiss
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={updateUser}
                            className="btn btn-primary"
                        >
                            {loading ? 'Please wait...' : 'Update User'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
            <Modal
                show={!!remove}
                className="modal fade"
                id="deleteModal"
                onHide={() => setremove(null)}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            Are you sure you want to delete this user?
                        </h5>
                        <Button
                            variant=""
                            type="button"
                            className="close"
                            onClick={() => setremove(null)}
                        >
                            <span>×</span>
                        </Button>
                    </div>
                    <div className="modal-body">
                        <p>
                            Deleting this user will remove all their data and access
                            permanently. This action cannot be undone.
                        </p>
                        <p className="rounded border" style={{ color: 'white', padding: 15, fontSize: 14 }}>
                            Name: {remove?.name} {remove?.surname}
                            <br />
                            Email: {remove?.email}
                            <br />
                            Role: {remove?.type}
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeUser}
                        >
                            Yes, delete user
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => setremove(null)}
                        >
                            No, dismiss
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Suspend/Activate Confirmation Modal ──────────────────────── */}
            <Modal
                show={!!userstatus}
                className="modal fade"
                id="statusModal"
                onHide={() => setuserstatus(null)}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            Are you sure you want to{' '}
                            {userstatus?.status === 'suspended' ? 'activate' : 'suspend'} this
                            user?
                        </h5>
                        <Button
                            variant=""
                            type="button"
                            className="close"
                            onClick={() => setuserstatus(null)}
                        >
                            <span>×</span>
                        </Button>
                    </div>
                    <div className="modal-body">
                        <p className="rounded border" style={{ color: 'white', padding: 15, fontSize: 14 }}>
                            Name: {userstatus?.name} {userstatus?.surname}
                            <br />
                            Email: {userstatus?.email}
                            <br />
                            Current Status: {userstatus?.status}
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => setuserstatus(null)}
                        >
                            No, dismiss
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={changeStatus}
                        >
                            Yes, {userstatus?.status === 'suspended' ? 'activate' : 'suspend'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Main Table Card ───────────────────────────────────────────── */}
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Users List</h4>
                            {platform === 'dashboard' && (
                                <Link onClick={() => setadd(true)} className="btn btn-primary">
                                    Add User
                                </Link>
                            )}
                        </div>
                        <div className="card-body">
                            <div className="table-responsive ticket-table">
                                <div id="ticket_wrapper" className="dataTables_wrapper no-footer">
                                    <div className="d-flex justify-content-between mb-3 custom-tab-list">
                                        <div className="d-flex align-items-center">
                                            <label className="me-2">Show</label>
                                            <Dropdown className="search-drop">
                                                <Dropdown.Toggle>{sort}</Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    {[10, 25, 50, 75, 100].map((n) => (
                                                        <Dropdown.Item
                                                            key={n}
                                                            onClick={() => {
                                                                onClick(0);
                                                                setsort(n);
                                                            }}
                                                        >
                                                            {n}
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <label className="ms-2">entries</label>
                                        </div>
                                        <div className="col-3 d-flex align-items-center">
                                            <label className="me-2">Search:</label>
                                            <input
                                                type="search"
                                                onInput={filter}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <table
                                        id="example"
                                        className="display dataTablesCard table-responsive-xl dataTable no-footer w-100"
                                    >
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Access</th>
                                                <th>User Type</th>
                                                {platform === 'dashboard' && <th>Creation Date</th>}
                                                {platform === 'dashboard' && <th>Last Login</th>}
                                                {platform === 'dashboard' && <th>Status</th>}
                                                {platform === 'dashboard' && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7}>
                                                        <center>
                                                            <Spinner
                                                                size="lg"
                                                                style={{ margin: 15 }}
                                                                role="status"
                                                                variant="primary"
                                                            >
                                                                <span className="visually-hidden">
                                                                    Loading...
                                                                </span>
                                                            </Spinner>
                                                        </center>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginate(filtered).map((item) => (
                                                    <tr key={item?.uid}>
                                                        <td>
                                                            <div>
                                                                <Link to="#" className="h5">
                                                                    {item.name} {item?.surname}
                                                                </Link>
                                                            </div>
                                                            <small className="fs-12 text-muted">
                                                                {item.email}
                                                            </small>
                                                        </td>
                                                        <td className="align-items-center capitalize">
                                                            {item.access || 'Not Set'}
                                                        </td>
                                                        <td>{item.type || item.role}</td>
                                                        {platform === 'dashboard' && (
                                                            <td>
                                                                <span className="badge light badge-success">
                                                                    {item.created
                                                                        ? new Date(item.created).toLocaleString()
                                                                        : '—'}
                                                                </span>
                                                            </td>
                                                        )}
                                                        {platform === 'dashboard' && (
                                                            <td>
                                                                <span className="badge light badge-warning">
                                                                    {item.lastLogin
                                                                        ? new Date(item.lastLogin).toLocaleString()
                                                                        : 'Never'}
                                                                </span>
                                                            </td>
                                                        )}
                                                        {platform === 'dashboard' && (
                                                            <td>
                                                                {item.status === 'active' ? (
                                                                    <span className="badge badge-success">
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge badge-danger">
                                                                        Suspended
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                        {platform === 'dashboard' && (
                                                            <td>
                                                                <div className="d-flex">
                                                                    <Link
                                                                        to="#"
                                                                        className="btn btn-primary shadow btn-xs sharp me-2"
                                                                        onClick={() => {
                                                                            setname(item?.name);
                                                                            setsurname(item?.surname);
                                                                            setaccess(item?.access);
                                                                            setemail(item?.email);
                                                                            setedit(item);
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-pencil-alt"></i>
                                                                    </Link>
                                                                    {/* ── Safe user?.uid — never crashes if user is null ── */}
                                                                    {item.uid !== user?.uid && (
                                                                        <Link
                                                                            to="#"
                                                                            className="btn btn-warning shadow btn-xs sharp me-2"
                                                                            onClick={() => setuserstatus(item)}
                                                                        >
                                                                            <i className="fas fa-user-edit"></i>
                                                                        </Link>
                                                                    )}
                                                                    {item.uid !== user?.uid && (
                                                                        <Link
                                                                            to="#"
                                                                            className="btn btn-danger shadow btn-xs sharp"
                                                                            onClick={() => setremove(item)}
                                                                        >
                                                                            <i className="fa fa-trash"></i>
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    {/* ── Pagination footer ─────────────────────────────────── */}
                                    <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
                                        <div className="dataTables_info">
                                            Showing {filtered.length === 0 ? 0 : activePag.current * sort + 1} to{' '}
                                            {filtered.length > (activePag.current + 1) * sort
                                                ? (activePag.current + 1) * sort
                                                : filtered.length}{' '}
                                            of {filtered.length} entries
                                        </div>
                                        <div
                                            className="dataTables_paginate paging_simple_numbers mb-0"
                                            id="example2_paginate"
                                        >
                                            <Link
                                                className="paginate_button previous"
                                                to="#"
                                                onClick={() => {
                                                    if (activePag.current > 0)
                                                        onClick(activePag.current - 1);
                                                }}
                                            >
                                                Previous
                                            </Link>
                                            <span>
                                                {paggination(filtered).map((page, i) => (
                                                    <Link
                                                        key={i}
                                                        className={`paginate_button ${
                                                            activePag.current === i ? 'current' : ''
                                                        }`}
                                                        to="#"
                                                        onClick={() => onClick(i)}
                                                    >
                                                        {page}
                                                    </Link>
                                                ))}
                                            </span>
                                            <Link
                                                className="paginate_button next"
                                                to="#"
                                                onClick={() => {
                                                    if (
                                                        activePag.current + 1 <
                                                        paggination(filtered).length
                                                    )
                                                        onClick(activePag.current + 1);
                                                }}
                                            >
                                                Next
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Users;