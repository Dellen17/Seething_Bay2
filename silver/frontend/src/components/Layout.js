import React, { useState, useCallback, useRef } from 'react'; // Added useRef
import Navbar from './Navbar';
import SideNav from './SideNav';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toggleMobileSidebar, setToggleMobileSidebar] = useState(() => () => {});

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Add a ref to the main-content div
  const mainContentRef = useRef(null);

  return (
    <div className="layout-container">
      <SideNav
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setToggleMobileSidebar={setToggleMobileSidebar}
      />
      <div className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`} ref={mainContentRef}>
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;