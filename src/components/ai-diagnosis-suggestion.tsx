/**
 * AI Diagnosis Suggestion Component
 * Provides intelligent diagnosis suggestions based on entered symptoms
 * Integrates Python ML predictions into the Medical Records form
 */

'use client'

import { useState } from 'react'
import { getAIDiagnosisSuggestions } from '@/app/dashboard/ai-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'

interface AIDiagnosisSuggestionProps {
    symptoms: string[]
    onSuggestionSelect: (diagnosis: string) => void
    disabled?: boolean
}

export function AIDiagnosisSuggestion({
    symptoms,
    onSuggestionSelect,
    disabled = false
}: AIDiagnosisSuggestionProps) {
    const [loading, setLoading] = useState(false)
    const [suggestion, setSuggestion] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleGetSuggestion = async () => {
        if (symptoms.length === 0) {
            setError('Please enter at least one symptom')
            return
        }

        setLoading(true)
        setError(null)
        setSuggestion(null)

        try {
            const result = await getAIDiagnosisSuggestions(symptoms)
            
            if (result.error) {
                setError(result.error)
            } else if (result.success) {
                setSuggestion(result.data)
            }
        } catch (err) {
            setError('Failed to get AI suggestion. Check if Python service is running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            <Button
                type="button"
                onClick={handleGetSuggestion}
                disabled={disabled || loading || symptoms.length === 0}
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-300/50 hover:border-blue-400"
            >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? 'Analyzing symptoms...' : 'Get AI Diagnosis Suggestion'}
            </Button>

            {error && (
                <Card className="p-3 bg-red-50 border-red-200">
                    <div className="flex gap-2 text-sm text-red-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">{error}</p>
                            {error.includes('Python service') && (
                                <p className="text-xs text-red-700 mt-1">
                                    Run: <code className="bg-red-100 px-1 rounded text-xs">python python/app.py</code>
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {suggestion && (
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="space-y-3">
                        {/* Suggested Diagnosis */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-semibold text-slate-600 uppercase">
                                    AI Suggestion
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-900">
                                {suggestion.suggestedDiagnosis}
                            </p>
                        </div>

                        {/* Metrics Row */}
                        <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                                Confidence: {suggestion.confidence}%
                            </Badge>
                            <Badge 
                                variant="secondary"
                                className={`${
                                    suggestion.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                                    suggestion.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                    suggestion.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                    'bg-green-100 text-green-800 border-green-300'
                                }`}
                            >
                                {suggestion.severity.charAt(0).toUpperCase() + suggestion.severity.slice(1)} Severity
                            </Badge>
                        </div>

                        {/* Matching Symptoms */}
                        <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2">Matching Symptoms:</p>
                            <div className="flex flex-wrap gap-1">
                                {suggestion.symptoms.map((symptom: string) => (
                                    <Badge key={symptom} variant="outline" className="bg-white text-slate-700">
                                        {symptom}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {suggestion.recommendations.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-600 mb-2">Recommendations:</p>
                                <ul className="text-sm space-y-1 text-slate-700">
                                    {suggestion.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="flex gap-2">
                                            <span className="text-emerald-600">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Follow-up */}
                        <p className="text-xs text-slate-600 bg-white/50 p-2 rounded border border-slate-200">
                            Follow-up consultation recommended in <span className="font-bold">{suggestion.followUpDays} days</span>
                        </p>

                        {/* Accept Button */}
                        <Button
                            type="button"
                            onClick={() => {
                                onSuggestionSelect(suggestion.suggestedDiagnosis)
                                setSuggestion(null)
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                        >
                            Use This Diagnosis
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
