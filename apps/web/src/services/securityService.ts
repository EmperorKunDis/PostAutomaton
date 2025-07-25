import api from './api';

export const securityService = {
  // Security Dashboard
  async getDashboardData(timeRange = '7d') {
    const response = await api.get(`/security/dashboard?timeRange=${timeRange}`);
    return response.data;
  },

  async getSecurityHealth() {
    const response = await api.get('/security/health');
    return response.data;
  },

  async getSecurityStatus() {
    const response = await api.get('/security/status');
    return response.data;
  },

  // Security Events
  async getSecurityEvents(filters?: any) {
    let url = '/security/events';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Security Rules
  async createSecurityRule(ruleData: any) {
    const response = await api.post('/security/rules', ruleData);
    return response.data;
  },

  async getSecurityRules() {
    const response = await api.get('/security/rules');
    return response.data;
  },

  async updateSecurityRule(ruleId: string, updates: any) {
    const response = await api.put(`/security/rules/${ruleId}`, updates);
    return response.data;
  },

  // Security Incidents
  async createSecurityIncident(incidentData: any) {
    const response = await api.post('/security/incidents', incidentData);
    return response.data;
  },

  async getSecurityIncidents(status?: string) {
    let url = '/security/incidents';
    if (status) url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  async updateIncidentStatus(incidentId: string, status: string, resolution?: string) {
    const response = await api.put(`/security/incidents/${incidentId}/status`, {
      status,
      resolution
    });
    return response.data;
  },

  // Anomaly Detection
  async detectAnomalies(timeWindow?: number, userId?: string) {
    let url = '/security/anomalies';
    const params = new URLSearchParams();
    if (timeWindow) params.append('timeWindow', String(timeWindow));
    if (userId) params.append('userId', userId);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Vulnerability Scanning
  async scanVulnerabilities() {
    const response = await api.get('/security/vulnerabilities');
    return response.data;
  },

  // Security Reports
  async generateSecurityReport(startDate: string, endDate: string) {
    const response = await api.post('/security/reports/security', {
      startDate,
      endDate
    });
    return response.data;
  },

  // GDPR Compliance
  async createDataSubjectRequest(requestData: any) {
    const response = await api.post('/security/data-subject-requests', requestData);
    return response.data;
  },

  async getDataSubjectRequests(status?: string) {
    let url = '/security/data-subject-requests';
    if (status) url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  async updateDataSubjectRequest(requestId: string, updates: any) {
    const response = await api.put(`/security/data-subject-requests/${requestId}`, updates);
    return response.data;
  },

  async processDataSubjectRequest(requestId: string) {
    const response = await api.post(`/security/data-subject-requests/${requestId}/process`);
    return response.data;
  },

  // Consent Management
  async recordConsent(consentData: any) {
    const response = await api.post('/security/consent', consentData);
    return response.data;
  },

  async getConsentRecords(dataSubject?: string, status?: string) {
    let url = '/security/consent';
    const params = new URLSearchParams();
    if (dataSubject) params.append('dataSubject', dataSubject);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  async updateConsent(consentId: string, status: string) {
    const response = await api.put(`/security/consent/${consentId}`, { status });
    return response.data;
  },

  // Data Inventory
  async createDataInventory(inventoryData: any) {
    const response = await api.post('/security/data-inventory', inventoryData);
    return response.data;
  },

  async getDataInventory(category?: string) {
    let url = '/security/data-inventory';
    if (category) url += `?category=${category}`;
    const response = await api.get(url);
    return response.data;
  },

  // Compliance Policies
  async createCompliancePolicy(policyData: any) {
    const response = await api.post('/security/policies', policyData);
    return response.data;
  },

  async getCompliancePolicies(framework?: string) {
    let url = '/security/policies';
    if (framework) url += `?framework=${framework}`;
    const response = await api.get(url);
    return response.data;
  },

  async updatePolicyStatus(policyId: string, status: string) {
    const response = await api.put(`/security/policies/${policyId}/status`, { status });
    return response.data;
  },

  // Compliance Reports
  async generateComplianceReport(reportData: any) {
    const response = await api.post('/security/reports/compliance', reportData);
    return response.data;
  },

  async getComplianceReports() {
    const response = await api.get('/security/reports/compliance');
    return response.data;
  },

  // Audit Trail
  async getAuditTrail(filters?: any) {
    let url = '/security/audit-trail';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Content Moderation
  async moderateContent(contentData: any) {
    const response = await api.post('/security/moderation/check', contentData);
    return response.data;
  },

  async bulkModerateContent(bulkData: any) {
    const response = await api.post('/security/moderation/bulk', bulkData);
    return response.data;
  },

  async createModerationRule(ruleData: any) {
    const response = await api.post('/security/moderation/rules', ruleData);
    return response.data;
  },

  async getModerationRules() {
    const response = await api.get('/security/moderation/rules');
    return response.data;
  },

  async updateModerationRule(ruleId: string, updates: any) {
    const response = await api.put(`/security/moderation/rules/${ruleId}`, updates);
    return response.data;
  },

  async getSafetyChecks(entityId?: string, riskLevel?: string) {
    let url = '/security/moderation/checks';
    const params = new URLSearchParams();
    if (entityId) params.append('entityId', entityId);
    if (riskLevel) params.append('riskLevel', riskLevel);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  async getModerationDashboard() {
    const response = await api.get('/security/moderation/dashboard');
    return response.data;
  },

  // Compliance Dashboard
  async getComplianceDashboard() {
    const response = await api.get('/security/compliance/dashboard');
    return response.data;
  },
};