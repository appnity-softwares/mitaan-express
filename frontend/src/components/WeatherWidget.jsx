import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

const WeatherWidget = ({ language }) => {
    // Mock weather data - in real app would fetch from API
    const weather = {
        temp: 28,
        condition: 'Sunny',
        location: 'New Delhi',
        humidity: 45,
        wind: 12
    };

    return (
        <div className="bg-gradient-to-br from-[#00adef] to-[#007db3] p-6 rounded-3xl text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                            {language === 'hi' ? 'मौसम अपडेट' : 'Weather'}
                        </span>
                        <h3 className="text-lg font-bold">{weather.location}</h3>
                    </div>
                    <Sun size={32} className="text-yellow-300 animate-spin-slow" />
                </div>

                <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-black tracking-tighter">{weather.temp}°</span>
                    <span className="text-lg font-medium opacity-80 mb-2">C</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                    <div className="flex items-center gap-2">
                        <CloudRain size={16} className="opacity-70" />
                        <span className="text-xs font-bold">{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind size={16} className="opacity-70" />
                        <span className="text-xs font-bold">{weather.wind} km/h</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
