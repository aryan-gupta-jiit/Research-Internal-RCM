import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";
import { DataTable } from "../components/DataTable";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Progress } from "../components/ui/progress";
// import { ToastAction } from "../components/ui/sonner";
// import { useToast } from "../components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { categoryApi } from "../services/api";
import {
  Building2,
  MapPin,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Download,
  Upload,
  Filter,
  Search,
  BarChart3,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  UserPlus,
  Activity,
  LogOut,
  User,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateAccountModal from "./Signup";
import { EditCityDialog } from "../components/EditCityDialog";
import { citiesApi } from "../services/api";


const Index = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table, grid, chart
  const [showStats, setShowStats] = useState(true);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [dataStats, setDataStats] = useState({});
  const navigate = useNavigate();
  // const { toast } = useToast();

  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showEditCity, setShowEditCity] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleEditCity = async (cityData) => {
    if (!selectedCity) return;

    try {
      await citiesApi.update(selectedCity.cityId, cityData);
      // Update the selected city state with new data
      setSelectedCity({
        ...selectedCity,
        ...cityData
      });
      setShowEditCity(false);
      // Trigger sidebar to refresh cities list
      window.dispatchEvent(new CustomEvent('cityUpdated'));
    } catch (error) {
      console.error("Failed to update city:", error);
      alert("Failed to update city. Please try again.");
    }
  };

  // Keys for persistence
  const STORAGE_KEYS = {
    city: "yc:selectedCity",
    category: "yc:selectedCategory",
    viewMode: "yc:viewMode",
    showStats: "yc:showStats",
  };

  // Rehydrate selections on first load
  useEffect(() => {
    try {
      const persistedCity = localStorage.getItem(STORAGE_KEYS.city);
      const persistedCategory = localStorage.getItem(STORAGE_KEYS.category);
      const persistedViewMode = localStorage.getItem(STORAGE_KEYS.viewMode);
      const persistedShowStats = localStorage.getItem(STORAGE_KEYS.showStats);

      if (persistedCity) setSelectedCity(JSON.parse(persistedCity));
      if (persistedCategory) setSelectedCategory(JSON.parse(persistedCategory));
      if (persistedViewMode) setViewMode(persistedViewMode);
      if (persistedShowStats) setShowStats(JSON.parse(persistedShowStats));
    } catch (error) {
      console.error("Failed to load persisted selections", error);
    }
  }, []);

  // Persist selections when they change
  useEffect(() => {
    try {
      if (selectedCity) {
        localStorage.setItem(STORAGE_KEYS.city, JSON.stringify(selectedCity));
      }
      if (selectedCategory) {
        localStorage.setItem(STORAGE_KEYS.category, JSON.stringify(selectedCategory));
      }
      localStorage.setItem(STORAGE_KEYS.viewMode, viewMode);
      localStorage.setItem(STORAGE_KEYS.showStats, JSON.stringify(showStats));
    } catch (error) {
      console.error("Failed to persist selections", error);
    }
  }, [selectedCity, selectedCategory, viewMode, showStats]);

  // Calculate data statistics
  useEffect(() => {
    if (categoryData.length > 0) {
      const stats = {
        total: categoryData.length,
        active: categoryData.filter(item => item.status === 'active' || item.isActive).length,
        recent: categoryData.filter(item => {
          const daysAgo = (Date.now() - new Date(item.updatedAt || item.createdAt).getTime()) / (1000 * 3600 * 24);
          return daysAgo <= 7;
        }).length,
        // Add more stats based on your data structure
      };
      setDataStats(stats);
    }
  }, [categoryData]);

  // Filter data based on search term and filters
  useEffect(() => {
    if (!categoryData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = categoryData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });

    setFilteredData(filtered);
  }, [categoryData, searchTerm, filters]);

  const fetchCategoryData = async () => {
    if (!selectedCity || !selectedCategory) return;

    try {
      setLoading(true);
      setError(null);
      setRefreshProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setRefreshProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await categoryApi.getByCity(selectedCategory, selectedCity.cityId);
      setCategoryData(response.data);
      setLastUpdated(new Date());

      clearInterval(progressInterval);
      setRefreshProgress(100);

      setTimeout(() => setRefreshProgress(0), 1000);

      // toast({
      //   title: "Data loaded successfully",
      //   description: `Found ${response.data.length} records for ${selectedCategory}`,
      //   action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
      // });

    } catch (error) {
      console.error("Failed to fetch category data:", error);
      setError("Failed to load data. Please try again.");
      setCategoryData([]);

      // toast({
      //   title: "Error loading data",
      //   description: "Please check your connection and try again.",
      //   variant: "destructive",
      //   action: <ToastAction altText="Retry" onClick={fetchCategoryData}>Retry</ToastAction>,
      // });
    } finally {
      setLoading(false);
    }
  };

  const handleAddData = () => {
    if (!selectedCity || !selectedCategory) {
      // toast({
      //   title: "Selection required",
      //   description: "Please select both a city and category first.",
      //   variant: "destructive",
      // });
      return;
    }
    setEditData(null);
    setShowAddForm(true);
  };

  const handleGetData = () => {
    fetchCategoryData();
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowEditForm(true);
  };

  const handleFormSuccess = () => {
    fetchCategoryData();
    // toast({
    //   title: "Success",
    //   description: "Data has been saved successfully.",
    //   action: <ToastAction altText="Close">Close</ToastAction>,
    // });
  };

  const handleExportData = () => {
    // Simple export to JSON
    const dataStr = JSON.stringify(categoryData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `${selectedCity.cityName}_${selectedCategory}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    // toast({
    //   title: "Data exported",
    //   description: `Data has been downloaded as ${exportFileDefaultName}`,
    // });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  // Auto-fetch data when city or category changes
  useEffect(() => {
    if (selectedCity && selectedCategory) {
      fetchCategoryData();
    } else {
      setCategoryData([]);
      setFilteredData([]);
    }
  }, [selectedCity, selectedCategory]);

  const getTimeAgo = (date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-slate-50">
        {/* Sidebar */}
        <div
          className={`
            flex-shrink-0 border-r border-blue-100 bg-white shadow-professional backdrop-blur-sm
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'w-20' : 'w-80'}
            hidden md:block
          `}
          style={{
            minWidth: sidebarCollapsed ? '80px' : '320px'
          }}
        >
          <AppSidebar
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onAddData={handleAddData}
            onGetData={handleGetData}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className="md:hidden">
          <AppSidebar
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onAddData={handleAddData}
            onGetData={handleGetData}
            collapsed={false}
            onCollapse={setSidebarCollapsed}
            mobile={true}
          />
        </div>

        {/* Main Content */}
        <div
          className={`
            flex-1 flex flex-col min-w-0 transition-all duration-300
            ${sidebarCollapsed ? 'md:ml-0' : 'md:ml-0'}
          `}
          style={{
            marginLeft: sidebarCollapsed ? '0' : '0',
            width: sidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 320px)'
          }}
        >
          {/* Header */}
          <header className="h-20 border-b border-blue-100 bg-white/95 backdrop-blur-sm flex items-center px-4 md:px-6 lg:px-8 sticky top-0 z-30 shadow-card w-full">
            <div className="flex items-center w-full">
              <SidebarTrigger className="md:hidden" />

              <div className="flex items-center gap-4 min-w-0 flex-1 ml-2 md:ml-0">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-2 h-2 md:w-3 md:h-3 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl md:text-2xl bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                    City Management Dashboard
                  </h1>
                  {selectedCity && (
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedCity.cityName}</span>
                      </Badge>
                      {selectedCategory && (
                        <>
                          <ChevronRight className="w-3 h-3 text-blue-400" />
                          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 text-xs border-blue-200 text-blue-600">
                            <Layers className="w-3 h-3" />
                            <span>{selectedCategory}</span>
                          </Badge>
                          {lastUpdated && (
                            <>
                              <ChevronRight className="w-3 h-3 text-blue-400" />
                              <Badge className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                                <Clock className="w-3 h-3" />
                                <span>{getTimeAgo(lastUpdated)}</span>
                              </Badge>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {/* Right side - User actions */}
                <div className="flex items-center gap-4">
                  {/* Admin Actions */}
                  {isAdmin && (
                    <>
                      {/* Edit City Button (shown when city is selected) */}
                      {selectedCity && (
                        <button
                          onClick={() => setShowEditCity(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg font-medium hover:from-amber-700 hover:to-amber-600 transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit City</span>
                        </button>
                      )}

                      {/* Create Account Button */}
                      <button
                        onClick={() => setIsCreateAccountOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create Account</span>
                      </button>
                    </>
                  )}

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <Badge className="mt-1 capitalize" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Create Account Modal */}
          <CreateAccountModal
            isOpen={isCreateAccountOpen}
            onClose={() => setIsCreateAccountOpen(false)}
            onAccountCreated={() => {
              // Optional: Refresh users list or show notification
              console.log('New account created');
            }}
          />

          {/* Edit City Dialog */}
          <EditCityDialog
            open={showEditCity}
            onOpenChange={setShowEditCity}
            onEditCity={handleEditCity}
            cityData={selectedCity}
          />

          {/* Progress Bar for Loading */}
          {refreshProgress > 0 && refreshProgress < 100 && (
            <div className="w-full px-4 md:px-6 lg:px-8 sticky top-20 z-20">
              <Progress value={refreshProgress} className="h-1 bg-blue-100" />
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 lg:px-8 lg:py-6 overflow-auto w-full">
            {!selectedCity ? (
              <WelcomeScreen />
            ) : !selectedCategory ? (
              <CitySelectedScreen city={selectedCity} />
            ) : (
              <div className="space-y-6 w-full max-w-full mx-auto">
                {/* Enhanced Header Section */}
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-blue-100 shadow-card">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 gradient-primary rounded-lg flex items-center justify-center shadow-md">
                          <Layers className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                            {selectedCategory}
                          </h2>
                          <p className="text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                            Managing <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">{filteredData.length} records</Badge>
                            for <span className="text-slate-700">{selectedCity.cityName}</span>
                            {searchTerm && (
                              <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-600">
                                <Search className="w-3 h-3" />
                                Filtered
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      <Button
                        onClick={handleAddData}
                        className="gradient-primary hover:bg-blue-600 shadow-md border-0 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">Add New</span>
                      </Button>
                      <Button
                        onClick={handleGetData}
                        variant="outline"
                        disabled={loading}
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 md:mr-2 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">Refresh</span>
                      </Button>
                      <Button
                        onClick={handleExportData}
                        variant="outline"
                        size="sm"
                        disabled={categoryData.length === 0}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">Export</span>
                      </Button>
                    </div>
                  </div>

                  {/* Search and Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={`Search in ${selectedCategory}...`}
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearFilters} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStats(!showStats)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        {showStats ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        Stats
                      </Button>
                    </div>
                  </div>
                </div>

                {/* View Mode Tabs */}
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList className="bg-blue-50 border border-blue-200">
                      <TabsTrigger value="table" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
                        <List className="w-4 h-4" />
                        Table
                      </TabsTrigger>
                      <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
                        <Grid3X3 className="w-4 h-4" />
                        Grid
                      </TabsTrigger>
                      <TabsTrigger value="chart" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
                        <BarChart3 className="w-4 h-4" />
                        Charts
                      </TabsTrigger>
                    </TabsList>

                    <div className="text-sm text-slate-600">
                      Showing {filteredData.length} of {categoryData.length} records
                    </div>
                  </div>

                  {/* Stats Cards */}
                  {showStats && categoryData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                      <StatCard
                        title="Total Records"
                        value={dataStats.total}
                        icon={<Database className="w-5 h-5" />}
                        color="blue"
                      />
                      <StatCard
                        title="Active"
                        value={dataStats.active}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        color="green"
                      />
                      <StatCard
                        title="Recent (7d)"
                        value={dataStats.recent}
                        icon={<Activity className="w-5 h-5" />}
                        color="purple"
                      />
                      <StatCard
                        title="Last Updated"
                        value={getTimeAgo(lastUpdated)}
                        icon={<RefreshCw className="w-5 h-5" />}
                        color="orange"
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <Card className="border-red-200 bg-red-50 mb-6">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-red-800">{error}</p>
                          <Button variant="link" className="p-0 h-auto text-red-600" onClick={fetchCategoryData}>
                            Try again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Data Content */}
                  <TabsContent value="table" className="mt-0">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-card overflow-hidden">
                      {loading ? (
                        <LoadingSkeleton />
                      ) : (
                        <DataTable
                          data={filteredData}
                          category={selectedCategory}
                          onEdit={handleEdit}
                          onDataChange={fetchCategoryData}
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="grid" className="mt-0">
                    <GridView data={filteredData} category={selectedCategory} onEdit={handleEdit} />
                  </TabsContent>

                  <TabsContent value="chart" className="mt-0">
                    <ChartView data={filteredData} category={selectedCategory} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </div>

        {/* Forms */}
        {selectedCity && selectedCategory && (
          <>
            <CategoryFormDialog
              open={showAddForm}
              onOpenChange={setShowAddForm}
              category={selectedCategory}
              city={selectedCity}
              onSuccess={handleFormSuccess}
            />

            <CategoryFormDialog
              open={showEditForm}
              onOpenChange={setShowEditForm}
              category={selectedCategory}
              city={selectedCity}
              editData={editData}
              onSuccess={handleFormSuccess}
            />
          </>
        )}
      </div>
    </SidebarProvider>
  );
};

// Additional Components
const WelcomeScreen = () => (
  <div className="flex items-center justify-center h-full min-h-[70vh] w-full">
    <Card className="w-full max-w-2xl mx-auto text-center shadow-professional border border-blue-100 bg-white">
      <CardContent className="p-8 md:p-12">
        <div className="w-24 h-24 md:w-32 md:h-32 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
          <div className="relative">
            <Building2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 absolute -top-1 -right-1 md:-top-2 md:-right-2" />
          </div>
        </div>
        <h2 className="text-2xl md:text-4xl bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent mb-4">
          Welcome to City Manager
        </h2>
        <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed">
          Select a city from the sidebar to start managing its data across different categories with beautiful visualizations.
        </p>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-sm text-blue-600 animate-pulse">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full gradient-primary"></div>
          <span>Choose a city from the sidebar to get started</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

const CitySelectedScreen = ({ city }) => (
  <div className="flex items-center justify-center h-full min-h-[70vh] w-full">
    <Card className="w-full max-w-2xl mx-auto text-center shadow-professional border border-blue-100 bg-white">
      <CardContent className="p-8 md:p-12">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
          <MapPin className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
        </div>
        <div className="mb-4 md:mb-6">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm mb-3 md:mb-4">
            City Selected
          </Badge>
          <h2 className="text-2xl md:text-3xl text-slate-800 mb-2">{city.cityName}</h2>
          <p className="text-slate-600 text-sm md:text-base">Ready for data management</p>
        </div>
        <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed">
          Now choose a category from the sidebar to manage specific data for {city.cityName}.
        </p>
        <div className="flex items-center justify-center gap-2 md:gap-3 text-sm text-emerald-600 animate-pulse">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
          <span>Select a category to continue</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    green: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    orange: "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
  };

  const iconBgClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-amber-100 text-amber-600",
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border shadow-card`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-1">{title}</p>
            <p className="text-xl">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="p-6 md:p-8 space-y-4">
    <Skeleton className="h-8 w-full bg-blue-100" />
    <Skeleton className="h-8 w-full bg-blue-100" />
    <Skeleton className="h-8 w-full bg-blue-100" />
    <Skeleton className="h-8 w-full bg-blue-100" />
    <Skeleton className="h-8 w-full bg-blue-100" />
  </div>
);

const GridView = ({ data, category, onEdit }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {data.map((item, index) => (
      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer border border-blue-100 bg-white">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">#{index + 1}</Badge>
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="text-blue-600 hover:bg-blue-50">
              Edit
            </Button>
          </div>
          {Object.entries(item).slice(0, 4).map(([key, value]) => (
            <div key={key} className="mb-2">
              <p className="text-xs text-blue-600 capitalize">{key}</p>
              <p className="text-sm text-slate-700 truncate">{String(value)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

const ChartView = ({ data, category }) => (
  <Card className="border border-blue-100 bg-white shadow-card">
    <CardContent className="p-6">
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg text-slate-700 mb-2">Chart Visualization</h3>
        <p className="text-slate-600">
          Charts and graphs for {category} data would be displayed here.
        </p>
        <p className="text-sm text-blue-600 mt-2">
          {data.length} records available for visualization.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default Index;