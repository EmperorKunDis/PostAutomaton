import api from './api';

export const analyticsService = {
  async getDashboardData(period = '30d') {
    const response = await api.get(`/analytics/dashboard?period=${period}`);
    return response.data;
  },

  async getContentMetrics(filters: any) {
    const response = await api.post('/analytics/metrics', filters);
    return response.data;
  },

  async trackMetric(metricData: any) {
    const response = await api.post('/analytics/track', metricData);
    return response.data;
  },

  async getEngagementMetrics(entityType: string, entityId: string, dateRange?: any) {
    let url = `/analytics/engagement/${entityType}/${entityId}`;
    if (dateRange) {
      url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  async getConversionMetrics(entityType?: string, entityId?: string, dateRange?: any) {
    let url = '/analytics/conversions';
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);
    if (dateRange) {
      params.append('startDate', dateRange.start);
      params.append('endDate', dateRange.end);
    }
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  async createABTest(testData: any) {
    const response = await api.post('/analytics/ab-tests', testData);
    return response.data;
  },

  async getABTests(status?: string) {
    let url = '/analytics/ab-tests';
    if (status) url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  async getABTestResults(testId: string) {
    const response = await api.get(`/analytics/ab-tests/${testId}/results`);
    return response.data;
  },

  async startABTest(testId: string) {
    const response = await api.post(`/analytics/ab-tests/${testId}/start`);
    return response.data;
  },

  async stopABTest(testId: string) {
    const response = await api.post(`/analytics/ab-tests/${testId}/stop`);
    return response.data;
  },

  async createAutomatedReport(reportData: any) {
    const response = await api.post('/analytics/reports', reportData);
    return response.data;
  },

  async getAutomatedReports() {
    const response = await api.get('/analytics/reports');
    return response.data;
  },

  async runReport(reportId: string) {
    const response = await api.post(`/analytics/reports/${reportId}/run`);
    return response.data;
  },

  async exportReport(period: string, format: string) {
    const response = await api.post('/analytics/export', { period, format });
    
    // Handle file download
    const blob = new Blob([response.data], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/octet-stream' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${period}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },
};