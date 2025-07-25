import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, FileText, Users, Clock, Ban, Flag } from 'lucide-react';
import { securityService } from '../services/securityService';

interface SecurityDashboardData {
  summary: {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    totalEvents: number;
    openIncidents: number;
    pendingRequests: number;
    complianceScore: number;
    blockedContent: number;
  };
  recentEvents: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    timestamp: string;
    source?: string;
  }>;
  incidents: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    assignedTo?: string;
    createdAt: string;
  }>;
  complianceRequests: Array<{
    id: string;
    type: string;
    subject: string;
    status: string;
    priority: string;
    dueDate: string;
  }>;
  contentModeration: Array<{
    id: string;
    contentTitle: string;
    action: string;
    riskLevel: string;
    flaggedCategories: string[];
    checkedAt: string;
  }>;
  charts: {
    threatTrends: Array<{ date: string; threats: number; incidents: number }>;
    eventTypes: Array<{ type: string; count: number; color: string }>;
    complianceStatus: Array<{ category: string; compliant: number; issues: number }>;
  };
}

export const SecurityDashboard: React.FC = () => {
  const [data, setData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await securityService.getDashboardData(timeRange);
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load security dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = () => {
    // Navigate to incident creation
  };

  const handleProcessRequest = async (requestId: string) => {
    try {
      await securityService.processDataSubjectRequest(requestId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to process request:', error);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'open':
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8">Failed to load security dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security & Compliance Dashboard</h1>
          <p className="text-gray-600">Monitor security events, compliance status, and content moderation</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateIncident} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className={`col-span-2 ${getThreatLevelColor(data.summary.threatLevel)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Threat Level</p>
                <p className="text-3xl font-bold capitalize">{data.summary.threatLevel}</p>
              </div>
              <Shield className="h-10 w-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold">{data.summary.totalEvents}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold">{data.summary.openIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GDPR Requests</p>
                <p className="text-2xl font-bold">{data.summary.pendingRequests}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Content</p>
                <p className="text-2xl font-bold">{data.summary.blockedContent}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">GDPR Compliance</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Threat Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Security Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.charts.threatTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="threats" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Threats"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="incidents" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    name="Incidents"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Event Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.charts.eventTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {data.charts.eventTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.complianceStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="compliant" fill="#22c55e" name="Compliant" />
                    <Bar dataKey="issues" fill="#ef4444" name="Issues" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <span className="font-medium">{event.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.source && (
                        <span className="text-sm text-gray-500">{event.source}</span>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GDPR Data Subject Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.complianceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <span className="font-medium">{request.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Subject: {request.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">Due: {request.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleProcessRequest(request.id)}
                        disabled={request.status === 'completed'}
                      >
                        {request.status === 'pending' ? 'Process' : 'View'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.contentModeration.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(content.riskLevel)}>
                          {content.riskLevel} risk
                        </Badge>
                        <span className="font-medium">{content.contentTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Action:</span>
                        <Badge className={getStatusColor(content.action)}>
                          {content.action.replace('_', ' ')}
                        </Badge>
                      </div>
                      {content.flaggedCategories.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Flagged for:</span>
                          <div className="flex gap-1">
                            {content.flaggedCategories.map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Checked: {content.checkedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {content.action === 'flag_for_review' && (
                        <Flag className="h-5 w-5 text-yellow-500" />
                      )}
                      {content.action === 'block' && (
                        <Ban className="h-5 w-5 text-red-500" />
                      )}
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.incidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <span className="font-medium">{incident.title}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{incident.createdAt}</span>
                        </div>
                        {incident.assignedTo && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Assigned to {incident.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};