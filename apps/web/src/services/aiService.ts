import api from './api';

export const aiService = {
  // Model Management
  async createModel(modelData: any) {
    const response = await api.post('/ai/models', modelData);
    return response.data;
  },

  async getModels(type?: string) {
    let url = '/ai/models';
    if (type) url += `?type=${type}`;
    const response = await api.get(url);
    return response.data;
  },

  async getModel(modelId: string) {
    const response = await api.get(`/ai/models/${modelId}`);
    return response.data;
  },

  async updateModel(modelId: string, updates: any) {
    const response = await api.put(`/ai/models/${modelId}`, updates);
    return response.data;
  },

  async deleteModel(modelId: string) {
    const response = await api.delete(`/ai/models/${modelId}`);
    return response.data;
  },

  async deployModel(modelId: string, environment: string) {
    const response = await api.post('/ai/models/deploy', {
      modelId,
      environment,
      versionId: 'latest'
    });
    return response.data;
  },

  async getModelMetrics(modelId: string, dateRange?: any) {
    let url = `/ai/models/${modelId}/metrics`;
    if (dateRange) {
      url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Training Pipelines
  async createPipeline(pipelineData: any) {
    const response = await api.post('/ai/pipelines', pipelineData);
    return response.data;
  },

  async getPipelines() {
    const response = await api.get('/ai/pipelines');
    return response.data;
  },

  async runPipeline(pipelineId: string) {
    const response = await api.post(`/ai/pipelines/${pipelineId}/run`);
    return response.data;
  },

  async getPipelineRuns(pipelineId: string) {
    const response = await api.get(`/ai/pipelines/${pipelineId}/runs`);
    return response.data;
  },

  async stopPipelineRun(runId: string) {
    const response = await api.post(`/ai/pipeline-runs/${runId}/stop`);
    return response.data;
  },

  // Content Optimization
  async optimizeContent(contentData: any) {
    const response = await api.post('/ai/optimize', contentData);
    return response.data;
  },

  async getOptimizationSuggestions(entityType?: string, entityId?: string, status?: string) {
    let url = '/ai/optimization-suggestions';
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  async applySuggestion(suggestionId: string) {
    const response = await api.put(`/ai/optimization-suggestions/${suggestionId}`, {
      status: 'applied'
    });
    return response.data;
  },

  async dismissSuggestion(suggestionId: string) {
    const response = await api.put(`/ai/optimization-suggestions/${suggestionId}`, {
      status: 'dismissed'
    });
    return response.data;
  },

  async getBulkOptimization(entityType: string, limit?: number) {
    let url = `/ai/bulk-optimization?entityType=${entityType}`;
    if (limit) url += `&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  },

  // Dashboard
  async getDashboardData() {
    const response = await api.get('/ai/dashboard');
    return response.data;
  },

  async getSystemHealth() {
    const response = await api.get('/ai/health');
    return response.data;
  },

  // Datasets
  async createDataset(datasetData: any) {
    const response = await api.post('/ai/datasets', datasetData);
    return response.data;
  },

  async getDatasets(type?: string) {
    let url = '/ai/datasets';
    if (type) url += `?type=${type}`;
    const response = await api.get(url);
    return response.data;
  },

  // Features
  async createFeature(featureData: any) {
    const response = await api.post('/ai/features', featureData);
    return response.data;
  },

  async getFeatures(type?: string) {
    let url = '/ai/features';
    if (type) url += `?type=${type}`;
    const response = await api.get(url);
    return response.data;
  },

  // Predictions
  async makePrediction(predictionData: any) {
    const response = await api.post('/ai/predict', predictionData);
    return response.data;
  },

  // Optimization Rules
  async createOptimizationRule(ruleData: any) {
    const response = await api.post('/ai/optimization-rules', ruleData);
    return response.data;
  },

  async getOptimizationRules(category?: string) {
    let url = '/ai/optimization-rules';
    if (category) url += `?category=${category}`;
    const response = await api.get(url);
    return response.data;
  },
};