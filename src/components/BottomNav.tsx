
import React from 'react';
import { Link, useLocation } from 'react-router';
import { Home, PlusSquare, User } from 'lucide-react';

export function BottomNav() {
  const ort = useLocation();

  const istAktiv = (pfad: string) => {
    return ort.pathname === pfad ||
      (pfad !== '/' && ort.pathname.startsWith(pfad));
  };

  const navigationElemente = [
    { pfad: '/',        symbol: Home,       bezeichnung: 'Start'     },
    { pfad: '/create',  symbol: PlusSquare, bezeichnung: 'Erstellen' },
    { pfad: '/profile', symbol: User,       bezeichnung: 'Profil'    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 z-50">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {navigationElemente.map(({ pfad, symbol: Symbol, bezeichnung }) => {
            const aktiv = istAktiv(pfad);
            return (
              <Link
                key={pfad}
                to={pfad}
                className="flex flex-col items-center gap-1 py-2 px-6"
              >
                <Symbol
                  className={`w-6 h-6 ${aktiv ? 'text-blue-600' : 'text-gray-500'}`}
                />
                <span
                  className={`text-xs font-semibold ${aktiv ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  {bezeichnung}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
