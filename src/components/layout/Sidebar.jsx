import { NavLink } from 'react-router-dom';

import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Pill,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
} from 'lucide-react';

import { getAuthSession } from '../../utils/authStorage';

const mainMenu = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Medicines',
    path: '/medicines',
    icon: Pill,
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: Boxes,
  },
  {
    title: 'Sales / POS',
    path: '/sales',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: Users,
  },
  {
    title: 'Suppliers',
    path: '/suppliers',
    icon: Truck,
  },
  {
    title: 'Purchases',
    path: '/purchases',
    icon: ClipboardList,
  },
  {
    title: 'Expiry Tracking',
    path: '/expiry',
    icon: CalendarClock,
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Employees',
    path: '/employees',
    icon: UserCog,
  },
  {
    title: 'Notifications',
    path: '/notifications',
    icon: Bell,
  },
];

function Sidebar() {
  const session = getAuthSession();

  const userName =
    session?.name || 'MediCore Pharmacist';

  const userInitials = userName
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={23} />
          </div>

          <div className="brand-text">
            <h1>MediCore</h1>
            <span>Pharmacy Management</span>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="sidebar-content">
        <div className="sidebar-section">
          <span className="section-label">
            MAIN MENU
          </span>

          <nav className="sidebar-nav">
            {mainMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-item ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  <Icon size={18} />

                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? 'active' : ''
            }`
          }
        >
          <Settings size={18} />

          <span>Settings</span>
        </NavLink>

        <div className="sidebar-user">
          <div className="user-avatar">
            {userInitials}
          </div>

          <div className="sidebar-user-info">
            <strong>{userName}</strong>

            <span>
              Pharmacy Staff
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;