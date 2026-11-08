import './index.css'
import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { Loader2, Clock, Car, ArrowUpDown, MapPin } from 'lucide-react';
import { jsPDF } from "jspdf";
import { NEIGHBORHOODS } from './data/neighborhoods';
import { OFFICES } from './data/offices';
import { commuteCost, estimateCommute } from './lib/commute';
import { HOURS, formatHour } from './lib/time';

const offices = [...OFFICES.map((o) => o.name), 'Other'];
const officeByName = new Map(OFFICES.map((o) => [o.name, o]));
const areaByName = new Map(NEIGHBORHOODS.map((n) => [n.name, n]));
const neighborhoodStats = Object.fromEntries(
    NEIGHBORHOODS.map((n) => [n.name, { ...n, zillowLink: n.zillowUrl }]),
);
const calculateCommuteCost = (miles: number) => {
    const cost = commuteCost(miles);
    return { monthly: cost.monthly.toFixed(2), annual: cost.annual.toFixed(2) };
};

const CommuteAnalysis = () => {

    type Suggestion = {
        name: string;
        lat: string;
        lon: string;
    };

    const [selectedTime, setSelectedTime] = useState(8);
    const [customName, setCustomName] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('');
    const [customOfficeAddress, setCustomOfficeAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<Suggestion[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedDay, setSelectedDay] = useState('weekday');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showPDFConfirm, setShowPDFConfirm] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [fadeOut, setFadeOut] = useState(false); // For reset fade effect
    
          
        
        
    

    
          
      // Render neighborhood stats (to be added at the top of the file with utility functions)
      const renderStats = (area) => {
        const stats = neighborhoodStats[area];
        if (!stats) return null;
      
        return (
          <div className="mt-3 text-sm text-gray-600">
            <div>Average Rent: {stats.rent}</div>
            <div>Safety Rating: {stats.safety}</div>
            <div>Walkability: {stats.walkability}</div>
            <div>Nightlife: {stats.nightlife}</div>
            <div>Key Amenities: {stats.amenities.join(", ")}</div>
            <a
              href={stats.zillowLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline mt-1 inline-block"
            >
              View on Zillow
            </a>
          </div>
        );
      };

    
    
    
      const fetchSuggestions = async (query: string) => {
        if (query.length < 3) return;
    
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Los Angeles')}&bounded=1&viewbox=-118.723549,34.330899,-118.155437,33.704538`
            );
            if (!response.ok) {
                console.error('Error fetching suggestions:', response.statusText);
                return;
            }
            const data: Array<{ display_name: string; lat: string; lon: string }> = await response.json();
    
            // Update address suggestions state
            setAddressSuggestions(
                data.map((item) => ({
                    name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                }))
            );
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const calculateCommuteTime = (area: string) => {
        const office = officeByName.get(selectedOffice);
        const from = areaByName.get(area);
        if (!office || !from) return { time: 0, distance: 0 };
        const estimate = estimateCommute(from, office, selectedTime, selectedDay === 'weekend' ? 'weekend' : 'weekday');
        return { time: estimate.minutes, distance: estimate.miles };
    };

    const getCommuteColor = (minutes) => {
        if (minutes <= 15) return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        hover: 'hover:bg-emerald-100',
        label: 'Super Quick!'
        };
        if (minutes <= 25) return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
        label: 'Quick'
        };
        if (minutes <= 35) return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        label: 'Moderate'
        };
        if (minutes <= 45) return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-100',
        label: 'Long'
        };
        if (minutes <= 60) return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
        label: 'Very Long'
        };
        return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
        label: 'Over an hour'
        };
    };

    
    const handleReset = () => {
        setFadeOut(true); // Start fade-out animation
        setTimeout(() => {
          setShowResults(false); // Hide results
          setSelectedTime(8); // Reset time to default
          setCustomName('');
          setSelectedOffice('');
          setCustomOfficeAddress('');
          setAddressSuggestions([]);
          setSortOrder('asc');
          setFadeOut(false); // End fade-out animation
        }, 1000); // Wait for fade-out animation to complete
      };

    
    
    const handleCalculate = () => {
        setIsCalculating(true);
        setShowResults(false);
        setAddressSuggestions([]);
        
        setTimeout(() => {
        setIsCalculating(false);
        setShowResults(true);
        }, 1500);
    };

    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCustomOfficeAddress(query);
        fetchSuggestions(query);
    };

    const selectSuggestion = (suggestion) => {
        setCustomOfficeAddress(suggestion);
        setAddressSuggestions([]);
    };

    const toggleSort = () => {
        setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    };

    const getSortedAreas = () => {
        const areas = NEIGHBORHOODS.map((n) => n.name);
        if (!showResults) return areas;

        return areas.sort((a, b) => {
        const timeA = calculateCommuteTime(a).time;
        const timeB = calculateCommuteTime(b).time;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });
    };

    const handleExportClick = () => {
        setShowPDFConfirm(true); // Show the confirmation modal
    };

    const confirmExportPDF = () => {
        setShowPDFConfirm(false);
        
        // Initialize PDF
        const doc = new jsPDF('portrait', 'pt', 'a4');
        let currentY = 40;
        const marginLeft = 40;
        const pageWidth = doc.internal.pageSize.width;
        const colWidth = (pageWidth - marginLeft * 3) / 2; // Width for 2 columns
        const dateGenerated = new Date().toLocaleDateString();
        const blue = [33, 150, 243];
        const black = [0, 0, 0];
        
        // Helper function to add text
        const addText = (text, fontSize = 12, color = black, isBold = false, indent = 0, isFirstCol = true) => {
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0], color[1], color[2]);
            doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
            const xPos = isFirstCol ? marginLeft + indent : marginLeft * 2 + colWidth + indent;
            doc.text(text, xPos, currentY);
        };
    
        // Title and Overview Section
        addText('LA Commute Analysis Report', 20, blue, true);
        currentY += 30;
    
        // Two-column header info
        addText(`Generated: ${dateGenerated}`, 11);
        addText(`Analysis Time: ${formatHour(selectedTime)}`, 11, black, false, 0, false);
        currentY += 20;
        
        addText(`User: ${customName || 'N/A'}`, 11);
        addText(`Day: ${selectedDay === 'weekday' ? 'Weekday' : 'Weekend'}`, 11, black, false, 0, false);
        currentY += 20;
        
        addText(`Office: ${selectedOffice || customOfficeAddress}`, 11);
        currentY += 30;
    
        // Top Areas Summary
        addText('Best Neighborhoods by Commute Time', 16, blue, true);
        currentY += 25;
    
        // Create a summary table for top 5 areas
        const sortedAreas = getSortedAreas();
        const headers = ['Area', 'Time', 'Distance', 'Monthly Cost'];
        const colWidths = [160, 80, 100, 120];
        let xOffset = marginLeft;
    
        // Add table headers
        headers.forEach((header, i) => {
            addText(header, 12, black, true, xOffset - marginLeft);
            xOffset += colWidths[i];
        });
        currentY += 20;
    
        // Add table content
        sortedAreas.slice(0, 5).forEach(area => {
            const commute = calculateCommuteTime(area);
            const costs = calculateCommuteCost(commute.distance);
            xOffset = marginLeft;
            
            addText(area, 11, black, false, xOffset - marginLeft);
            xOffset += colWidths[0];
            
            addText(`${commute.time} min`, 11, black, false, xOffset - marginLeft);
            xOffset += colWidths[1];
            
            addText(`${commute.distance} mi`, 11, black, false, xOffset - marginLeft);
            xOffset += colWidths[2];
            
            addText(`$${costs.monthly}`, 11, black, false, xOffset - marginLeft);
            
            currentY += 20;
        });
        currentY += 30;
    
        // Detailed Analysis Section - Two columns
        addText('Detailed Neighborhood Analysis', 16, blue, true);
        currentY += 25;
        const startY = currentY;
        let rightColY = currentY;
    
        // Split areas into two columns
        const midPoint = Math.ceil(sortedAreas.length / 2);
        const firstColAreas = sortedAreas.slice(0, midPoint);
        const secondColAreas = sortedAreas.slice(midPoint);
    
        // First column
        firstColAreas.forEach(area => {
            const commute = calculateCommuteTime(area);
            const stats = neighborhoodStats[area];
            
            addText(area, 12, black, true);
            currentY += 20;
            addText(`${commute.time}min / ${commute.distance}mi`, 11, black, false, 10);
            currentY += 15;
            addText(`Safety: ${stats.safety} • Rent: ${stats.rent}`, 11, black, false, 10);
            currentY += 15;
            addText(`Walk: ${stats.walkability} • Night: ${stats.nightlife}`, 11, black, false, 10);
            currentY += 25;
        });
    
        // Reset Y for second column
        currentY = startY;
    
        // Second column
        secondColAreas.forEach(area => {
            const commute = calculateCommuteTime(area);
            const stats = neighborhoodStats[area];
            
            addText(area, 12, black, true, 0, false);
            currentY += 20;
            addText(`${commute.time}min / ${commute.distance}mi`, 11, black, false, 10, false);
            currentY += 15;
            addText(`Safety: ${stats.safety} • Rent: ${stats.rent}`, 11, black, false, 10, false);
            currentY += 15;
            addText(`Walk: ${stats.walkability} • Night: ${stats.nightlife}`, 11, black, false, 10, false);
            currentY += 25;
        });
    
        // Move to next page for commute costs if needed
        if (currentY > 700) {
            doc.addPage();
            currentY = 40;
        } else {
            currentY += 30;
        }
    
        // Quick stats
        const avgTime = Math.round(
            sortedAreas.reduce((acc, area) => acc + calculateCommuteTime(area).time, 0) / sortedAreas.length
        );
    
        addText('Commute Overview', 16, blue, true);
        currentY += 25;
        addText(`Average Commute Time: ${avgTime} minutes`, 11);
        currentY += 15;
        addText(`Best Commute: ${sortedAreas[0]} (${calculateCommuteTime(sortedAreas[0]).time} min)`, 11);
        currentY += 15;
        addText(`Longest Commute: ${sortedAreas[sortedAreas.length-1]} (${calculateCommuteTime(sortedAreas[sortedAreas.length-1]).time} min)`, 11);
        currentY += 25;
    
        // Footer with disclaimer
        addText('Note: Times based on historical traffic patterns. Actual commute times may vary.', 9, black);
        
        // Save the PDF
        const fileName = `LA_Commute_Analysis_${customName ? customName + '_' : ''}${dateGenerated.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
    };

    



      return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LA Commute Analyzer
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Make informed decisions about where to live based on commute times, neighborhood stats, and lifestyle preferences.
            </p>
          </div>
    
          {/* Main Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
    
            <div>
  <label className="block text-sm font-medium mb-2">Work Destination</label>
  <div className="relative">
    <button 
      onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
      className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left flex justify-between items-center"
    >
      {selectedOffice || "Select company or enter address"}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isDropdownOpen && (
      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
        {offices.map(office => (
          <div
            key={office}
            className="p-2.5 hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              setSelectedOffice(office);
              setIsDropdownOpen(false);
              if(office === 'Other') {
                setCustomOfficeAddress('');
                setAddressSuggestions([]);
              }
            }}
          >
            {office}
          </div>
        ))}
      </div>
    )}
  </div>

  {selectedOffice === 'Other' && (
    <div className="relative mt-2">
      <input
        type="text"
        value={customOfficeAddress}
        onChange={handleAddressInput}
        placeholder="Enter address"
        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {addressSuggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
          {addressSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2.5 hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => selectSuggestion(suggestion.name)}
            >
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
    
            {/* Other input fields */}
            <div>
              <label className="block text-sm font-medium mb-2">Departure Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(Number(e.target.value))}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {HOURS.map(hour => (
                  <option key={hour} value={hour}>{formatHour(hour)}</option>
                ))}
              </select>
            </div>
    
            <div>
              <label className="block text-sm font-medium mb-2">Day Type</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>
          </div>
    
          <div className="text-center mb-8">
            <button
              onClick={handleCalculate}
              disabled={isCalculating || !selectedOffice}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg
                                    hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                                    transform transition-all duration-300 hover:scale-105"
            >
              {isCalculating ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Calculating...
                </span>
              ) : (
                'Calculate Commute Times'
              )}
            </button>
          </div>
    
          {/* Results Section */}
          {showResults && (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-lg md:text-xl text-gray-800">
                  {customName ? `Hi ${customName}! Here` : 'Here'} are your commute times from each neighborhood to your office!
                </h3>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  Showing estimated travel times for {selectedDay === 'weekday' ? 'a weekday' : 'the weekend'} at {formatHour(selectedTime)}
                </p>
              </div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleSort}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  Sort by Time ({sortOrder === 'asc' ? 'Shortest First' : 'Longest First'})
                </button>
              </div>
    
              {/* Results list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSortedAreas().map(area => {
                  const commute = calculateCommuteTime(area);
                  const colors = getCommuteColor(commute.time);
    
                  return (
                    <div
                      key={area}
                      className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${colors.hover}
                        transition-all duration-300 transform hover:scale-105`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{area}</h3>
                        <span className={`text-sm px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {colors.label}
                        </span>
                      </div>
                      <div className={`text-2xl font-bold ${colors.text} mb-2`}>
                        {commute.time} min
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-1" />
                        <span>{commute.distance} miles</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Leaving at {formatHour(selectedTime)}</span>
                      </div>
    
                      {/* Add neighborhood stats */}
                      <div className="mt-3">
                        {renderStats(area)}
                      </div>
    
                      {/* Add commute cost */}
                      <div className="mt-3 text-sm">
                        <div>Monthly Gas Cost: ${calculateCommuteCost(commute.distance).monthly}</div>
                        <div>Annual Gas Cost: ${calculateCommuteCost(commute.distance).annual}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
    
              {/* Buttons Section */}
              <div className={`flex justify-center space-x-4 mt-8 ${showResults ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                <button
                  onClick={handleExportClick}
                  className="bg-blue-500 text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 transform transition-transform duration-300 hover:scale-105 text-sm"
                >
                  Save Results
                </button>
                {/* <button
                  onClick={() => alert('Share functionality coming soon!')}
                  className="bg-green-500 text-white px-4 py-1 rounded-md shadow-md hover:bg-green-600 transform transition-transform duration-300 hover:scale-105 text-sm"
                >
                  Share
                </button> */}
                <button
                  onClick={handleReset}
                  className="bg-red-500 text-white px-4 py-1 rounded-md shadow-md hover:bg-red-600 transform transition-transform duration-300 hover:scale-105 text-sm"
                >
                  Reset
                </button>
              </div>
            </>
          )}
          {showPDFConfirm && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 transition-opacity duration-500">
                    <div className="bg-white p-6 rounded-md shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Your results are ready!</h2>
                        <p className="text-sm mb-4">Do you want to download your PDF now?</p>
                        <div className="flex justify-between">
                            <button
                                onClick={confirmExportPDF}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Yes, download PDF
                            </button>
                            <button
                                onClick={() => setShowPDFConfirm(false)}
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                            >
                                No, cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
    };
    
    ReactDOM.createRoot(document.getElementById('root')!).render(<CommuteAnalysis />);
    
    export default CommuteAnalysis;