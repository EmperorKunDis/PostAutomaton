import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, X, ThumbsUp, ThumbsDown, Eye, Target, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';

interface OptimizationSuggestion {
  id: string;
  category: 'seo' | 'readability' | 'engagement' | 'performance' | 'accessibility';
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  reasoning: string;
  expectedImpact: {
    metric: string;
    change: number;
    confidence: number;
  };
  implementationEffort: 'low' | 'medium' | 'high';
  status: 'pending' | 'applied' | 'dismissed';
  confidence: number;
}

interface OptimizationPanelProps {
  contentId: string;
  contentType: string;
  content: Record<string, any>;
  onContentUpdate?: (updatedContent: Record<string, any>) => void;
}

export const ContentOptimizationPanel: React.FC<OptimizationPanelProps> = ({
  contentId,
  contentType,
  content,
  onContentUpdate
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (contentId && content) {
      loadOptimizationSuggestions();
    }
  }, [contentId, content]);

  const loadOptimizationSuggestions = async () => {
    try {
      setLoading(true);
      const result = await aiService.optimizeContent({
        entityType: contentType as any,
        entityId: contentId,
        content,
        optimizationGoals: ['engagement', 'seo', 'readability'],
      });

      setSuggestions(result.suggestions);
      setOptimizationScore(result.optimizationScore);
      setInsights(result.insights);
    } catch (error) {
      console.error('Failed to load optimization suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      // Apply the suggestion logic here
      // This would typically modify the content based on the suggestion
      await aiService.applySuggestion(suggestionId);

      // Update suggestion status
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, status: 'applied' } : s
      ));

      // Reload suggestions to get updated score
      await loadOptimizationSuggestions();
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const handleDismissSuggestion = async (suggestionId: string) => {
    try {
      await aiService.dismissSuggestion(suggestionId);
      
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, status: 'dismissed' } : s
      ));
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seo':
        return <Target className="h-4 w-4" />;
      case 'readability':
        return <Eye className="h-4 w-4" />;
      case 'engagement':
        return <TrendingUp className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'accessibility':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const categoryCounts = {
    all: suggestions.length,
    seo: suggestions.filter(s => s.category === 'seo').length,
    readability: suggestions.filter(s => s.category === 'readability').length,
    engagement: suggestions.filter(s => s.category === 'engagement').length,
    performance: suggestions.filter(s => s.category === 'performance').length,
    accessibility: suggestions.filter(s => s.category === 'accessibility').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Optimization Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Content Optimization
            </CardTitle>
            <Button onClick={loadOptimizationSuggestions} variant="outline" size="sm">
              Refresh Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Optimization Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(optimizationScore)}`}>
                {optimizationScore}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {suggestions.filter(s => s.status === 'pending').length} improvements available
              </p>
              <Progress value={optimizationScore} className="h-2 w-32" />
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({categoryCounts.all})</TabsTrigger>
              <TabsTrigger value="seo">SEO ({categoryCounts.seo})</TabsTrigger>
              <TabsTrigger value="readability">Readability ({categoryCounts.readability})</TabsTrigger>
              <TabsTrigger value="engagement">Engagement ({categoryCounts.engagement})</TabsTrigger>
              <TabsTrigger value="performance">Performance ({categoryCounts.performance})</TabsTrigger>
              <TabsTrigger value="accessibility">A11y ({categoryCounts.accessibility})</TabsTrigger>
            </TabsList>

            <div className="mt-4 space-y-4">
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No optimization suggestions for this category</p>
                </div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(suggestion.category)}
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <Badge className={getEffortColor(suggestion.implementationEffort)}>
                            {suggestion.implementationEffort} effort
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-green-600">
                          +{suggestion.expectedImpact.change}% {suggestion.expectedImpact.metric}
                        </p>
                        <p className="text-gray-500">
                          {(suggestion.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>

                    {/* Suggestion Details */}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">Suggestion:</p>
                      <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                    </div>

                    {/* Reasoning */}
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Why this helps:</p>
                      <p>{suggestion.reasoning}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Expected impact: {suggestion.expectedImpact.change}% improvement in {suggestion.expectedImpact.metric}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {suggestion.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDismissSuggestion(suggestion.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApplySuggestion(suggestion.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Apply
                            </Button>
                          </>
                        )}
                        {suggestion.status === 'applied' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                        {suggestion.status === 'dismissed' && (
                          <Badge className="bg-gray-100 text-gray-800">
                            <X className="h-3 w-3 mr-1" />
                            Dismissed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};