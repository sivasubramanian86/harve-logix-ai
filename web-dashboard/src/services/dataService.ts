import axios from 'axios';

export interface MetricTrend {
  metric: string;
  change: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface RagStatus {
  docsIndexed: number;
  lastQueryLatencyMs: number;
  lastSources: string[];
}

export interface McpStatus {
  activeWorkflows: number;
  pendingTasks: number;
  lastEvent: string;
}

export interface OverviewMetrics {
  farmersOnboarded: number;
  processorsConnected: number;
  wasteReductionRupees: number;
  incomeUpliftPerAcre: number;
  waterSavedLitres: number;
  trends: MetricTrend[];
  timestamp: Date;
  source: 'live' | 'demo';
  ragStatus?: RagStatus;
  mcpStatus?: McpStatus;
}

export interface Farmer {
  id: string;
  name: string;
  location: string;
  crops: string[];
  lastDecisionDate: Date;
  status: 'active' | 'inactive';
  region: string;
}

export interface Decision {
  id: string;
  farmerId: string;
  date: Date;
  recommendation: string;
  outcome: 'positive' | 'neutral' | 'negative';
  impact: string;
}

export interface FarmerDetails {
  farmer: Farmer;
  pastDecisions: Decision[];
  aiInsights: AiInsight[];
}

export interface StateMetric {
  state: string;
  value: number;
  trend: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface GovernmentMetrics {
  wasteReductionByState: StateMetric[];
  incomeUpliftByState: StateMetric[];
  adoptionByState: StateMetric[];
  waterSavingsByState: StateMetric[];
  timestamp: Date;
  source: 'live' | 'demo';
}

export interface SystemHealth {
  agentLatency: number;
  errorRate: number;
  bedrockCallVolume: number;
  eventBridgeStatus: 'healthy' | 'degraded' | 'critical';
  lastUpdated: Date;
  source: 'live' | 'demo';
}

export interface AiInsight {
  type: 'crop_protection' | 'weather' | 'storage' | 'supply' | 'water' | 'quality';
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  impact?: string;
}

export interface FarmerFilters {
  search?: string;
  status?: 'active' | 'inactive';
  region?: string;
}

class DataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 5000,
  });
  private useDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true';

  private getCacheKey(method: string, params?: any): string {
    return `${method}:${JSON.stringify(params || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithFallback<T>(
    method: string,
    endpoint: string,
    params?: any,
    demoData?: T
  ): Promise<T> {
    const cacheKey = this.getCacheKey(method, params);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // If demo mode is enabled, return demo data
    if (this.useDemo && demoData) {
      this.setCache(cacheKey, demoData);
      return demoData;
    }

    try {
      const response = await this.apiClient.get(endpoint, { params });
      const data = response.data;
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      // Fall back to demo data if available
      if (demoData) {
        this.setCache(cacheKey, demoData);
        return demoData;
      }
      throw error;
    }
  }

  async getOverviewMetrics(): Promise<OverviewMetrics> {
    const demoData: OverviewMetrics = {
      farmersOnboarded: 15234,
      processorsConnected: 342,
      wasteReductionRupees: 4567890,
      incomeUpliftPerAcre: 2345,
      waterSavedLitres: 123456789,
      trends: [
        { metric: 'farmers', change: 12.5, direction: 'up' },
        { metric: 'processors', change: 8.3, direction: 'up' },
        { metric: 'waste', change: 15.7, direction: 'up' },
        { metric: 'income', change: 10.2, direction: 'up' },
        { metric: 'water', change: 18.9, direction: 'up' },
      ],
      timestamp: new Date(),
      source: this.useDemo ? 'demo' : 'live',
      ragStatus: {
        docsIndexed: 7,
        lastQueryLatencyMs: 60,
        lastSources: ['demo-knowledge'],
      },
      mcpStatus: {
        activeWorkflows: 0,
        pendingTasks: 0,
        lastEvent: 'none',
      },
    };

    return this.fetchWithFallback('getOverviewMetrics', '/metrics/overview', undefined, demoData);
  }

  async getFarmers(filters?: FarmerFilters): Promise<Farmer[]> {
    const demoData: Farmer[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        location: 'Punjab',
        crops: ['Wheat', 'Rice'],
        lastDecisionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        region: 'North',
      },
      {
        id: '2',
        name: 'Priya Singh',
        location: 'Maharashtra',
        crops: ['Cotton', 'Sugarcane'],
        lastDecisionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'active',
        region: 'West',
      },
      {
        id: '3',
        name: 'Arjun Patel',
        location: 'Gujarat',
        crops: ['Groundnut', 'Sesame'],
        lastDecisionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        region: 'West',
      },
    ];

    return this.fetchWithFallback('getFarmers', '/farmers', filters, demoData);
  }

  async getFarmerDetails(farmerId: string): Promise<FarmerDetails> {
    const demoData: FarmerDetails = {
      farmer: {
        id: farmerId,
        name: 'Rajesh Kumar',
        location: 'Punjab',
        crops: ['Wheat', 'Rice'],
        lastDecisionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        region: 'North',
      },
      pastDecisions: [
        {
          id: 'd1',
          farmerId,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          recommendation: 'Harvest wheat in 3 days for optimal yield',
          outcome: 'positive',
          impact: 'Increased yield by 12%',
        },
        {
          id: 'd2',
          farmerId,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          recommendation: 'Apply pest control treatment',
          outcome: 'positive',
          impact: 'Reduced pest damage by 25%',
        },
      ],
      aiInsights: [
        {
          type: 'crop_protection',
          title: 'Crop Protection Alert',
          description: 'Monitor for early blight in wheat',
          confidence: 'high',
          impact: 'Prevent 30% crop loss',
        },
        {
          type: 'weather',
          title: 'Weather-Aware Harvesting',
          description: 'Optimal harvest window: next 5 days',
          confidence: 'high',
          impact: 'Maximize grain quality',
        },
      ],
    };

    return this.fetchWithFallback('getFarmerDetails', `/farmers/${farmerId}`, undefined, demoData);
  }

  async getGovernmentMetrics(): Promise<GovernmentMetrics> {
    const demoData: GovernmentMetrics = {
      wasteReductionByState: [
        { state: 'Punjab', value: 2500000, trend: 15.5, direction: 'up' },
        { state: 'Maharashtra', value: 1800000, trend: 12.3, direction: 'up' },
        { state: 'Gujarat', value: 1200000, trend: 8.7, direction: 'up' },
        { state: 'Karnataka', value: 950000, trend: 10.2, direction: 'up' },
      ],
      incomeUpliftByState: [
        { state: 'Punjab', value: 3500, trend: 18.5, direction: 'up' },
        { state: 'Maharashtra', value: 2800, trend: 14.2, direction: 'up' },
        { state: 'Gujarat', value: 2200, trend: 11.3, direction: 'up' },
        { state: 'Karnataka', value: 1900, trend: 9.8, direction: 'up' },
      ],
      adoptionByState: [
        { state: 'Punjab', value: 65, trend: 5.2, direction: 'up' },
        { state: 'Maharashtra', value: 52, trend: 3.8, direction: 'up' },
        { state: 'Gujarat', value: 48, trend: 2.1, direction: 'up' },
        { state: 'Karnataka', value: 42, trend: 1.5, direction: 'up' },
      ],
      waterSavingsByState: [
        { state: 'Punjab', value: 45000000, trend: 22.3, direction: 'up' },
        { state: 'Maharashtra', value: 32000000, trend: 18.7, direction: 'up' },
        { state: 'Gujarat', value: 28000000, trend: 15.4, direction: 'up' },
        { state: 'Karnataka', value: 22000000, trend: 12.1, direction: 'up' },
      ],
      timestamp: new Date(),
      source: this.useDemo ? 'demo' : 'live',
    };

    return this.fetchWithFallback('getGovernmentMetrics', '/metrics/government', undefined, demoData);
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const demoData: SystemHealth = {
      agentLatency: 245,
      errorRate: 0.8,
      bedrockCallVolume: 15234,
      eventBridgeStatus: 'healthy',
      lastUpdated: new Date(),
      source: this.useDemo ? 'demo' : 'live',
    };

    return this.fetchWithFallback('getSystemHealth', '/health/system', undefined, demoData);
  }

  async getAiInsightsForFarmer(farmerId: string): Promise<AiInsight[]> {
    const demoData: AiInsight[] = [
      {
        type: 'crop_protection',
        title: 'Crop Protection',
        description: 'Monitor for early blight in wheat',
        confidence: 'high',
        impact: 'Prevent 30% crop loss',
      },
      {
        type: 'weather',
        title: 'Weather-Aware Harvesting',
        description: 'Optimal harvest window: next 5 days',
        confidence: 'high',
        impact: 'Maximize grain quality',
      },
      {
        type: 'storage',
        title: 'Storage Risk',
        description: 'Store in cool, dry location',
        confidence: 'medium',
        impact: 'Reduce storage losses by 15%',
      },
      {
        type: 'supply',
        title: 'Supply/Demand Matching',
        description: 'High demand for wheat in region',
        confidence: 'high',
        impact: 'Get 10% premium price',
      },
      {
        type: 'water',
        title: 'Water Optimization',
        description: 'Reduce irrigation by 20%',
        confidence: 'medium',
        impact: 'Save 50,000 liters water',
      },
      {
        type: 'quality',
        title: 'Quality Premiums',
        description: 'Organic certification available',
        confidence: 'low',
        impact: 'Increase income by 25%',
      },
    ];

    return this.fetchWithFallback('getAiInsightsForFarmer', `/insights/farmer/${farmerId}`, undefined, demoData);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default new DataService();
