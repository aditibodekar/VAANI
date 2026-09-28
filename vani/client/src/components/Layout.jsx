import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="vani-app-root">
      <Navbar />
      <main className="vani-main-content">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}


