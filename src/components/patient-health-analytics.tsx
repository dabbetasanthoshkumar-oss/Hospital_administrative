/**
 * Patient Health Analytics Widget
 * Shows AI-powered patient health metrics and risk analysis
 */

'use client'

import { useEffect, useState } from 'react'
import { analyzePatientHealth, calculatePatientRisk } from '@/app/dashboard/ai-actions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, Heart, Clock } from 'lucide-react'

interface PatientHealthAnalyticsProps {
    patientId: string
}

export function PatientHealthAnalytics({ patientId }: PatientHealthAnalyticsProps) {
    const [analysis, setAnalysis] = useState<any>(null)
    const [risk, setRisk] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                const [analysisResult, riskResult] = await Promise.all([
                    analyzePatientHealth(patientId),
                    calculatePatientRisk(patientId),
                ])

                if (analysisResult.error) {
                    setError(analysisResult.error)
                } else {
                    setAnalysis(analysisResult.data)
                }

                if (riskResult.success) {
                    setRisk(riskResult.data)
                }
            } catch (err) {
                setError('Failed to load health analytics')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [patientId])

    if (loading) {
        return (
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="h-32 bg-gradient-to-r from-slate-200 to-blue-200 rounded animate-pulse" />
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex gap-2 text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            </Card>
        )
    }

    if (!analysis) return null

    const getRiskColor = (score: number) => {
        if (score < 30) return 'bg-green-100 text-green-800'
        if (score < 60) return 'bg-yellow-100 text-yellow-800'
        return 'bg-red-100 text-red-800'
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Risk Score Card */}
            <Card className={`p-4 ${risk ? getRiskColor(parseFloat(risk.riskScore)) : 'bg-slate-50'}`}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">AI Risk Score</p>
                        <p className="text-2xl font-bold">{risk?.riskScore || '0'}%</p>
                        <p className="text-xs mt-2 opacity-75">
                            {risk?.riskLevel || 'calculating'}
                        </p>
                    </div>
                    <Heart className="w-6 h-6 opacity-50" />
                </div>
            </Card>

            {/* Total Visits Card */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">Total Visits</p>
                        <p className="text-2xl font-bold text-blue-900">{analysis.totalVisits}</p>
                        <p className="text-xs mt-2 opacity-75">
                            {analysis.visitFrequency.toFixed(1)} visits/month
                        </p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
            </Card>

            {/* Diagnoses Card */}
            <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">Unique Diagnoses</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {analysis.uniqueDiagnoses?.length || 0}
                        </p>
                        <p className="text-xs mt-2 opacity-75">
                            Medical history
                        </p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
            </Card>

            {/* Upcoming Card */}
            <Card className="p-4 bg-emerald-50 border-emerald-200">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">This Month</p>
                        <p className="text-2xl font-bold text-emerald-900">
                            {analysis.upcomingAppointments}
                        </p>
                        <p className="text-xs mt-2 opacity-75">
                            Appointments
                        </p>
                    </div>
                    <Clock className="w-6 h-6 text-emerald-600" />
                </div>
            </Card>

            {/* Recommendations */}
            {risk?.recommendations && risk.recommendations.length > 0 && (
                <Card className="p-4 md:col-span-2 lg:col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <p className="text-xs font-semibold text-slate-700 mb-3 uppercase">AI Recommendations</p>
                    <ul className="space-y-2">
                        {risk.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-700 flex gap-2">
                                <span className="text-indigo-600 font-bold">→</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Last Visit */}
            {analysis.lastVisit && (
                <Card className="p-4 bg-slate-50 border-slate-200 md:col-span-2 lg:col-span-4">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Last Visit</p>
                    <p className="text-sm text-slate-700">{analysis.lastVisit}</p>
                </Card>
            )}
        </div>
    )
}
