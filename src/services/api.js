// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Cities API
// export const citiesApi = {
//   getAll: () => api.get('/cities/'),
//   getById: (cityId) => api.get(`/cities/${cityId}`),
//   create: (cityData) => api.post('/cities/create', cityData),
// };

// // Generic category API functions
// export const categoryApi = {
//   getByCity: (category, cityId) => {
//     if (category === 'Accommodation') {
//       return api.get(`/accommodations/city/${cityId}`);
//     }
//     return api.get(`/${category.toLowerCase()}/city/${cityId}`);
//   },

//   create: (category, data) => {
//     if (category === 'Accommodation') {
//       return api.post('/accommodations', data);
//     }
//     return api.post(`/${category.toLowerCase()}/create`, data);
//   },

//   update: (category, id, data) => {
//     return api.put(`/${category.toLowerCase()}/update/${id}`, data);
//   },

//   delete: (category, id) => {
//     return api.delete(`/${category.toLowerCase()}/delete/${id}`);
//   },
// };

// export default api;


import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://yescityreasearchdashboard.onrender.com/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cities API
export const citiesApi = {
  getAll: () => api.get('/cities/'),
  getById: (cityId) => api.get(`/cities/${cityId}`),
  create: (cityData) => api.post('/cities/create', cityData),
  update: (cityId, cityData) => api.put(`/cities/${cityId}`, cityData),
};

// Generic category API functions
export const categoryApi = {
  getByCity: (category, cityId) => {
    const base = categoryBasePath(category);
    return api.get(`${base}/city/${cityId}`);
  },

  getById: (category, id) => {
    const base = categoryBasePath(category);
    return api.get(`${base}/${id}`);
  },

  create: (category, data) => {
    const base = categoryBasePath(category);
    return api.post(`${base}/create`, data);
  },

  update: (category, id, data) => {
    const base = categoryBasePath(category);
    return api.put(`${base}/${id}`, data);
  },

  delete: (category, id) => {
    const base = categoryBasePath(category);
    return api.delete(`${base}/${id}`);
  },
};

export default api;

function categoryBasePath(category) {
  switch (category) {
    case 'Accommodation':
      return '/accommodation';
    case 'Activities':
      return '/activities';
    case 'Connectivity':
      return '/connectivity';
    case 'Food':
      return '/food';
    case 'GeneralCityInfo':
      return '/cityinfo';
    case 'HiddenGems':
      return '/hiddengems';
    case 'LocalTransport':
      return '/local-transport';
    case 'NearbyTouristSpot':
      return '/nearby';
    case 'PlacesToVisit':
      return '/places';
    case 'Shopping':
      return '/shopping';
    case 'Miscellaneous':
      return '/miscellaneous';
    default:
      return `/${String(category || '').toLowerCase()}`;
  }
}