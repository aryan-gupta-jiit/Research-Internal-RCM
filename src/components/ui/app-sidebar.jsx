import { useState, useEffect, useRef } from "react";
import { Building2, Plus, ChevronDown, Database } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { citiesApi } from "@/services/api";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddCityDialog } from "@/components/AddCityDialog";

const categories = [
    'Accommodation',
    'Activities',
    'Connectivity',
    'Food',
    'GeneralCityInfo',
    'HiddenGems',
    'LocalTransport',
    'Miscellaneous',
    'NearbyTouristSpots',
    'PlacesToVisit',
    'Shopping'
];


export function AppSidebar({
    selectedCity,
    onCitySelect,
    selectedCategory,
    onCategorySelect,
    onAddData,
    onGetData
}) {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddCity, setShowAddCity] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const categories = [
        'Accommodation',
        'Activities',
        'Connectivity',
        'Food',
        'GeneralCityInfo',
        'HiddenGems',
        'LocalTransport',
        'Miscellaneous',
        'NearbyTouristSpots',
        'PlacesToVisit',
        'Shopping'
    ];

    const fetchCities = async () => {
        try {
            setLoading(true);
            const response = await citiesApi.getAll();
            setCities(response.data);
        } catch (error) {
            console.error("Failed to fetch cities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();

        // Listen for city updates
        const handleCityUpdate = () => {
            fetchCities();
        };

        window.addEventListener('cityUpdated', handleCityUpdate);
        return () => window.removeEventListener('cityUpdated', handleCityUpdate);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddCity = async (cityData) => {
        try {
            await citiesApi.create({
                cityName: cityData.cityName,
                coverImage: cityData.coverImage || "",
                content: cityData.content || ""
            });
            await fetchCities();
            setShowAddCity(false);
        } catch (error) {
            console.error("Failed to add city:", error);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const filteredCities = cities.filter(city =>
        city.cityName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className={`sidebar ${!sidebarOpen ? "w-16" : "w-80"}`} style={{
                width: sidebarOpen ? '20rem' : '4rem',
                backgroundColor: 'white',
                borderRight: '1px solid #dbeafe',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                position: 'relative'
            }}>
                <div className="sidebar-content" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #dbeafe',
                        background: 'linear-gradient(to right, #dbeafe, white)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            }}>
                                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4m0 4h4m-4 0h4" />
                                </svg>
                            </div>
                            {sidebarOpen && (
                                <div>
                                    <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>City Manager</h1>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#2563eb' }}>Professional Dashboard</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={toggleSidebar}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b'
                            }}
                        >
                            <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    </div>

                    {sidebarOpen && (
                        <>
                            {/* City Selection */}
                            <div style={{ padding: '1rem 1rem 1.5rem' }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#475569',
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <svg style={{ width: '0.75rem', height: '0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Select City
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {/* Custom Searchable Dropdown */}
                                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                                        {/* Dropdown Trigger */}
                                        <div
                                            onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem 2rem 0.5rem 0.75rem',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '0.375rem',
                                                backgroundColor: 'white',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                position: 'relative',
                                                color: selectedCity ? '#1e293b' : '#94a3b8'
                                            }}
                                        >
                                            {loading ? 'Loading cities...' : (selectedCity?.cityName || 'Search or select a city...')}
                                            <svg
                                                style={{
                                                    width: '1rem',
                                                    height: '1rem',
                                                    position: 'absolute',
                                                    right: '0.5rem',
                                                    top: '50%',
                                                    transform: `translateY(-50%) ${isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
                                                    color: '#64748b',
                                                    transition: 'transform 0.2s'
                                                }}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </div>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 0.25rem)',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'white',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '0.375rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                zIndex: 50,
                                                maxHeight: '300px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                {/* Search Input Inside Dropdown */}
                                                <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search cities..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.5rem 0.75rem 0.5rem 2rem',
                                                                border: '1px solid #bfdbfe',
                                                                borderRadius: '0.375rem',
                                                                backgroundColor: 'white',
                                                                outline: 'none',
                                                                fontSize: '0.875rem'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#3b82f6';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#bfdbfe';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                        <svg
                                                            style={{
                                                                width: '1rem',
                                                                height: '1rem',
                                                                position: 'absolute',
                                                                left: '0.5rem',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                color: '#64748b',
                                                                pointerEvents: 'none'
                                                            }}
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <circle cx="11" cy="11" r="8" />
                                                            <path d="m21 21-4.35-4.35" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Filtered Cities List */}
                                                <div style={{
                                                    overflowY: 'auto',
                                                    maxHeight: '240px'
                                                }}>
                                                    {filteredCities.map((city) => (
                                                        <div
                                                            key={city.cityId}
                                                            onClick={() => {
                                                                onCitySelect(city);
                                                                setIsDropdownOpen(false);
                                                                setSearchTerm('');
                                                            }}
                                                            style={{
                                                                padding: '0.5rem 0.75rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                backgroundColor: selectedCity?.cityId === city.cityId ? '#dbeafe' : 'white',
                                                                color: selectedCity?.cityId === city.cityId ? '#1d4ed8' : '#1e293b'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (selectedCity?.cityId !== city.cityId) {
                                                                    e.target.style.backgroundColor = '#f1f5f9';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (selectedCity?.cityId !== city.cityId) {
                                                                    e.target.style.backgroundColor = 'white';
                                                                }
                                                            }}
                                                        >
                                                            {city.cityName}
                                                        </div>
                                                    ))}
                                                    {filteredCities.length === 0 && (
                                                        <div style={{
                                                            padding: '1rem',
                                                            textAlign: 'center',
                                                            color: '#94a3b8',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            No cities found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowAddCity(true)}
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #bfdbfe',
                                            borderRadius: '0.375rem',
                                            color: '#2563eb',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#dbeafe';
                                            e.target.style.borderColor = '#93c5fd';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.borderColor = '#bfdbfe';
                                        }}
                                    >
                                        <svg style={{ width: '0.75rem', height: '0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        Add New City
                                    </button>

                                    {selectedCity && (
                                        <div style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#dbeafe',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #bfdbfe'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                                <span style={{ fontSize: '0.75rem', color: '#374151' }}>Selected City</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d4ed8' }}>{selectedCity.cityName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Selection */}
                            {selectedCity && (
                                <div style={{
                                    padding: '1.5rem 1rem',
                                    borderTop: '1px solid #dbeafe'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#475569',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <svg style={{ width: '0.75rem', height: '0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
                                        </svg>
                                        Data Category
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <select
                                            value={selectedCategory || ""}
                                            onChange={(e) => onCategorySelect(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem 0.75rem',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '0.375rem',
                                                backgroundColor: 'white',
                                                outline: 'none',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            <option value="">Select data category</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>

                                        {selectedCategory && (
                                            <div style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#f3e8ff',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #e9d5ff'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#a855f7' }}></div>
                                                    <span style={{ fontSize: '0.75rem', color: '#374151' }}>Active Category</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#7e22ce' }}>{selectedCategory}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedCity && selectedCategory && (
                                <div style={{
                                    padding: '1.5rem 1rem',
                                    borderTop: '1px solid #dbeafe'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#475569',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <svg style={{ width: '0.75rem', height: '0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                        </svg>
                                        Quick Actions
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button
                                            onClick={onAddData}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem 1rem',
                                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                borderRadius: '0.375rem',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                                            }}
                                        >
                                            <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                            Add New Entry
                                        </button>
                                        <button
                                            onClick={onGetData}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem 1rem',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '0.375rem',
                                                color: '#2563eb',
                                                backgroundColor: 'transparent',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.backgroundColor = '#dbeafe';
                                                e.target.style.borderColor = '#93c5fd';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.borderColor = '#bfdbfe';
                                            }}
                                        >
                                            <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                            </svg>
                                            Refresh Data
                                        </button>

                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem',
                                            backgroundColor: '#d1fae5',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #a7f3d0'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '0.25rem' }}>Ready to manage</div>
                                            <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                                                {selectedCategory} data for {selectedCity.cityName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Footer */}
                            <div style={{
                                marginTop: 'auto',
                                padding: '1rem',
                                borderTop: '1px solid #dbeafe',
                                background: 'linear-gradient(to right, #dbeafe, white)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                    <span>System Online</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>
                                    {cities.length} cities available
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AddCityDialog
                open={showAddCity}
                onOpenChange={setShowAddCity}
                onAddCity={handleAddCity}
            />
        </>
    );
}
