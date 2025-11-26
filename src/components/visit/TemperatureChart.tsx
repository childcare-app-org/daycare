"use client"

import { useTranslations } from 'next-intl';
import * as React from 'react';
import {
    Area, AreaChart, CartesianGrid, Dot, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { Card, CardContent } from '~/components/ui/card';

import type { RouterOutputs } from "~/utils/api"

type Log = RouterOutputs['visit']['getByIdForParent']['logs'][number]

interface TemperatureChartProps {
    logs: Log[]
}

export function TemperatureChart({ logs }: TemperatureChartProps) {
    const t = useTranslations();
    // Extract temperature readings from logs
    const temperatureData = React.useMemo(() => {
        return logs
            .filter((log) => {
                const eventData = log.eventData as { temperature?: number }
                return eventData?.temperature !== undefined && eventData.temperature !== null
            })
            .map((log) => {
                const eventData = log.eventData as { temperature?: number }
                const timestamp = new Date(log.timestamp)
                return {
                    time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    temperature: eventData.temperature,
                    fullTime: timestamp,
                }
            })
            .sort((a, b) => a.fullTime.getTime() - b.fullTime.getTime())
    }, [logs])

    if (temperatureData.length === 0) {
        return (
            <Card className="bg-white">
                <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('visit.temperature')}</h2>
                    <div className="flex h-[200px] items-center justify-center text-sm text-gray-500">
                        {t('visit.noTemperatureReadings')}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate min and max for Y-axis with some padding
    const temperatures = temperatureData.map((d) => d.temperature).filter(x => x !== undefined);
    const minTemp = Math.min(...temperatures)
    const maxTemp = Math.max(...temperatures)
    const padding = 0.5
    const yAxisMin = Math.max(0, Math.floor(minTemp - padding))
    const yAxisMax = Math.ceil(maxTemp + padding)

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border bg-white/95 backdrop-blur-sm p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-900">
                        {payload[0]?.payload?.fullTime?.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                    <p className="text-lg font-semibold text-purple-600">
                        {payload[0]?.value?.toFixed(1)}°C
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom dot component for data points
    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        return (
            <Dot
                cx={cx}
                cy={cy}
                r={4}
                fill="#7c3aed"
                stroke="#fff"
                strokeWidth={2}
                className="drop-shadow-sm"
            />
        );
    };

    return (
        <Card className="bg-white">
            <CardContent >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('visit.temperature')}</h2>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                        data={temperatureData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="strokeTemperature" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="time"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            tickMargin={8}
                        />
                        <YAxis
                            domain={[yAxisMin, yAxisMax]}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={false}
                            tickLine={{ stroke: '#e5e7eb' }}
                            tickMargin={8}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="temperature"
                            stroke="url(#strokeTemperature)"
                            strokeWidth={3}
                            fill="url(#colorTemperature)"
                            dot={<CustomDot />}
                            activeDot={{
                                r: 6,
                                fill: '#7c3aed',
                                stroke: '#fff',
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

