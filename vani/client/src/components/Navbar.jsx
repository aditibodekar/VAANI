
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Hand,
  Sparkles,
  LogOut,
  User,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Product", path: "/product" },
  { name: "VAANI", path: "/vani", badge: "Live Studio" },
  { name: "ISL Dictionary", path: "/dictionary" },
  { name: "Use Cases", path: "/use-cases" },
  { name: "About", path: "/about" },
];

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`navbar ${scrolled ? "scrolled" : ""}`}
    >
      <div className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="vani-logo">
          <motion.div
            className="logo-icon"
            whileHover={{ rotate: 10, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Hand size={22} strokeWidth={2.5} />
          </motion.div>

          <div className="logo-text">
            <span>VAANI</span>
            <small>Sign Beyond Words</small>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="navbar-actions">
          {/* THEME TOGGLE BUTTON */}
          <motion.button
            className="theme-button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {darkMode ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={19} className="theme-icon-sun" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={19} className="theme-icon-moon" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* AUTH STATUS / SIGN IN */}
          {user ? (
            <div className="user-profile-badge">
              <div className="user-avatar-circle">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="user-firstname">
                {user.name ? user.name.split(" ")[0] : "Account"}
              </span>
              <button
                className="user-logout-btn"
                onClick={logout}
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="login-button">
              Sign In
            </Link>
          )}

          {/* GET STARTED CTA */}
          <Link to="/vani" className="navbar-cta">
            <Sparkles size={15} />
            <span>Launch Vani</span>
            <ArrowRight size={15} />
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-nav"
          >
            <div className="mobile-nav-inner">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="mobile-nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}

              <div className="mobile-nav-actions">
                {user ? (
                  <div className="mobile-user-row">
                    <div className="user-profile-badge">
                      <div className="user-avatar-circle">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <button
                      className="btn-danger-text"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="mobile-signin"
                  >
                    Sign In or Create Account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


