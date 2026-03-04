import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomListingPage from "./pages/RoomListingPage";
import Accomodation from "./components/Accomodation";
import AccomodationPage from "./pages/AccomodationPage";
import EditProfile from "./components/EditProfile";
import ResetPassword from "./components/ResetPassword";
import TourPlan from "./pages/TourPlanPage";
import TourPackages from "./pages/TourPackages";
import TourDetails from "./pages/TourDetails";
import MyTours from "./pages/MyTours";
import AccomodationDetails from "./pages/AccomodationDetails";
import MyRoomListings from "./pages/MyRoomListings";
import Chat from "./pages/Chat";
import Home from "./pages/home/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AccommodationBooking from "./pages/AccomodationBooking";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import MyBookings from "./pages/MyBookings";
import ScrollToTop from "./components/ScrollToTop";
import PaymentSuccess from "./pages/PaymentSuccessfull";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentCancelled from "./pages/PaymentFailed";

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/room-listing"
            element={
              <ProtectedRoute>
                <RoomListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room-listing/:id"
            element={
              <ProtectedRoute>
                <RoomListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tourPlan"
            element={
              <ProtectedRoute>
                <TourPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tourPlan/:id"
            element={
              <ProtectedRoute>
                <TourPlan />
              </ProtectedRoute>
            }
          />
          <Route path="/tourPackages" element={<TourPackages />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/accomodation" element={<AccomodationPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/resetPassword/:id/:token" element={<ResetPassword />} />
          <Route path="/tour/:id" element={<TourDetails />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route
            path="/my-tours"
            element={
              <ProtectedRoute>
                <MyTours />
              </ProtectedRoute>
            }
          />
          <Route path="/accomodation/:id" element={<AccomodationDetails />} />
          <Route
            path="/accommodation/:id/book"
            element={<AccommodationBooking />}
          />
          <Route
            path="/myBookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myRoomListings"
            element={
              <ProtectedRoute>
                <MyRoomListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:contactId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
