import './index.css'
import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { Loader2, Clock, Car, ArrowUpDown, MapPin } from 'lucide-react';
import { jsPDF } from "jspdf";

const CommuteAnalysis = () => {
    type AlternateRoute = {
        name: string;
        diff: number;
      };

    type Suggestion = {
        name: string;
        lat: string;
        lon: string;
    };

    const [selectedTime, setSelectedTime] = useState('8am');
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
    const GAS_PRICE_PER_GALLON = 5.50;
    const AVERAGE_MPG = 25;
    const timeSlots = [
        '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
        '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM',
      ];

      const offices = [
        'Activision Blizzard',
        'Amazon Studios',
        'Apple',
        'Bank of America',
        'BCG',
        'Beyond Meat',
        'BlackRock',
        'Blizzard Entertainment',
        'Bloomberg',
        'Buzzfeed',
        'Capital Group',
        'CBRE Group',
        'CBS',
        'Creative Artists Agency',
        'Deloitte',
        'Disney',
        'DoorDash',
        'Epson',
        'EY',
        'Farmers Insurance',
        'Fox Corporation',
        'Goldman Sachs',
        'Google',
        'Goop',
        'HBO',
        'Honey',
        'Hulu',
        'ICM Partners',
        'Impossible Foods',
        'JPMorgan Chase',
        'KPMG',
        'LegalZoom',
        'Live Nation',
        'Los Angeles Times',
        'Lyft',
        'McKinsey & Company',
        'Meta',
        'Morgan Stanley',
        'NBC Universal',
        'Netflix',
        'Nike',
        'Oracle',
        'Paramount Pictures',
        'PayPal',
        'Peacock',
        'PwC',
        'Qualcomm',
        'Riot Games',
        'Robinhood',
        'Rolling Stone',
        'ServiceTitan',
        'Snap Inc',
        'Sony Pictures',
        'SpaceX',
        'Spotify',
        'Square',
        'Stripe',
        'TechStyle Fashion Group',
        'Tesla',
        'TikTok',
        'Twitter',
        'Uber',
        'United Talent Agency',
        'Universal Music Group',
        'Universal Studios',
        'Warner Bros',
        'Warner Music Group',
        'Wells Fargo',
        'William Morris Endeavor',
        'Yahoo',
        'YouTube',
        'ZipRecruiter',
        'Other',
    ];
    
    const officeCoords = {
        'Activision Blizzard': [34.0167, -118.4412],
        'Amazon Studios': [34.0186, -118.3965],
        'Apple': [34.1577, -118.3331],
        'Bank of America': [34.0505, -118.2545],
        'BCG': [34.0496, -118.2540],
        'Beyond Meat': [34.0183, -118.4944],
        'BlackRock': [34.0515, -118.2545],
        'Blizzard Entertainment': [33.9333, -118.2834],
        'Bloomberg': [34.0511, -118.2547],
        'Buzzfeed': [34.0183, -118.4944],
        'Capital Group': [34.0486, -118.2540],
        'CBRE Group': [34.0508, -118.2565],
        'CBS': [34.0867, -118.3214],
        'Creative Artists Agency': [34.0673, -118.3760],
        'Deloitte': [34.0484, -118.2571],
        'Disney': [34.1558, -118.3239],
        'DoorDash': [34.0183, -118.4944],
        'Epson': [33.8316, -118.3519],
        'EY': [34.0522, -118.2537],
        'Farmers Insurance': [34.0520, -118.2591],
        'Fox Corporation': [34.0258, -118.4554],
        'Goldman Sachs': [34.0511, -118.2547],
        'Google': [33.9757, -118.4199],
        'Goop': [34.0258, -118.4654],
        'HBO': [34.0183, -118.3944],
        'Honey': [34.0447, -118.2587],
        'Hulu': [34.0183, -118.3672],
        'ICM Partners': [34.0674, -118.3748],
        'Impossible Foods': [34.0183, -118.4944],
        'JPMorgan Chase': [34.0520, -118.2541],
        'KPMG': [34.0516, -118.2547],
        'LegalZoom': [34.0169, -118.4951],
        'Live Nation': [34.0905, -118.3768],
        'Los Angeles Times': [34.0522, -118.2437],
        'Lyft': [34.0183, -118.4944],
        'McKinsey & Company': [34.0505, -118.2545],
        'Meta': [33.9767, -118.4229],
        'Morgan Stanley': [34.0508, -118.2546],
        'NBC Universal': [34.1383, -118.3528],
        'Netflix': [34.0827, -118.3265],
        'Nike': [34.0183, -118.4944],
        'Oracle': [34.0522, -118.2437],
        'Paramount Pictures': [34.0854, -118.3213],
        'PayPal': [34.0183, -118.4944],
        'Peacock': [34.1383, -118.3528],
        'PwC': [34.0505, -118.2545],
        'Qualcomm': [34.0183, -118.4944],
        'Riot Games': [34.0267, -118.4011],
        'Robinhood': [34.0183, -118.4944],
        'Rolling Stone': [34.0183, -118.4944],
        'ServiceTitan': [34.1475, -118.2572],
        'Snap Inc': [33.9959, -118.4777],
        'Sony Pictures': [34.0175, -118.4017],
        'SpaceX': [33.9207, -118.3278],
        'Spotify': [34.0183, -118.4944],
        'Square': [34.0183, -118.4944],
        'Stripe': [34.0183, -118.4944],
        'TechStyle Fashion Group': [34.0183, -118.4944],
        'Tesla': [33.9207, -118.3278],
        'TikTok': [34.0819, -118.3267],
        'Twitter': [34.0183, -118.4944],
        'Uber': [34.0183, -118.4944],
        'United Talent Agency': [34.0613, -118.3978],
        'Universal Music Group': [34.0183, -118.3672],
        'Universal Studios': [34.1381, -118.3534],
        'Warner Bros': [34.1522, -118.3370],
        'Warner Music Group': [34.0697, -118.4034],
        'Wells Fargo': [34.0516, -118.2543],
        'William Morris Endeavor': [34.0671, -118.3773],
        'Yahoo': [34.0183, -118.4944],
        'YouTube': [33.9757, -118.4199],
        'ZipRecruiter': [34.0183, -118.4944],
    };
    
    const officeAddresses = {
        'Activision Blizzard': '2701 Olympic Blvd, Santa Monica, CA 90404',
        'Amazon Studios': '9336 W Washington Blvd, Culver City, CA 90232',
        'Apple': '8600 Hayden Place, Culver City, CA 90232',
        'Bank of America': '333 S Hope St, Los Angeles, CA 90071',
        'BCG': '515 S Flower St, Los Angeles, CA 90071',
        'Beyond Meat': '119 Standard St, El Segundo, CA 90245',
        'BlackRock': '400 Howard St, San Francisco, CA 94105',
        'Blizzard Entertainment': '3100 Ocean Park Blvd, Santa Monica, CA 90405',
        'Bloomberg': '2029 Century Park E, Los Angeles, CA 90067',
        'Buzzfeed': '6430 Sunset Blvd, Los Angeles, CA 90028',
        'Capital Group': '333 S Hope St, Los Angeles, CA 90071',
        'CBRE Group': '400 S Hope St #500, Los Angeles, CA 90071',
        'CBS': '7800 Beverly Blvd, Los Angeles, CA 90036',
        'Creative Artists Agency': '2000 Avenue of the Stars, Los Angeles, CA 90067',
        'Deloitte': '555 W 5th St, Los Angeles, CA 90013',
        'Disney': '500 S Buena Vista St, Burbank, CA 91521',
        'DoorDash': '8687 Melrose Ave, West Hollywood, CA 90069',
        'Epson': '3131 Katella Ave, Los Alamitos, CA 90720',
        'EY': '725 S Figueroa St, Los Angeles, CA 90017',
        'Farmers Insurance': '6301 Owensmouth Ave, Woodland Hills, CA 91367',
        'Fox Corporation': '10201 W Pico Blvd, Los Angeles, CA 90064',
        'Goldman Sachs': '2121 Avenue of the Stars, Los Angeles, CA 90067',
        'Google': '340 Main St, Los Angeles, CA 90291',
        'Goop': '3025 Olympic Blvd, Santa Monica, CA 90404',
        'HBO': '2900 W Alameda Ave, Burbank, CA 91505',
        'Honey': '963 E 4th St, Los Angeles, CA 90013',
        'Hulu': '2500 Broadway, Santa Monica, CA 90404',
        'ICM Partners': '10250 Constellation Blvd, Los Angeles, CA 90067',
        'Impossible Foods': '1715 Berkeley St, Santa Monica, CA 90404',
        'JPMorgan Chase': '550 S Hope St, Los Angeles, CA 90071',
        'KPMG': '550 S Hope St #1500, Los Angeles, CA 90071',
        'LegalZoom': '101 N Brand Blvd, Glendale, CA 91203',
        'Live Nation': '9348 Civic Center Dr, Beverly Hills, CA 90210',
        'Los Angeles Times': '2300 E Imperial Hwy, El Segundo, CA 90245',
        'Lyft': '6100 Center Dr, Los Angeles, CA 90045',
        'McKinsey & Company': '400 S Hope St, Los Angeles, CA 90071',
        'Meta': '12777 W Jefferson Blvd, Los Angeles, CA 90066',
        'Morgan Stanley': '2000 Avenue of the Stars, Los Angeles, CA 90067',
        'NBC Universal': '100 Universal City Plaza, Universal City, CA 91608',
        'Netflix': '5808 Sunset Blvd, Los Angeles, CA 90028',
        'Nike': '429 Santa Monica Blvd, Santa Monica, CA 90401',
        'Oracle': '200 N Sepulveda Blvd, El Segundo, CA 90245',
        'Paramount Pictures': '5555 Melrose Ave, Los Angeles, CA 90038',
        'PayPal': '2211 North First Street, San Jose, CA 95131',
        'Peacock': '100 Universal City Plaza, Universal City, CA 91608',
        'PwC': '601 S Figueroa St, Los Angeles, CA 90017',
        'Qualcomm': '5775 Morehouse Dr, San Diego, CA 92121',
        'Riot Games': '12333 W Olympic Blvd, Los Angeles, CA 90064',
        'Robinhood': '3200 Ash St, Palo Alto, CA 94306',
        'Rolling Stone': '475 Fifth Ave, New York, NY 10017',
        'ServiceTitan': '800 N Brand Blvd, Glendale, CA 91203',
        'Snap Inc': '2772 Donald Douglas Loop N, Santa Monica, CA 90405',
        'Sony Pictures': '10202 W Washington Blvd, Culver City, CA 90232',
        'SpaceX': '1 Rocket Rd, Hawthorne, CA 90250',
        'Spotify': '4 World Trade Center, New York, NY 10007',
        'Square': '1455 Market St, San Francisco, CA 94103',
        'Stripe': '185 Berry St, San Francisco, CA 94107',
        'TechStyle Fashion Group': '2301 Rosecrans Ave, El Segundo, CA 90245',
        'Tesla': '3500 Deer Creek Rd, Palo Alto, CA 94304',
        'TikTok': '5800 Bristol Parkway, Culver City, CA 90230',
        'Twitter': '1355 Market St, San Francisco, CA 94103',
        'Uber': '1455 Market St, San Francisco, CA 94103',
        'United Talent Agency': '9336 Civic Center Drive, Beverly Hills, CA 90210',
        'Universal Music Group': '2220 Colorado Ave, Santa Monica, CA 90404',
        'Universal Studios': '100 Universal City Plaza, Universal City, CA 91608',
        'Warner Bros': '4000 Warner Blvd, Burbank, CA 91522',
        'Warner Music Group': '777 S Santa Fe Ave, Los Angeles, CA 90021',
        'Wells Fargo': '333 S Grand Ave, Los Angeles, CA 90071',
        'William Morris Endeavor': '9601 Wilshire Blvd, Beverly Hills, CA 90210',
        'Yahoo': '770 Broadway, New York, NY 10003',
        'YouTube': '12422 W Bluff Creek Dr, Los Angeles, CA 90094',
        'ZipRecruiter': '604 Arizona Ave, Santa Monica, CA 90401'
    };
    
    

    const livingAreas = {
        "Venice": [33.9850, -118.4695],
        "Santa Monica": [34.0195, -118.4912],
        "Playa Del Rey": [33.9537, -118.4489],
        "West Hollywood": [34.0900, -118.3617],
        "Brentwood": [34.0520, -118.4669],
        "Beverly Hills": [34.0736, -118.4004],
        "El Segundo": [33.9192, -118.4164],
        "Manhattan Beach": [33.8847, -118.4109],
        "Mar Vista": [34.0037, -118.4289],
        "Culver City": [34.0211, -118.3965],
        "Newport Beach": [33.6189, -117.9289],
        "Corona Del Mar": [33.6000, -117.8721],
        "Huntington Beach": [33.6595, -118.0010],
        "Torrance": [33.8358, -118.3406],
        "Palos Verdes": [33.7445, -118.3870]
    };

    const neighborhoodStats = {
        "Venice": {
          rent: "$$$",
          safety: "B+",
          amenities: ["Beach", "Restaurants", "Shopping", "Bars"],
          walkability: "A",
          nightlife: "A-",
          zillowLink: "https://www.zillow.com/venice-ca/"
        },
        "Santa Monica": {
          rent: "$$$$",
          safety: "A",
          amenities: ["Parks", "Shopping", "Restaurants", "Clubs"],
          walkability: "A+",
          nightlife: "A",
          zillowLink: "https://www.zillow.com/santa-monica-ca/"
        },
        "Playa Del Rey": {
          rent: "$$",
          safety: "B",
          amenities: ["Parks", "Beach", "Restaurants"],
          walkability: "B+",
          nightlife: "B",
          zillowLink: "https://www.zillow.com/playa-del-rey-ca/"
        },
        "West Hollywood": {
          rent: "$$$",
          safety: "B+",
          amenities: ["Bars", "Shopping", "Clubs"],
          walkability: "A",
          nightlife: "A+",
          zillowLink: "https://www.zillow.com/west-hollywood-ca/"
        },
        "El Segundo": {
          rent: "$$$",
          safety: "A-",
          amenities: ["Parks", "Restaurants", "Shops"],
          walkability: "B+",
          nightlife: "B+",
          zillowLink: "https://www.zillow.com/el-segundo-ca/"
        },
        "Mar Vista": {
          rent: "$$",
          safety: "B",
          amenities: ["Parks", "Restaurants", "Shops"],
          walkability: "B+",
          nightlife: "B",
          zillowLink: "https://www.zillow.com/mar-vista-los-angeles-ca/"
        },
        "Manhattan Beach": {
          rent: "$$$$",
          safety: "A",
          amenities: ["Beach", "Restaurants", "Shopping", "Parks"],
          walkability: "A",
          nightlife: "A",
          zillowLink: "https://www.zillow.com/manhattan-beach-ca/"
        },
        "Brentwood": {
          rent: "$$$$",
          safety: "A",
          amenities: ["Parks", "Restaurants", "Shopping"],
          walkability: "A-",
          nightlife: "B+",
          zillowLink: "https://www.zillow.com/brentwood-los-angeles-ca/"
        },
        "Beverly Hills": {
          rent: "$$$$",
          safety: "A+",
          amenities: ["Shopping", "Restaurants", "Clubs", "Bars"],
          walkability: "A",
          nightlife: "A",
          zillowLink: "https://www.zillow.com/beverly-hills-ca/"
        },
        "Culver City": {
          rent: "$$$",
          safety: "A-",
          amenities: ["Restaurants", "Parks", "Bars", "Shops"],
          walkability: "A-",
          nightlife: "B+",
          zillowLink: "https://www.zillow.com/culver-city-ca/"
        },
        "Newport Beach": {
          rent: "$$$$",
          safety: "A+",
          amenities: ["Beach", "Restaurants", "Shopping", "Boating", "Parks"],
          walkability: "B+",
          nightlife: "A-",
          zillowLink: "https://www.zillow.com/newport-beach-ca/"
      },
      "Corona Del Mar": {
          rent: "$$$$",
          safety: "A+",
          amenities: ["Beach", "Luxury Shopping", "Restaurants", "Parks"],
          walkability: "A-",
          nightlife: "B+",
          zillowLink: "https://www.zillow.com/corona-del-mar-newport-beach-ca/"
      },
      "Huntington Beach": {
          rent: "$$$",
          safety: "A-",
          amenities: ["Beach", "Surfing", "Shopping", "Restaurants", "Parks"],
          walkability: "B+",
          nightlife: "A-",
          zillowLink: "https://www.zillow.com/huntington-beach-ca/"
      },
      "Torrance": {
          rent: "$$$",
          safety: "A-",
          amenities: ["Shopping", "Restaurants", "Parks", "Beach Access"],
          walkability: "B",
          nightlife: "B",
          zillowLink: "https://www.zillow.com/torrance-ca/"
      },
      "Palos Verdes": {
          rent: "$$$$",
          safety: "A+",
          amenities: ["Hiking", "Ocean Views", "Golf", "Parks", "Nature Preserves"],
          walkability: "C+",
          nightlife: "C",
          zillowLink: "https://www.zillow.com/palos-verdes-estates-ca/"
      }
      };
      
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

    // Traffic multipliers for different times
    const peakMultipliers = {
        '7am': 1.4,
        '8am': 1.8,
        '9am': 1.6,
        '10am': 1.3,
        '11am': 1.2,
        '12pm': 1.2,
        '1pm': 1.1,
        '2pm': 1.2,
        '3pm': 1.3,
        '4pm': 1.6,
        '5pm': 1.8,
        '6pm': 1.7
    };

    
    const calculateCommuteCost = (distance) => {
        const roundTripDistance = distance * 2; // Round trip
        const monthlyMiles = roundTripDistance * 20; // Assuming 20 workdays
        const annualMiles = monthlyMiles * 12;
      
        const monthlyCost = ((monthlyMiles / AVERAGE_MPG) * GAS_PRICE_PER_GALLON).toFixed(2);
        const annualCost = ((annualMiles / AVERAGE_MPG) * GAS_PRICE_PER_GALLON).toFixed(2);
      
        return { monthly: monthlyCost, annual: annualCost };
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
        label: 'Consider Remote Work! 😅'
        };
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const handleReset = () => {
        setFadeOut(true); // Start fade-out animation
        setTimeout(() => {
          setShowResults(false); // Hide results
          setSelectedTime('8am'); // Reset time to default
          setCustomName('');
          setSelectedOffice('');
          setCustomOfficeAddress('');
          setAddressSuggestions([]);
          setSortOrder('asc');
          setFadeOut(false); // End fade-out animation
        }, 1000); // Wait for fade-out animation to complete
      };

    const generateAlternateRoutes = (area: string, mainRoute: { time: number; distance: number }): AlternateRoute[] => {
        const routes: AlternateRoute[] = [];
        
        // Freeway route
        if (mainRoute.distance > 8) {
        const freewayDiff = Math.round((Math.random() * 10) - 5); // -5 to +5 minutes
        routes.push({
            name: 'Freeway',
            diff: freewayDiff,
        });
        }
    
        // Surface streets
        if (mainRoute.distance < 15) {
        const streetsDiff = Math.round(mainRoute.time * 0.2); // Usually slower
        routes.push({
            name: 'Surface Streets',
            diff: streetsDiff,
        });
        }
    
        // Scenic route
        if (mainRoute.distance > 5) {
        const scenicDiff = Math.round(mainRoute.time * 0.3); // Usually slower
        routes.push({
            name: 'Scenic Route',
            diff: scenicDiff,
        });
        }
    
        return routes;
    };

    const calculateCommuteTime = (area) => {
        if (!selectedOffice || !officeCoords[selectedOffice]) return { time: 0, distance: 0 };
    
        const distance = calculateDistance(
            livingAreas[area][0],
            livingAreas[area][1],
            officeCoords[selectedOffice][0],
            officeCoords[selectedOffice][1]
        );
    
        // Base speed logic
        let baseSpeed = 30; // mph (you can adjust these numbers)
        if (distance < 5) baseSpeed = 25; // Shorter distance, slower speeds
        else if (distance < 10) baseSpeed = 30;
        else if (distance < 20) baseSpeed = 35;
        else baseSpeed = 40; // Longer distance, faster speeds
    
        // Calculate time with traffic multipliers
        const baseTime = (distance / baseSpeed) * 60; // Convert to minutes
        const timeMultiplier = peakMultipliers[selectedTime] || 1.2;
        const dayMultiplier = selectedDay === 'weekday' ? 1 : 0.7;
    
        const finalTime = Math.round(baseTime * timeMultiplier * dayMultiplier);
    
        return {
            time: finalTime,
            distance: Math.round(distance * 10) / 10
        };
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
        const areas = Object.keys(livingAreas);
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
        addText(`Analysis Time: ${selectedTime}`, 11, black, false, 0, false);
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

    const handleShare = () => {
        navigator.clipboard.writeText(
          `Check out my commute analysis! Key insights: Work Destination: ${
            selectedOffice || customOfficeAddress
          }, Time: ${selectedTime}, Day Type: ${selectedDay}`
        );
        alert('Analysis shared! Link copied to clipboard.');
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
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
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
                  Showing estimated travel times for {selectedDay === 'weekday' ? 'a weekday' : 'the weekend'} at {selectedTime}
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
                        <span>Best before {selectedTime}</span>
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