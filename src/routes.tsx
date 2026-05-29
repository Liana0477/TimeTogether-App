

import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { AuthAnbieter } from './services/useAuth';
import { AktivitaetenAnbieter } from './services/useActivities';
import { Anmeldeseite } from './pages/LoginPage';
import { Registrierungsseite } from './pages/RegisterPage';
import { Startseite } from './pages/HomePage';
import { AktivitaetErstellenSeite } from './pages/CreateActivityPage';
import { AktivitaetDetailSeite } from './pages/ActivityDetailPage';
import { Profilseite } from './pages/ProfilePage';
import { authService } from './services/authService';

// Anbieter-Wrapper als Wurzel-Layout = damit Context und Router
// im selben React-Baum leben (Hot Reload / React Refresh)
function Wurzel() {
  return (
    <AuthAnbieter>
      <AktivitaetenAnbieter>
        <Outlet />
      </AktivitaetenAnbieter>
    </AuthAnbieter>
  );
}

// Leitet zur Anmeldeseite weiter, wenn kein Nutzer eingeloggt ist
function GeschuetzteRoute({ children }: { children: React.ReactNode }) {
  if (!authService.istAngemeldet()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Wurzel,
    children: [
      // ÖFFENTLICHE ROUTEN
      { path: 'login',    Component: Anmeldeseite         },
      { path: 'register', Component: Registrierungsseite  },

      // GESCHÜTZTE ROUTEN
      {
        index: true,
        element: <GeschuetzteRoute><Startseite /></GeschuetzteRoute>
      },
      {
        path: 'create',
        element: <GeschuetzteRoute><AktivitaetErstellenSeite /></GeschuetzteRoute>
      },
      {
        path: 'activity/:id',
        element: <GeschuetzteRoute><AktivitaetDetailSeite /></GeschuetzteRoute>
      },
      {
        path: 'profile',
        element: <GeschuetzteRoute><Profilseite /></GeschuetzteRoute>
      },
      {
        path: 'profile/:userId',
        element: <GeschuetzteRoute><Profilseite /></GeschuetzteRoute>
      },
    ]
  }
]);
