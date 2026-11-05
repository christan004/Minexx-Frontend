import React, { useMemo } from 'react';
import Purchase from './Purchase';
import Purchase3ts from './Purchase_3ts';

/**
 * PurchaseWrapper Component
 * Routes to the appropriate purchase page based on access level
 * - 'gold' access: Uses Purchase.js (Togo-specific with trace reports)
 * - '3ts' access: Uses Purchase_3ts.js (DRC-specific with standard purchases)
 */
const PurchaseWrapper = ({ language, country }) => {
    const access = useMemo(() => {
        return localStorage.getItem('_dash') || '3ts';
    }, []);

    // Route to correct component based on access level
    if (access === 'gold') {
        return <Purchase language={language} country={country} />;
    }

    return <Purchase3ts language={language} country={country} />;
};

export default PurchaseWrapper;
