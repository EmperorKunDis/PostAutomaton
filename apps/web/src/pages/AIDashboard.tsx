import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Bot, Brain, Zap, Target, TrendingUp, AlertCircle, CheckCircle, Clock, Play, Pause, Settings, Upload } from 'lucide-react';
import { aiService } from '../services/aiService';

interface AIDashboardData {
  summary: {
    totalModels: number;
    activeModels: number;
    runningPipelines: number;
    pendingSuggestions: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  models: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    accuracy: number;
    lastTrained: string;
    deployments: number;
  }>;
  pipelines: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    duration: string;
    success_rate: number;
  }>;
  optimizations: Array<{
    id: string;
    contentId: string;
    contentTitle: string;
    score: number;
    suggestions: number;
    potentialImprovement: number;
  }>;
  metrics: {
    modelPerformance: Array<{ date: string; accuracy: number; latency: number }>;
    optimizationImpact: Array<{ category: string; improvement: number }>;
  };
}

export const AIDashboard: React.FC = () => {
  const [data, setData] = useState<AIDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await aiService.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load AI dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = () => {
    // Navigate to model creation
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      await aiService.runPipeline(pipelineId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to run pipeline:', error);
    }
  };

  const handleDeployModel = async (modelId: string) => {
    try {
      await aiService.deployModel(modelId, 'production');
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to deploy model:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'trained':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8">Failed to load AI dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI & ML Dashboard</h1>
          <p className="text-gray-600">Manage models, training pipelines, and content optimization</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreateModel} variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Create Model
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Dataset
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Models</p>
                <p className="text-2xl font-bold">{data.summary.totalModels}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold">{data.summary.activeModels}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Running Pipelines</p>
                <p className="text-2xl font-bold">{data.summary.runningPipelines}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Suggestions</p>
                <p className="text-2xl font-bold">{data.summary.pendingSuggestions}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className={`text-2xl font-bold capitalize ${getHealthColor(data.summary.systemHealth)}`}>
                  {data.summary.systemHealth}
                </p>
              </div>
              {data.summary.systemHealth === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="pipelines">Training Pipelines</TabsTrigger>
          <TabsTrigger value="optimization">Content Optimization</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.models.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{model.name}</h3>
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{model.type}</p>
                      <p className="text-sm text-gray-500">Last trained: {model.lastTrained}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{(model.accuracy * 100).toFixed(1)}%</p>
                        <p className="text-gray-600">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{model.deployments}</p>
                        <p className="text-gray-600">Deployments</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDeployModel(model.id)}
                          disabled={model.status !== 'trained'}
                        >
                          Deploy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{pipeline.name}</h3>
                        <Badge className={getStatusColor(pipeline.status)}>
                          {pipeline.status}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600">Progress:</span>
                          <span className="text-sm font-medium">{pipeline.progress}%</span>
                        </div>
                        <Progress value={pipeline.progress} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{pipeline.duration}</p>
                        <p className="text-gray-600">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{(pipeline.success_rate * 100).toFixed(0)}%</p>
                        <p className="text-gray-600">Success Rate</p>
                      </div>
                      <div className="flex gap-2">
                        {pipeline.status === 'running' ? (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleRunPipeline(pipeline.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.optimizations.map((optimization) => (
                  <div key={optimization.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{optimization.contentTitle}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Optimization Score:</span>
                          <div className="flex items-center gap-1">
                            <Progress value={optimization.score} className="h-2 w-20" />
                            <span className="text-sm font-medium">{optimization.score}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{optimization.suggestions}</p>
                        <p className="text-gray-600">Suggestions</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-600">+{optimization.potentialImprovement}%</p>
                        <p className="text-gray-600">Potential</p>
                      </div>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {/* Model Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.metrics.modelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Accuracy (%)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Latency (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Optimization Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Impact by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.metrics.optimizationImpact}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="improvement" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};