import React, { useEffect, useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { useI18n } from '../context/I18nProvider';
import DataBadge from '../components/DataBadge';
import AiInsightsPanel from '../components/AiInsightsPanel';
import AiLoadingOverlay from '../components/AiLoadingOverlay';
import dataService from '../services/dataService';

export default function FarmersUpgraded() {
  const { t } = useI18n();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('live');

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const data = await dataService.getFarmers();
        setFarmers(data);
        setFilteredFarmers(data);
        setDataSource(data[0]?.source || 'live');
        setError(null);
      } catch (err) {
        console.error('Failed to fetch farmers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  useEffect(() => {
    const filtered = farmers.filter((farmer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        farmer.name.toLowerCase().includes(searchLower) ||
        farmer.location.toLowerCase().includes(searchLower)
      );
    });
    setFilteredFarmers(filtered);
  }, [searchTerm, farmers]);

  const handleFarmerClick = async (farmer) => {
    setSelectedFarmer(farmer);
    try {
      setDetailsLoading(true);
      // Fetch both details and insights in parallel
      const [details, insightsData] = await Promise.all([
        dataService.getFarmerDetails(farmer.id),
        dataService.getAiInsightsForFarmer(farmer.id)
      ]);
      
      // Merge insights and recommendations into details
      setFarmerDetails({
        ...details,
        aiInsights: insightsData.insights,
        recommendations: insightsData.recommendations,
        wowFeatures: insightsData.wowFeatures
      });
    } catch (err) {
      console.error('Failed to fetch farmer details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getOutcomeColor = (outcome) => {
    if (outcome === 'positive') return 'text-green-600';
    if (outcome === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div
        className="p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div
      className="p-8 space-y-6"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <AiLoadingOverlay isVisible={detailsLoading} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('farmers.title')}</h1>
        <DataBadge mode={dataSource} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farmers List */}
        <div className="lg:col-span-1">
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-primary)',
            }}
          >
            {/* Search Bar */}
            <div className="mb-4 relative">
              <Search
                size={18}
                className="absolute left-3 top-3"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                type="text"
                placeholder={t('farmers.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              />
            </div>

            {/* Farmers List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFarmers.length > 0 ? (
                filteredFarmers.map((farmer) => (
                  <button
                    key={farmer.id}
                    onClick={() => handleFarmerClick(farmer)}
                    className="w-full text-left p-3 rounded-lg border transition-all hover:shadow-md"
                    style={{
                      backgroundColor:
                        selectedFarmer?.id === farmer.id
                          ? 'var(--bg-secondary)'
                          : 'var(--bg-primary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <p className="font-semibold text-sm">{farmer.name}</p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {farmer.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          farmer.status
                        )}`}
                      >
                        {farmer.status === 'active'
                          ? t('farmers.active')
                          : t('farmers.inactive')}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>{t('common.noData')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Farmer Details */}
        <div className="lg:col-span-2">
          {selectedFarmer && farmerDetails ? (
            <div className="space-y-6">
              {/* Profile Section */}
              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{farmerDetails.farmer.name}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {farmerDetails.farmer.location} • {farmerDetails.farmer.region}
                    </p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${getStatusColor(
                      farmerDetails.farmer.status
                    )}`}
                  >
                    {farmerDetails.farmer.status === 'active'
                      ? t('farmers.active')
                      : t('farmers.inactive')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t('farmers.crops')}
                    </p>
                    <p className="font-semibold">
                      {farmerDetails.farmer.crops.join(', ')}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t('farmers.lastDecision')}
                    </p>
                    <p className="font-semibold">
                      {new Date(
                        farmerDetails.farmer.lastDecisionDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Past Decisions */}
              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <h3 className="text-lg font-bold mb-4">{t('farmers.pastDecisions')}</h3>
                <div className="space-y-3">
                  {farmerDetails.pastDecisions.length > 0 ? (
                    farmerDetails.pastDecisions.map((decision) => (
                      <div
                        key={decision.id}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-primary)',
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">
                            {decision.recommendation}
                          </p>
                          <span
                            className={`text-xs font-medium ${getOutcomeColor(
                              decision.outcome
                            )}`}
                          >
                            {decision.outcome === 'positive'
                              ? `✓ ${t('farmers.outcomes.positive')}`
                              : decision.outcome === 'negative'
                              ? `✗ ${t('farmers.outcomes.negative')}`
                              : `→ ${t('farmers.outcomes.neutral')}`}
                          </span>
                        </div>
                        <p
                          className="text-xs mb-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {new Date(decision.date).toLocaleDateString()}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--color-success)' }}
                        >
                          {decision.impact}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {t('common.noData')}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              {farmerDetails.aiInsights && (
                <AiInsightsPanel
                  insights={farmerDetails.aiInsights}
                  recommendations={farmerDetails.recommendations}
                  wowFeatures={farmerDetails.wowFeatures}
                  isLoading={detailsLoading}
                />
              )}
            </div>
          ) : (
            <div
              className="p-6 rounded-lg border text-center"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <p style={{ color: 'var(--text-secondary)' }}>
                {t('common.noData')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
