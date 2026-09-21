import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
  }),

  tagTypes: [
    "TravelPackage",
    "RentalPackage",
    "CarCategory",
    "City",
    "Vendors",
    "Vendor",
    "Cars",
    "Car",
    "Bookings",
    "Booking",
    "WebsiteSettings",
    "dashboardStats",
    "City-Names",
    "UserStats",
    "VendorStats",
    "Transfers",
    "Itinerary",
    "HotelBookingQuery",
    "Route",
    "RateMaster",
    "ChargeMaster",
    "SurchargeMaster",
    "AgentGrade",
    "Garage",
    "StatePermit",
    "StateMarkup",
  ],

  endpoints: (builder) => ({
    // Website Settings
    getWebsiteSettings: builder.query({
      query: () => ({
        url: "/admin/website-setting",
      }),
      providesTags: ["WebsiteSettings"],
    }),
    // Add or Update Website Settings
    addWebsiteSettings: builder.mutation({
      query: (data) => ({
        url: "/admin/website-setting",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["WebsiteSettings"],
    }),
    // Update Website Settings
    updateWebsiteSettings: builder.mutation({
      query: (data) => ({
        url: "/admin/website-setting",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["WebsiteSettings"],
    }),
    // Check Admin Authentication
    checkAdmin: builder.query({
      query: () => ({
        url: "/admin/check",
      }),
    }),
    // Admin Authentication
    adminLogin: builder.mutation({
      query: ({ email, password }) => ({
        url: "/admin/login",
        method: "POST",
        body: { email, password },
      }),
    }),
    // Admin Logout
    adminLogout: builder.mutation({
      query: () => ({
        url: "/admin/logout",
        method: "POST",
      }),
    }),
    // Get Dashboard Stats
    getDashboardStats: builder.query({
      query: () => ({
        url: "/admin/dashboard-stats",
      }),
      providesTags: ["dashboardStats"],
    }),
    // Get User Stats
    getUserStats: builder.query({
      query: () => ({
        url: "/admin/user-stats",
      }),
      providesTags: ["UserStats"],
    }),
    // Get All Users
    getAllUsers: builder.query({
      query: ({
        search = "",
        page = 1,
        resultPerPage = 10,
        startDate,
        endDate,
      }) => ({
        url: "/admin/users",
        params: {
          search,
          page,
          resultPerPage,
          startDate,
          endDate,
        },
      }),
    }),
    // Get User Details
    getUserDetails: builder.query({
      query: (id) => ({
        url: `/admin/users/${id}`,
      }),
      providesTags: ["User"],
    }),
    // Get Vendor Stats
    getVendorStats: builder.query({
      query: () => ({
        url: "/admin/vendor-stats",
      }),
      providesTags: ["VendorStats"],
    }),
    // Get All Vendors
    getAllVendors: builder.query({
      query: ({
        search = "",
        page = 1,
        resultPerPage = 10,
        status = "",
        startDate,
        endDate,
      }) => ({
        url: "/admin/vendors",
        params: {
          search,
          page,
          resultPerPage,
          status,
          startDate,
          endDate,
        },
      }),
      providesTags: ["Vendors"],
    }),
    // Get Vendor Details
    getVendorDetails: builder.query({
      query: (id) => ({
        url: `/admin/vendors/${id}`,
      }),
      providesTags: ["Vendor"],
    }),
    // update a Vendor
    updateAUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "UserStats"],
    }),
    updateAVendor: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/vendors/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Vendor", "VendorStats"],
    }),
    // Get Booking Stats
    getBookingStats: builder.query({
      query: () => ({
        url: "/admin/booking-stats",
      }),
    }),
    // Get All Bookings
    getAllBookings: builder.query({
      query: ({
        search = "",
        page = 1,
        resultPerPage = 10,
        status = "",
        startDate,
        endDate,
      }) => ({
        url: "/admin/bookings",
        params: {
          search,
          page,
          resultPerPage,
          status,
          startDate,
          endDate,
        },
      }),
      providesTags: ["Bookings"],
    }),
    // Get A Booking
    getAbooking: builder.query({
      query: (id) => ({
        url: `/admin/bookings/${id}`,
      }),
      providesTags: ["Booking"],
    }),
    // Assign Vendor to Booking
    assignVendorToBooking: builder.mutation({
      query: ({ bookingId, vendorId }) => ({
        url: `/admin/bookings/${bookingId}/assign-vendor/${vendorId}`,
        method: "POST",
      }),
      invalidatesTags: ["Bookings", "Booking"],
    }),
    rejectBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/admin/bookings/${bookingId}/reject-booking`,
        method: "POST",
      }),
      invalidatesTags: ["Bookings", "dashboardStats"],
    }),
    // Get Travel Packages
    getAllTravelPackages: builder.query({
      query: () => ({
        url: "/package/travel",
      }),
      providesTags: ["TravelPackage"],
    }),
    // Add Travel Package
    addTravelPackage: builder.mutation({
      query: (data) => ({
        url: "/package/travel",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TravelPackage"],
    }),
    // Update Travel Package
    updateTravelPackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package/travel/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TravelPackage"],
    }),
    // Delete Travel Package
    deleteTravelPackage: builder.mutation({
      query: (id) => ({
        url: `/package/travel/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TravelPackage"],
    }),
    // Get City Names
    getCityNames: builder.query({
      query: () => ({
        url: "/admin/cities-names",
      }),
      providesTags: ["City-Names"],
    }),
    // Get Cities
    getCities: builder.query({
      query: () => ({
        url: "/admin/cities",
      }),
      providesTags: ["City"],
    }),
    // Add New City
    addNewCity: builder.mutation({
      query: (data) => ({
        url: "/admin/cities",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["City"],
    }),
    // Update City Charges
    updateCityCharges: builder.mutation({
      query: ({ cityId, data }) => ({
        url: `/admin/cities/${cityId}/charges`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["City"],
    }),
    // Add New Category to City
    addNewCategoryToCity: builder.mutation({
      query: ({ cityId, category }) => ({
        url: `/admin/cities/${cityId}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["City"],
    }),
    // Update Category from City
    updateCategoryFromCity: builder.mutation({
      query: ({ cityId, categoryId, category }) => ({
        url: `/admin/cities/${cityId}/category/${categoryId}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["City"],
    }),
    // Toggle Category Status from Existing City
    toggleCategoryStatusFromCity: builder.mutation({
      query: ({ cityId, categoryId }) => ({
        url: `/admin/cities/${cityId}/category/${categoryId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["City"],
    }),
    // Get Car Categories
    getCarCategories: builder.query({
      query: () => ({
        url: "/admin/car-categories",
      }),
      providesTags: ["CarCategory"],
    }),
    // Add Car Category
    addCarCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/car-categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CarCategory"],
    }),
    // Update Car Category
    updateCarCategory: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/car-categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CarCategory"],
    }),
    addCarToCategory: builder.mutation({
      query: ({ categoryId, carNames }) => ({
        url: `/admin/car-categories/${categoryId}`,
        method: "PATCH",
        body: { carNames },
      }),
      invalidatesTags: ["CarCategory"],
    }),
    // Get Car Stats
    getCarStats: builder.query({
      query: () => ({
        url: "/admin/car-stats",
      }),
      providesTags: ["Car"],
    }),
    // Get All Cars
    getAllCars: builder.query({
      query: ({ search = "", page = 1, resultPerPage = 10 }) => ({
        url: "/admin/cars",
        params: {
          search,
          page,
          resultPerPage,
        },
      }),
      providesTags: ["Cars"],
    }),
    // Get Car Details
    getCarDetails: builder.query({
      query: (id) => ({
        url: `/admin/cars/${id}`,
      }),
      providesTags: ["Car"],
    }),
    // Update a Car
    updateACar: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/cars/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Car"],
    }),
    getRentalPackages: builder.query({
      query: () => ({
        url: "/package/rental",
      }),
      providesTags: ["RentalPackage"],
    }),
    // Add Rental Package
    addRentalPackage: builder.mutation({
      query: (data) => ({
        url: "/package/rental",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RentalPackage"],
    }),
    // Update Rental Package
    updateRentalPackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package/rental/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RentalPackage"],
    }),
    // Delete Rental Package
    deleteRentalPackage: builder.mutation({
      query: (id) => ({
        url: `/package/rental/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RentalPackage"],
    }),
    getAllTransfers: builder.query({
      query: () => ({
        url: "/admin/transfers",
      }),
      providesTags: ["Transfers"],
    }),
    // Add Transfer
    addTransfer: builder.mutation({
      query: (data) => ({
        url: "/admin/transfers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transfers"],
    }),
    // Add New Category to Transfer
    addNewCategoryToTransfer: builder.mutation({
      query: ({ transferId, category }) => ({
        url: `/admin/transfers/${transferId}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["Transfers"],
    }),
    // Update Category from Transfer
    updateCategoryFromTransfer: builder.mutation({
      query: ({ transferId, categoryId, category }) => ({
        url: `/admin/transfers/${transferId}/category/${categoryId}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["Transfers"],
    }),
    // Toggle Category Status from Existing Transfer
    toggleCategoryStatusFromTransfer: builder.mutation({
      query: ({ transferId, categoryId }) => ({
        url: `/admin/transfers/${transferId}/category/${categoryId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfers"],
    }),
    // Get Activity Packages
    getActivityPackages: builder.query({
      query: () => ({
        url: "/package/activity",
      }),
      providesTags: ["ActivityPackage"],
    }),
    // Add Activity Package
    addActivityPackage: builder.mutation({
      query: (data) => ({
        url: "/package/activity",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ActivityPackage"],
    }),
    updateActivityPackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package/activity/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ActivityPackage"],
    }),
    deleteActivityPackage: builder.mutation({
      query: (id) => ({
        url: `/package/activity/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ActivityPackage"],
    }),
    toggleActivityPackageStatus: builder.mutation({
      query: (id) => ({
        url: `/package/activity/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["ActivityPackage"],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: "/admin/create-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    createVendor: builder.mutation({
      query: (data) => ({
        url: "/admin/create-vendor",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vendors"],
    }),
    getTravelQuery: builder.query({
      query: () => ({
        url: "/admin/travel-queries",
      }),
      providesTags: ["TravelQuery"],
    }),
    getItineraries: builder.query({
      query: (params) => ({
        url: "/itinerary/itineraries",
        params,
      }),
      providesTags: ["Itinerary"],
    }),
    getItineraryById: builder.query({
      query: (id) => ({
        url: `/itinerary/itineraries/${id}`,
      }),
      providesTags: ["Itinerary"],
    }),
    updateItineraryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/itinerary/itineraries/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Itinerary"],
    }),
    getHotelBookingQueries: builder.query({
      query: (params) => ({
        url: "/hotel-booking/hotel-booking-queries",
        params,
      }),
      providesTags: ["HotelBookingQuery"],
    }),
    getHotelBookingQueryById: builder.query({
      query: (id) => ({
        url: `/hotel-booking/hotel-booking-queries/${id}`,
      }),
      providesTags: ["HotelBookingQuery"],
    }),
    updateHotelBookingQueryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/hotel-booking/hotel-booking-queries/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["HotelBookingQuery"],
    }),
    deleteHotelBookingQuery: builder.mutation({
      query: (id) => ({
        url: `/hotel-booking/hotel-booking-queries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HotelBookingQuery"],
    }),

    // ─── Route Master (KM Master) ───
    getAllRoutes: builder.query({
      query: (params) => ({
        url: "/master/routes",
        params,
      }),
      providesTags: ["Route"],
    }),
    createRoute: builder.mutation({
      query: (data) => ({
        url: "/master/routes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Route"],
    }),
    updateRoute: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/routes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Route"],
    }),
    deleteRoute: builder.mutation({
      query: (id) => ({
        url: `/master/routes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Route"],
    }),

    // ─── Rate Master ───
    getAllRates: builder.query({
      query: (params) => ({
        url: "/master/rate-master",
        params,
      }),
      providesTags: ["RateMaster"],
    }),
    createRate: builder.mutation({
      query: (data) => ({
        url: "/master/rate-master",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RateMaster"],
    }),
    updateRate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/rate-master/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RateMaster"],
    }),
    deleteRate: builder.mutation({
      query: (id) => ({
        url: `/master/rate-master/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RateMaster"],
    }),

    // ─── Charge Master ───
    getAllCharges: builder.query({
      query: () => ({
        url: "/master/charge-master",
      }),
      providesTags: ["ChargeMaster"],
    }),
    createCharge: builder.mutation({
      query: (data) => ({
        url: "/master/charge-master",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ChargeMaster"],
    }),
    updateCharge: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/charge-master/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ChargeMaster"],
    }),
    deleteCharge: builder.mutation({
      query: (id) => ({
        url: `/master/charge-master/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChargeMaster"],
    }),

    // ─── Surcharge Master ───
    getAllSurcharges: builder.query({
      query: () => ({
        url: "/master/surcharge-master",
      }),
      providesTags: ["SurchargeMaster"],
    }),
    createSurcharge: builder.mutation({
      query: (data) => ({
        url: "/master/surcharge-master",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SurchargeMaster"],
    }),
    updateSurcharge: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/surcharge-master/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["SurchargeMaster"],
    }),
    deleteSurcharge: builder.mutation({
      query: (id) => ({
        url: `/master/surcharge-master/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SurchargeMaster"],
    }),

    // ─── Agent Grades ───
    getAllAgentGrades: builder.query({
      query: () => ({
        url: "/master/agent-grades",
      }),
      providesTags: ["AgentGrade"],
    }),
    createAgentGrade: builder.mutation({
      query: (data) => ({
        url: "/master/agent-grades",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AgentGrade"],
    }),
    updateAgentGrade: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/agent-grades/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AgentGrade"],
    }),
    deleteAgentGrade: builder.mutation({
      query: (id) => ({
        url: `/master/agent-grades/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AgentGrade"],
    }),

    // ─── Garage Master ───
    getAllGarages: builder.query({
      query: () => ({
        url: "/master/garages",
      }),
      providesTags: ["Garage"],
    }),
    createGarage: builder.mutation({
      query: (data) => ({
        url: "/master/garages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Garage"],
    }),
    updateGarage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/garages/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Garage"],
    }),
    deleteGarage: builder.mutation({
      query: (id) => ({
        url: `/master/garages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Garage"],
    }),

    // ─── State Permit Master ───
    getAllStatePermits: builder.query({
      query: () => ({
        url: "/master/state-permits",
      }),
      providesTags: ["StatePermit"],
    }),
    createStatePermit: builder.mutation({
      query: (data) => ({
        url: "/master/state-permits",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StatePermit"],
    }),
    updateStatePermit: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/state-permits/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["StatePermit"],
    }),
    deleteStatePermit: builder.mutation({
      query: (id) => ({
        url: `/master/state-permits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StatePermit"],
    }),

    // ─── State Markup Master ───
    getAllStateMarkups: builder.query({
      query: () => ({
        url: "/master/state-markups",
      }),
      providesTags: ["StateMarkup"],
    }),
    createStateMarkup: builder.mutation({
      query: (data) => ({
        url: "/master/state-markups",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StateMarkup"],
    }),
    updateStateMarkup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/state-markups/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["StateMarkup"],
    }),
    deleteStateMarkup: builder.mutation({
      query: (id) => ({
        url: `/master/state-markups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StateMarkup"],
    }),
    getDefaultCommission: builder.query({
      query: () => ({
        url: "/master/state-markups/default-commission",
      }),
      providesTags: ["StateMarkup", "WebsiteSettings"],
    }),
    updateDefaultCommission: builder.mutation({
      query: (data) => ({
        url: "/master/state-markups/default-commission",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["StateMarkup", "WebsiteSettings"],
    }),
  }),
});

export const {
  useUpdateCityChargesMutation,
  useGetTravelQueryQuery,
  useGetItinerariesQuery,
  useGetItineraryByIdQuery,
  useUpdateItineraryStatusMutation,
  useGetHotelBookingQueriesQuery,
  useGetHotelBookingQueryByIdQuery,
  useUpdateHotelBookingQueryStatusMutation,
  useDeleteHotelBookingQueryMutation,
  useCreateUserMutation,
  useCreateVendorMutation,
  useUpdateActivityPackageMutation,
  useDeleteActivityPackageMutation,
  useToggleActivityPackageStatusMutation,
  useGetCityNamesQuery,
  useGetActivityPackagesQuery,
  useAddActivityPackageMutation,
  useGetWebsiteSettingsQuery,
  useAddWebsiteSettingsMutation,
  useUpdateWebsiteSettingsMutation,
  useAddNewCategoryToTransferMutation,
  useUpdateCategoryFromTransferMutation,
  useGetAllTransfersQuery,
  useAddTransferMutation,
  useToggleCategoryStatusFromTransferMutation,
  useAssignVendorToBookingMutation,
  useRejectBookingMutation,
  useGetAbookingQuery,
  useGetDashboardStatsQuery,
  useAddCarToCategoryMutation,
  useGetBookingStatsQuery,
  useGetRentalPackagesQuery,
  useDeleteRentalPackageMutation,
  useAddRentalPackageMutation,
  useUpdateRentalPackageMutation,
  useDeleteTravelPackageMutation,
  useUpdateTravelPackageMutation,
  useAddTravelPackageMutation,
  useUpdateACarMutation,
  useUpdateAVendorMutation,
  useUpdateAUserMutation,
  useGetCarDetailsQuery,
  useGetCarStatsQuery,
  useGetVendorStatsQuery,
  useGetUserStatsQuery,
  useLazyGetAllCarsQuery,
  useToggleCategoryStatusFromCityMutation,
  useAddNewCityMutation,
  useCheckAdminQuery,
  useGetUserDetailsQuery,
  useAdminLoginMutation,
  useGetCarCategoriesQuery,
  useGetVendorDetailsQuery,
  useGetCitiesQuery,
  useAddCarCategoryMutation,
  useUpdateCarCategoryMutation,
  useLazyGetAllUsersQuery,
  useLazyGetAllVendorsQuery,
  useLazyGetAllBookingsQuery,
  useAddNewCategoryToCityMutation,
  useAdminLogoutMutation,
  useGetAllTravelPackagesQuery,
  useUpdateCategoryFromCityMutation,
  // Route Master
  useGetAllRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  // Rate Master
  useGetAllRatesQuery,
  useCreateRateMutation,
  useUpdateRateMutation,
  useDeleteRateMutation,
  // Charge Master
  useGetAllChargesQuery,
  useCreateChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  // Surcharge Master
  useGetAllSurchargesQuery,
  useCreateSurchargeMutation,
  useUpdateSurchargeMutation,
  useDeleteSurchargeMutation,
  // Agent Grade
  useGetAllAgentGradesQuery,
  useCreateAgentGradeMutation,
  useUpdateAgentGradeMutation,
  useDeleteAgentGradeMutation,
  // Garage Master
  useGetAllGaragesQuery,
  useCreateGarageMutation,
  useUpdateGarageMutation,
  useDeleteGarageMutation,
  // State Permit Master
  useGetAllStatePermitsQuery,
  useCreateStatePermitMutation,
  useUpdateStatePermitMutation,
  useDeleteStatePermitMutation,
  // State Markup Master
  useGetAllStateMarkupsQuery,
  useCreateStateMarkupMutation,
  useUpdateStateMarkupMutation,
  useDeleteStateMarkupMutation,
  useGetDefaultCommissionQuery,
  useUpdateDefaultCommissionMutation,
} = adminApi;
