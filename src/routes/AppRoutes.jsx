import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Orders from '../pages/Orders';
import Notifications from '../pages/Notifications';
import Feedback from '../pages/Feedback';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import Products from '../pages/Products';
import Settings from '../pages/Settings';
import EmailUsers from '../pages/EmailUsers';
import EmailHistory from '../pages/EmailHistory';
import Riders from '../pages/Riders';
import Designers from '../pages/Designers';

const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <DashboardLayout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'users', element: <Users /> },
                    { path: 'orders', element: <Orders /> },
                    { path: 'notifications', element: <Notifications /> },
                    { path: 'feedback', element: <Feedback /> },
                    { path: 'products', element: <Products /> },
                    { path: 'settings', element: <Settings /> },
                    { path: 'email-users', element: <EmailUsers /> },
                    { path: 'email-history', element: <EmailHistory /> },
                    { path: 'riders', element: <Riders /> },
                    { path: 'designers', element: <Designers /> },

                ],
            },
        ],
    },
    { path: '/login', element: <Login /> },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;