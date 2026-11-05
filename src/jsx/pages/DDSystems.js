import React, { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { ListGroup } from "react-bootstrap"
import { translations } from "./DDSystemstranslation"

const DDSystems = ({language, country}) => {
    const { changeTitle } = useContext(ThemeContext)
    const user = JSON.parse(localStorage.getItem(`_authUsr`))
    
    const t = (key) => {
        if (!translations[language]) {
            console.warn(`Translation for language "${language}" not found`);
            return key;
        }
        return translations[language][key] || key;
    };

    const systems = {
        kyc: {
            title: 'KYCForm',
            url: '/assets/dd-systems/2023.02.21. Minexx KYC Form.pdf',
        },
        grievance: {
            title: 'PlatformGrievanceMechanisms',
            url: '/assets/dd-systems/2023.02.21. Minexx Platform Grievance Mechanism.pdf',
        },
        'traceability-guide': {
            title: 'TraceabilityGuidefor3TGOperators',
            url: '/assets/dd-systems/2023.02.21. Minexx Traceability Guide For 3TG.pdf',
        },
        'risk-management': {
            title: 'RiskManagementPlan',
            url: '/assets/dd-systems/2023.02.21. Risk Management Plan.pdf',
        },
        'shipment-conformance': {
            title: 'ShipmentConformanceNotice',
            url: '/assets/dd-systems/2023.02.21. Shipment Conformance Notice.pdf',
        },
        'code-of-conduct': {
            title: 'SupplierCodeofConduct',
            url: '/assets/dd-systems/2023.02.21. Supplier Code of Conduct.pdf',
        },
        'operator-onboarding': {
            title: 'OperatorOnboarding',
            url: '/assets/dd-systems/Flyer_Operator Onboarding to Minexx Platform.pdf',
        },
        asm: {
            title: 'KnowYourCounterpartForm',
            url: '/assets/dd-systems/Minexx Model_Know Your Counterpart_KYC Form_ASM.pdf',
        },
        'trace-due-diligence': {
            title: 'TraceDueDiligenceProgrammeIntroduction',
            url: '/assets/dd-systems/Minexx Trace Due Diligence Programme Introduction.pdf',
        },
        'internal-supplement-rw': {
            title: 'RwandaInternalSupplement',
            url: '/assets/dd-systems/Rwanda-Internal-Supplement2.pdf',
        },
    }

    // Libya-specific knowledge base with only 3 documents
    const libyaKnowledgeBase = [
        {
            title: 'KYCForm',
            to: 'kyc',
        },
        {
            title: 'PlatformGrievanceMechanisms',
            to: 'grievance',
        },
        {
            title: 'SupplierCodeofConduct',
            to: 'code-of-conduct',
        }
    ];

    // Standard knowledge base for buyers/investors
    const buyerKnowledgeBase = [
        {
            title: 'KYCForm',
            to: 'kyc',
        },
        {
            title: 'PlatformGrievanceMechanisms',
            to: 'grievance',
        },
        {
            title: 'TraceabilityGuidefor3TGOperators',
            to: 'traceability-guide',
        },
        {
            title: 'SupplierCodeofConduct',
            to: 'code-of-conduct',
        },
        // {
        //     title: 'RwandaInternalSupplement',
        //     to: 'internal-supplement-rw',
        // }
    ];
      const buyerKnowledgeBaseDrc = [
        {
            title: 'KYCForm',
            to: 'kyc',
        },
        {
            title: 'PlatformGrievanceMechanisms',
            to: 'grievance',
        },
        {
            title: 'TraceabilityGuidefor3TGOperators',
            to: 'traceability-guide',
        },
        {
            title: 'SupplierCodeofConduct',
            to: 'code-of-conduct',
        },
        
    ];
    
    // Standard knowledge base for other user types
    const standardKnowledgeBase = [
        {
            title: 'KYCForm',
            to: 'kyc',
        },
        {
            title: 'PlatformGrievanceMechanisms',
            to: 'grievance',
        },
        {
            title: 'TraceabilityGuidefor3TGOperators',
            to: 'traceability-guide',
        },
        {
            title: 'RiskManagementPlan',
            to: 'risk-management',
        },
        {
            title: 'ShipmentConformanceNotice',
            to: 'shipment-conformance',
        },
        {
            title: 'SupplierCodeofConduct',
            to: 'code-of-conduct',
        },
        {
            title: 'OperatorOnboarding',
            to: 'operator-onboarding',
        },
        {
            title: 'KnowYourCounterpartForm',
            to: 'asm',
        },
        {
            title: 'TraceDueDiligenceProgrammeIntroduction',
            to: 'trace-due-diligence',
        },
        // {
        //     title: 'RwandaInternalSupplement',
        //     to: 'internal-supplement-rw',
        // }
    ];

    // Determine which knowledge base to use
    let knowledgeBase;
    if (country === 'Libya') {
        
        knowledgeBase = libyaKnowledgeBase;
    } else if (user.type === 'buyer' || user.type === 'investor') {
        knowledgeBase = buyerKnowledgeBase;
    }
    else if (user.type === 'buyers_drc' || user.type === 'investor_drc') {
        knowledgeBase = buyerKnowledgeBaseDrc;
    }
     else { 
        knowledgeBase = standardKnowledgeBase;
    }

    const [content, setcontent] = useState(`kyc`)

    useEffect(() => {
        changeTitle(`${t(systems[content]?.title)} | Minexx`)
    }, [content, language, country])

    return(
        <>
            <div className="page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"/"}>{t('Dashboard')}</Link></li>
                    <li className="breadcrumb-item active"><Link to={"#"}>{t('KnowledgeBase')}</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}>{t(systems[content]?.title)}</Link></li>
                </ol>
            </div>
            <div className="row">
                <div className="col-xl-3">
                    <ListGroup className="mb-4" id="list-tab">
                        {knowledgeBase.map((item, i) => 
                            <ListGroup.Item 
                                key={i} 
                                onClick={() => setcontent(item.to)} 
                                action 
                                href={`#${item.to}`}
                            >
                                {t(item.title)}
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </div>
                <div className="col-xl-9">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">{t(systems[content]?.title)}</h4>
                            <a 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn btn-sm btn-primary justify-right" 
                                href={systems[content]?.url}
                            >
                                {t('Download')}
                            </a>
                        </div>
                        <div className="card-body">
                            <iframe 
                                style={{ minHeight: 750, width: '100%' }} 
                                title={t(systems[content]?.title)}
                                theme={{ theme: 'dark'}}
                                src={systems[content]?.url} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DDSystems;