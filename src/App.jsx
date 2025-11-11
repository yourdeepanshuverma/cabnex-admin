import { Navigate, Route, Routes } from "react-router";
import AdminLayout from "./components/Layouts/AdminLayout";
import Protected from "./components/protected";

import { lazy } from "react";
import { NotFound } from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const TravelPackages = lazy(() => import("./pages/TravelPackages"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const CarProfile = lazy(() => import("./pages/CarProfile"));
const Users = lazy(() => import("./pages/Users"));
const VendorProfile = lazy(() => import("./pages/VendorProfile"));
const Vendors = lazy(() => import("./pages/Vendors"));
const Cars = lazy(() => import("./pages/Cars"));
const Bookings = lazy(() => import("./pages/Bookings"));
const CarCategories = lazy(() => import("./pages/CarCategories"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const CategoryView = lazy(() => import("./pages/CategoryView"));
const City = lazy(() => import("./pages/City"));
const CityView = lazy(() => import("./pages/CityView"));
const RentalPackages = lazy(() => import("./pages/RentalPackages"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));
const Transfer = lazy(() => import("./pages/Transfer"));
const TransferView = lazy(() => import("./pages/TransferView"));
const WebsiteSetting = lazy(() => import("./pages/WebsiteSetting"));
const ActivityPackages = lazy(() => import("./pages/ActivityPackages"));
const ActivityPackageDetails = lazy(
  () => import("./pages/ActivityPackageDetails"),
);
const CreateProfiles = lazy(() => import("./pages/CreateProfiles"));

const App = () => {
  return (
    <Routes>
      <Route
        element={
          <Protected authentication={true}>
            <AdminLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route index path="/dashboard" element={<Dashboard />} />
        <Route path="/travel-packages" element={<TravelPackages />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/profile/:id" element={<VendorProfile />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/profile/:id" element={<UserProfile />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/city" element={<City />} />
        <Route path="/city/:id" element={<CityView />} />
        <Route path="/car-categories" element={<CarCategories />} />
        <Route path="/car-categories/:id" element={<CategoryView />} />
        <Route path="/cars/profile/:id" element={<CarProfile />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/rental-packages" element={<RentalPackages />} />
        <Route path="/transfers" element={<Transfer />} />
        <Route path="/transfers/:id" element={<TransferView />} />
        <Route path="/activity-packages" element={<ActivityPackages />} />
        <Route
          path="/activity-packages/:id"
          element={<ActivityPackageDetails />}
        />
        <Route path="/settings" element={<WebsiteSetting />} />
        <Route path="/create-profiles" element={<CreateProfiles />} />
      </Route>
      <Route
        path="/login"
        element={
          <Protected authentication={false}>
            <AdminLogin />
          </Protected>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
