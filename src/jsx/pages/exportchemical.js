import React, { useState, useEffect, useContext } from "react";
import { Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeContext } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/AxiosInstance';
import { Logout } from '../../store/actions/AuthActions';
import { useNavigate } from 'react-router-dom';
import { translations } from './Reportstranslation';
import axios from 'axios';
import { Bar } from "recharts";


const Exportchemical = ({ language, country }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { changeTitle } = useContext(ThemeContext);

    // State Management
    const [chemicalComposition, setChemicalComposition] = useState([]);
    const [appliedChemicalComposition, setAppliedChemicalComposition] = useState([]);
    const [mineral, setmineral] = useState();
    const [salesPage, setsalesPage] = useState(1);
    const [rangeapplied, setRangeApplied] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get user info and access
    const access = localStorage.getItem(`_dash`) || '3ts';
    const user = JSON.parse(localStorage.getItem(`_authUsr`));
    const  token = localStorage.getItem(`_authRfrsh`); 

    // Translation function
    const t = (key) => {
        if (!translations[language]) {
            return key;
        }
        return translations[language][key] || key;
    };

    // Pagination helper
    function paginate(array, page_number, page_size) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    // ── CSV Export ─────────────────────────────────────────────────────
    const exportToCSV = (rows, headers, filename) => {
        if (!rows || rows.length === 0) {
            toast.warn('No data to export.');
            return;
        }
        const escape = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return s.includes(',') || s.includes('"') || s.includes('\n')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };
        const csvContent = [
            headers.map(escape).join(','),
            ...rows.map(row => headers.map(h => escape(row[h])).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportChemical = () => {
        const data = rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || []);
        const rows = data.map(c => ({
            'Export ID': c.export_id,
            'SN %': c.sn_percent || '-',
            'Moisture %': c.moisture_percent || '-',
            'U3O8 %': c.u3o8_percent || '-',
            'ThO2 %': c.tho2_percent || '-',
            'SiO2 %': c.sio2_percent || '-',
            'MgO %': c.mgo_percent || '-',
            'P2O5 %': c.p2o5_percent || '-',
            'SO3 %': c.so3_percent || '-',
            'CL %': c.cl_percent || '-',
            'K2O %': c.k2o_percent || '-',
            'TiO2 %': c.tio2_percent || '-',
            'Cr2O3 %': c.cr2o3_percent || '-',
            'MnO %': c.mno_percent || '-',
            'Fe2O3 %': c.fe2o3_percent || '-',
            'CuO %': c.cuo_percent || '-',
            'ZnO %': c.zno_percent || c.zn_percent || '-',
            'ZrO2 %': c.zro2_percent || '-',
            'Nb2O5 %': c.nb2o5_percent || '-',
            'Ta2O5 %': c.ta2o5_percent || c.ta_percent || '-',
            'Al2O3 %': c.al2o3_percent || c.ai2o3_percent || '-',
            'Na2O %': c.na2o_percent || '-',
            'CaO %': c.cao_percent || '-',
            'Rb2O %': c.rb2o_percent || '-',
            'SrO %': c.sro_percent || '-',
            'Y2O3 %': c.y2o3_percent || '-',
            'CeO2 %': c.ceo2_percent || '-',
            'SnO2 %': c.sno2_percent || '-',
            'I %': c.i_percent || '-',
            'PbO %': c.pbo_percent || '-',
            'HfO2 %': c.hfo2_percent || c.hso2_percent || '-',
            'BaO %': c.bao_percent || '-',
            'As %': c.as_percent || '-',
            'Bi %': c.bi_percent || '-',
            'Pb %': c.ph_percent || '-',
            'Fe %': c.fe_percent || '-',
            'WO3 %': c.wo_percent || c.wo3_percent || '-',
            'Sb %': c.sb_percent || '-',
            'Cu %': c.cu_percent || '-',
            'Ag %': c.ag_percent || '-',
            'Co %': c.co_percent || '-',
            'Ni %': c.ni_percent || '-',
            'Mn %': c.mn_percent || '-',
            'Bal %': c.bal_percent || '-',
            'Ti %': c.ti_percent || '-',
        }));
        const headers = [
            'Export ID', 'SN %', 'Moisture %', 'U3O8 %', 'ThO2 %', 'SiO2 %', 'MgO %', 'P2O5 %',
            'SO3 %', 'CL %', 'K2O %', 'TiO2 %', 'Cr2O3 %', 'MnO %', 'Fe2O3 %', 'CuO %', 'ZnO %',
            'ZrO2 %', 'Nb2O5 %', 'Ta2O5 %', 'Al2O3 %', 'Na2O %', 'CaO %', 'Rb2O %', 'SrO %',
            'Y2O3 %', 'CeO2 %', 'SnO2 %', 'I %', 'PbO %', 'HfO2 %', 'BaO %', 'As %', 'Bi %',
            'Pb %', 'Fe %', 'WO3 %', 'Sb %', 'Cu %', 'Ag %', 'Co %', 'Ni %', 'Mn %', 'Bal %', 'Ti %'
        ];
        exportToCSV(rows, headers, `chemical_composition_${mineral}`);
    };
    // ────────────────────────────────────────────────────────────────────

    // Change mineral handler
    const changeMineral = (e) => {
        const selectedMineral = e.target.value;
        setmineral(selectedMineral);
        setsalesPage(1);
        setRangeApplied(false);
    };

    // Load chemical composition data
    const loadChemicalComposition = async (selectedMineral) => {
        if (!selectedMineral) return;

        setLoading(true);
        let normalizedCountry = country.trim();

        if (normalizedCountry.toLowerCase() === 'rwanda') {
            normalizedCountry = '.Rwanda';
        } else {
            normalizedCountry = normalizedCountry.replace(/^\.+|\.+$/g, '');
        }

        try {
            const response = await axios.get(`https://minexxapi-livescreen-p7n5ing2cq-uc.a.run.app/chemicalcomposition`, {
                params: {
                    country: normalizedCountry,
                    mineral: selectedMineral
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.chemicalComposition) {
                console.log("Chemical Composition Data:", response.data.chemicalComposition.data);
                setChemicalComposition(response.data.chemicalComposition.data || []);
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 403) {
                    dispatch(Logout(navigate));
                } else {
                    toast.warn(err.response.data.message || "Failed to load composition data");
                }
            } else {
                toast.error(err.message || "An error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    // Load data on mineral change
    useEffect(() => {
        if (mineral) {
            loadChemicalComposition(mineral);
        }
    }, [mineral, country, language]);

    return (
        <div>


            <div className='row'>
                <div className='col-md-5'>
                    {access === "3ts" ? (
                        // for prevent access of sale report to the gold 
                        <div className='card'>
                            <div className='card-header'>
                                <h5 className='card-title'>{t("SelectMineralsc")}</h5>
                            </div>
                            <div className='card-body'>
                                <select onChange={changeMineral} className='form-control'>
                                    <option>{t("SelectMineralShort")}</option>
                                    {access === '3ts' ? (
                                        <>
                                            {user.type === "buyer" ? (
                                                <option value="Cassiterite">Cassiterite/Tin</option>
                                            ) : (
                                                <>
                                                    <option value="Tin">Cassiterite/Tin</option>
                                                    <option value="Tantalum">Coltan/Tantalum</option>
                                                    <option value="Wolframite">Wolframite</option>
                                                    <option value="Copper-cobalt">Copper-Cobalt</option>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <option value="Gold">Gold</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    ) :
                        (<div></div>
                            //nothing show when it is gold 

                        )}
                </div>

                {mineral && (
                    <>
                        <div className='col-md-4'>
                            <div className='card'>
                                <div className='card-header'>
                                    <h5 className='card-title text-center'>{t("Average Grade")}</h5>
                                </div>
                                <div className='card-body'>
                                    <h3 className='text-center text-primary fs-40'>
                                        {(() => {
                                            const currentData = paginate(
                                                rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || []),
                                                salesPage,
                                                20
                                            );

                                            if (currentData.length === 0) {
                                                return 'No Data Available';
                                            }

                                            // Filter out items with valid numeric grades
                                            const validGrades = currentData
                                                .map(item => item.Grade)
                                                .filter(grade => grade !== null && grade !== undefined && grade !== '-' && !isNaN(parseFloat(grade)))
                                                .map(grade => parseFloat(grade));

                                            if (validGrades.length === 0) {
                                                return 'No Valid Grades Available';
                                            }

                                            // Calculate average
                                            const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;

                                            // Return formatted average (rounded to 2 decimal places)
                                            return average.toFixed(2);
                                        })()}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        {/* <div className="col-md-3">
                                               <div className="card">
                                                   <div className="card-header">
                                                       <h5 className="card-title text-center mb-0">{t('Viewby')}</h5>
                                                   </div>
                                                   <div className="card-body">
                                                       <form onSubmit={applyFilter}> 
                                                           <div className="row mb-3">
                                                               <div className="col-6 ps-2 pe-1">
                                                                   <input type="date" name="start" className="form-control form-control-sm" defaultValue="2023-01-01" />
                                                               </div>
                                                               <div className="col-6 ps-1 pe-2">
                                                                   <input type="date" name="end" className="form-control form-control-sm"   defaultValue={new Date().toISOString().split('T')[0]} />
                                                               </div>
                                                           </div>
                                                           <input type="hidden" name="mineral" value={mineral} />
                                                           <div className="d-grid">
                                                               <button className="btn btn-primary btn-sm" disabled={loading}>
                                                               {loading ? 'Loading...' : 'Apply'}
                                                               </button>
                                                           </div>
                                                       </form>
                                                   </div>
                                               </div>
                                           </div> */}
                    </>
                )}
                {mineral && (
                    <div className='card'>
                        <div className='card-header d-flex justify-content-between align-items-center'>
                            <h4 className='card-title mb-0'>{mineral} {t("Supplier Chemical Composition")}</h4>
                            <button
                                className='btn btn-sm btn-success'
                                onClick={handleExportChemical}
                                disabled={loading || (rangeapplied ? appliedChemicalComposition : chemicalComposition).length === 0}
                                title='Export to CSV'
                            >
                                <i className='fa fa-download me-1'></i> Export CSV
                            </button>
                        </div>
                        <div className='card-body'>
                            <div id="soldre-view" className="dataTables_wrapper no-footer">
                                {/* Add horizontal scroll container */}
                                <div style={{ overflowX: 'auto', width: '100%' }}>
                                    <Table bordered striped hover responsive size='sm' style={{ minWidth: '2000px' }}>
                                        <thead>
                                            <tr>

                                                <th>{t("Exportation")}</th>


                                                <th>{t("SN %")}</th>
                                                <th className="text-center text-dark">{t("Moisture %")}</th>
                                                <th className="text-center text-dark">{t("U3O8 %")}</th>
                                                <th className="text-center text-dark">{t("ThO2 %")}</th>
                                                <th className="text-center text-dark">{t("SiO2 %")}</th>
                                                <th className="text-center text-dark">{t("MgO %")}</th>
                                                <th className="text-center text-dark">{t("P2O5 %")}</th>
                                                <th className="text-center text-dark">{t("SO3 %")}</th>
                                                <th className="text-center text-dark">{t("CL %")}</th>
                                                <th className="text-center text-dark">{t("K2O %")}</th>
                                                <th className="text-center text-dark">{t("TIO2 %")}</th>
                                                <th className="text-center text-dark">{t("Cr2O3 %")}</th>
                                                <th className="text-center text-dark">{t("MnO %")}</th>
                                                <th className="text-center text-dark">{t("Fe2O3 %")}</th>
                                                <th className="text-center text-dark">{t("CuO %")}</th>
                                                <th className="text-center text-dark">{t("ZnO %")}</th>
                                                <th className="text-center text-dark">{t("ZrO2 %")}</th>
                                                <th className="text-center text-dark">{t("Nb2O5 %")}</th>
                                                <th className="text-center text-dark">{t("Ta2O5 %")}</th>
                                                <th className="text-center text-dark">{t("Al2O3 %")}</th>
                                                <th className="text-center text-dark">{t("Na2O %")}</th>
                                                <th className="text-center text-dark">{t("CaO %")}</th>
                                                <th className="text-center text-dark">{t("Rb2O %")}</th>
                                                <th className="text-center text-dark">{t("SrO %")}</th>
                                                <th className="text-center text-dark">{t("Y2O3 %")}</th>
                                                <th className="text-center text-dark">{t("CeO2 %")}</th>
                                                <th className="text-center text-dark">{t("SnO2 %")}</th>
                                                <th className="text-center text-dark">{t("I %")}</th>
                                                <th className="text-center text-dark">{t("PbO %")}</th>
                                                <th className="text-center text-dark">{t("HfO2 %")}</th>
                                                <th className="text-center text-dark">{t("BaO %")}</th>
                                                <th className="text-center text-dark">{t("As %")}</th>
                                                <th className="text-center text-dark">{t("Bi %")}</th>
                                                <th className="text-center text-dark">{t("Pb %")}</th>
                                                <th className="text-center text-dark">{t("Fe %")}</th>
                                                <th className="text-center text-dark">{t("WO3 %")}</th>
                                                <th className="text-center text-dark">{t("Sb %")}</th>
                                                <th className="text-center text-dark">{t("Cu %")}</th>
                                                <th className="text-center text-dark">{t("Ag %")}</th>
                                                <th className="text-center text-dark">{t("Co %")}</th>
                                                <th className="text-center text-dark">{t("Ni %")}</th>
                                                <th className="text-center text-dark">{t("Mn %")}</th>
                                                <th className="text-center text-dark">{t("Bal %")}</th>
                                                <th className="text-center text-dark">{t("Ti %")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginate(
                                                rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || []),
                                                salesPage,
                                                20
                                            ).map((composition, i) => (
                                                <tr key={`composition${i}`}>

                                                    <td>{composition.export_id}</td>

                                                    {/* Chemical elements data using API response property names */}
                                                    <td className="text-center">{composition.sn_percent || '-'}</td>
                                                    <td className="text-center">{composition.moisture_percent || '-'}</td>
                                                    <td className="text-center">{composition.u3o8_percent || '-'}</td>
                                                    <td className="text-center">{composition.tho2_percent || '-'}</td>
                                                    <td className="text-center">{composition.sio2_percent || '-'}</td>
                                                    <td className="text-center">{composition.mgo_percent || '-'}</td>
                                                    <td className="text-center">{composition.p2o5_percent || '-'}</td>
                                                    <td className="text-center">{composition.so3_percent || '-'}</td>
                                                    <td className="text-center">{composition.cl_percent || '-'}</td>
                                                    <td className="text-center">{composition.k2o_percent || '-'}</td>
                                                    <td className="text-center">{composition.tio2_percent || '-'}</td>
                                                    <td className="text-center">{composition.cr2o3_percent || '-'}</td>
                                                    <td className="text-center">{composition.mno_percent || '-'}</td>
                                                    <td className="text-center">{composition.fe2o3_percent || '-'}</td>
                                                    <td className="text-center">{composition.cuo_percent || '-'}</td>
                                                    <td className="text-center">{composition.zno_percent || composition.zn_percent}</td>
                                                    <td className="text-center">{composition.zro2_percent || '-'}</td>
                                                    <td className="text-center">{composition.nb2o5_percent || '-'}</td>
                                                    <td className="text-center">{composition.ta2o5_percent || composition.ta_percent}</td>
                                                    <td className="text-center">{composition.al2o3_percent || composition.ai2o3_percent}</td>
                                                    <td className="text-center">{composition.na2o_percent || '-'}</td>
                                                    <td className="text-center">{composition.cao_percent || '-'}</td>
                                                    <td className="text-center">{composition.rb2o_percent || '-'}</td>
                                                    <td className="text-center">{composition.sro_percent || '-'}</td>
                                                    <td className="text-center">{composition.y2o3_percent || '-'}</td>
                                                    <td className="text-center">{composition.ceo2_percent || '-'}</td>
                                                    <td className="text-center">{composition.sno2_percent || '-'}</td>
                                                    <td className="text-center">{composition.i_percent || '-'}</td>
                                                    <td className="text-center">{composition.pbo_percent || '-'}</td>
                                                    <td className="text-center">{composition.hfo2_percent || composition.hso2_percent}</td>
                                                    <td className="text-center">{composition.bao_percent || '-'}</td>
                                                    <td className="text-center">{composition.as_percent || '-'}</td>
                                                    <td className="text-center">{composition.bi_percent || '-'}</td>
                                                    <td className="text-center">{composition.ph_percent || '-'}</td>
                                                    <td className="text-center">{composition.fe_percent || '-'}</td>
                                                    <td className="text-center">{composition.wo_percent || composition.wo3_percent}</td>
                                                    <td className="text-center">{composition.sb_percent || '-'}</td>
                                                    <td className="text-center">{composition.cu_percent || '-'}</td>
                                                    <td className="text-center">{composition.ag_percent || '-'}</td>
                                                    <td className="text-center">{composition.co_percent || '-'}</td>
                                                    <td className="text-center">{composition.ni_percent || '-'}</td>
                                                    <td className="text-center">{composition.mn_percent || '-'}</td>
                                                    <td className="text-center">{composition.bal_percent || '-'}</td>
                                                    <td className="text-center">{composition.ti_percent || '-'}</td>
                                                </tr>
                                            ))}
                                            {(rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || [])).length === 0 ? (
                                                <tr>
                                                    <td colSpan={47}>{t("NoSelectedMinerals")}</td>
                                                </tr>
                                            ) : (
                                                <tr></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                                <div className="d-sm-flex text-center justify-content-between align-items-center mt-3">
                                    <div className="dataTables_info">
                                        {t("Showing")} {(salesPage - 1) * 20 + 1} {t("To")}{" "}
                                        {(rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || [])).length > salesPage * 20
                                            ? salesPage * 20
                                            : (rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || [])).length}{" "}
                                        {t("Of")} {(rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || [])).length} {t("Entries")}
                                    </div>
                                    <div className="dataTables_paginate paging_simple_numbers" id="example2_paginate">
                                        <Link
                                            className="paginate_button previous disabled"
                                            onClick={() => salesPage > 1 && setsalesPage(salesPage - 1)}
                                        >
                                            {t("Previous")}
                                        </Link>
                                        <Link
                                            className="paginate_button next mx-4"
                                            onClick={() => {
                                                const totalData = rangeapplied ? (appliedChemicalComposition || []) : (chemicalComposition || []);
                                                const totalPages = Math.ceil(totalData.length / 20);
                                                if (salesPage < totalPages) {
                                                    setsalesPage(salesPage + 1);
                                                }
                                            }}
                                        >
                                            {t("Next")}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Exportchemical;