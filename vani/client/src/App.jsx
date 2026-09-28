import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Product from './pages/Product';
import UseCases from './pages/UseCases';
import About from './pages/About';
import Auth from './pages/Auth';
import Vani from './pages/Vani';
import Dictionary from './pages/Dictionary';
import TeachAdmin from './pages/TeachAdmin';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/vani" element={<Vani />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/teach-admin" element={<TeachAdmin />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/usecases" element={<Navigate to="/use-cases" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}