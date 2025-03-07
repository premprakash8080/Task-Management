import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MainHeader() {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "Customers", href: "/customers" },
    { label: "Blog", href: "/blog" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 bg-blue-600 rounded-lg"
            />
            <span className="text-xl font-semibold">TaskMaster</span>
          </Link>
          <ul className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden md:block text-sm text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => navigate("/login")}
          >
            Log in
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/signup")}
          >
            Start Free Trial
          </motion.button>
        </div>
      </nav>
    </header>
  );
}