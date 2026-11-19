import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../services/AxiosInstance';
// import { baseURL_ } from '../../../config';

function LiveScreenCard({ language, country, access,user }) {
  const [exportData, setExportData] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseURL_="https://minexxapi-togo-clone-p7n5ing2cq-uc.a.run.app/"

  const t = (key) => {
    const translations = {
      en: {
        'totalExportsTillDate': 'TOTAL EXPORTS TILL DATE',
        'totalExportThisMonth': 'TOTAL EXPORT THIS MONTH',
        'totalExportYTD': 'TOTAL EXPORT YTD',
        'currentStock': 'CURRENT STOCK',
        'purchasesThisWeek': 'PURCHASES THIS WEEK',
        'purchasesThisMonth': 'PURCHASES THIS MONTH',
        'purchasesYTD': 'PURCHASES YTD',
        'tonnes': 'tonnes'
      },
      fr: {
        'totalExportsTillDate': 'TOTAL EXPORTS JUSQU\'À PRÉSENT',
        'totalExportThisMonth': 'TOTAL EXPORT CE MOIS',
        'totalExportYTD': 'TOTAL EXPORT YTD',
        'currentStock': 'STOCK ACTUEL',
        'purchasesThisWeek': 'ACHATS CETTE SEMAINE',
        'purchasesThisMonth': 'ACHATS CE MOIS',
        'purchasesYTD': 'ACHATS YTD',
        'tonnes': 'tonnes'
      }
    };
    return (translations[language] || translations['en'])[key] || key;
  };

  // Mineral params based on platform and endpoint
  const getMinerals = (endpoint) => {
    if (access === 'gold') {
      return ['Gold'];
    }
    // 3ts platform
    if (endpoint === 'export') {
      return ['Tin', 'Tantalum'];
    }
    // current stock and purchase
    return ['coltan', 'cassiterite'];
  };
  const normalizeCountry = (country) => {
  let normalized = country.trim();
  if (normalized.toLowerCase() === 'rwanda') {
    normalized = '.Rwanda';
  } else {
    normalized = normalized.replace(/^\.+|\.+$/g, '');
  }
  return normalized;
};
  const buildParams = (endpoint) => {
    const minerals = getMinerals(endpoint);
    const params = new URLSearchParams();
    params.append('country', normalizeCountry(country));
    minerals.forEach(m => params.append('mineral', m));
    return params.toString();
  };

  const getHeaders = () => ({
    'x-platform': access === 'gold' ? 'gold' : '3ts'
  });

  const formatValue = (val) => {
    if (!val && val !== 0) return '$0';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}m`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${val.toFixed(2)}`;
  };

  const formatWeight = (val) => {
    if (!val && val !== 0) return '0 tonnes';
    return `${(val / 1000).toFixed(2)} tonnes`;
  };

  useEffect(() => {
    if (!country || !access) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = getHeaders();

        const [exportRes, stockRes, purchaseRes] = await Promise.all([
          axiosInstance.get(
            `${baseURL_}livescreen/export/metrics?${buildParams('export')}`,
            { headers }
          ),
          axiosInstance.get(
            `${baseURL_}livescreen/containers?${buildParams('stock')}`,
            { headers }
          ),
          axiosInstance.get(
            `${baseURL_}livescreen/purchases?${buildParams('purchase')}`,
            { headers }
          ),
        ]);

        setExportData(exportRes.data.data);
        console.log("ExportData",exportRes);
        setStockData(stockRes.data.data);
        setPurchaseData(purchaseRes.data.data);
      } catch (err) {
        console.error('LiveScreenCard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [country, access,user]);

  const CardItem = ({ title, amount, weight }) => (
    <div className="card live-screen-card">
      <div className="card-body p-3">
        <p className="card-title">{title}</p>
        <div className="card-amount">
          {loading ? (
            <div className="progress w-100" style={{ height: '10px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <>
        {user.type ==='buyer' ||(user.type === 'investor_drc' && user.email === "ali.amine81@gmail.com" )||user.type === "buyer_rwanda" || user.type ==="buyers" ?<span></span>  :  <span className="amount-value">{amount}</span>}
              <span className={
                    user.type === 'buyer' || 
                    (user.type === 'investor_drc' && user.email === "ali.amine81@gmail.com") || 
                    user.type === "buyer_rwanda" || 
                    user.type === "buyers" 
                      ? "amount-label1" 
                      : "amount-label"
                }>
                    {weight}
                </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* First Row - Exports + Current Stock */}
      <div className="row mb-3">
        <div className="col-md-4 col-sm-6 mb-3">
          <CardItem
            title={t('totalExportThisMonth')}
            amount={formatValue(exportData?.thisMonthExport?.value)}
            weight={formatWeight(exportData?.thisMonthExport?.weight)}
          />
        </div>
        <div className="col-md-4 col-sm-6 mb-3">
          <CardItem
            title={t('totalExportYTD')}
            amount={formatValue(exportData?.ytdExport?.value)}
            weight={formatWeight(exportData?.ytdExport?.weight)}
          />
        </div>
        <div className="col-md-4 col-sm-6 mb-3">
          <CardItem
            title={t('currentStock')}
            amount={formatValue(stockData?.total_value)}
            weight={formatWeight(stockData?.total_weight)}
          />
        </div>
      </div>

      {/* Second Row - Purchases */}
      <div className="row">
        <div className="col-md-4 col-sm-6 mb-3">
          <CardItem
            title={t('purchasesThisWeek')}
            amount={formatValue(purchaseData?.thisWeekPurchases?.value)}
            weight={formatWeight(purchaseData?.thisWeekPurchases?.weight)}
          />
        </div>
        <div className="col-md-4 col-sm-6 mb-3">
          <CardItem
            title={t('purchasesThisMonth')}
            amount={formatValue(purchaseData?.thisMonthPurchases?.value)}
            weight={formatWeight(purchaseData?.thisMonthPurchases?.weight)}
          />
        </div>
        <div className="col-md-4 col-sm-6 mb-3">
          <CardItem
            title={t('purchasesYTD')}
            amount={formatValue(purchaseData?.ytdPurchases?.value)}
            weight={formatWeight(purchaseData?.ytdPurchases?.weight)}
          />

          
        </div>
      </div>

      <style jsx>{`
        .live-screen-card {
          border: 1px solid #2a3f5f;
          border-radius: 8px;
          color: white;
          position: relative;
          min-height: auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .live-screen-card:hover {
          border-color: #3d5a8c;
          background: linear-gradient(135deg, #1f2a3a 0%, #121a28 100%);
          transition: all 0.3s ease;
        }
        .card-body {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 12px !important;
        }
        .card-title {
          font-size: 10px;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          margin-top: 0;
          font-weight: 600;
        }
        .card-amount {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }
        .amount-value {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }
        .amount-label {
          font-size: 10px;
          color: #a0aec0;
        }
        .amount-label1 {
          font-size: 18px;
          font-weight: 700;
          color: white;

        }
        @media (max-width: 768px) {
          .amount-value { font-size: 16px; }
          .card-title { font-size: 9px; }
        }
      `}</style>
    </>
  );
}

export default LiveScreenCard;