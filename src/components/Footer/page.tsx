import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 bg-blue md:grid-cols-4 gap-8">
        {/* Logo and Description */}
        <div>
          <h2 className="text-2xl font-bold text-orange-500 mb-3">CONNECT TO WORLD</h2>
          <p className="text-gray-600 text-sm">
            Building seamless digital experiences through design and technology.
          </p>
          <div className="flex space-x-4 mt-5">
            <a href="#" className="text-gray-500 hover:text-orange-500 transition">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-orange-500 transition">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-orange-500 transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-orange-500 transition">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-orange-500">About</a></li>
            <li><a href="#" className="hover:text-orange-500">Blog</a></li>
            <li><a href="#" className="hover:text-orange-500">Pages</a></li>
            <li><a href="#" className="hover:text-orange-500">Contact</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-orange-500">Help Center</a></li>
            <li><a href="#" className="hover:text-orange-500">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-orange-500">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-orange-500">Support</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Join Our Newsletter</h3>
          <p className="text-gray-600 text-sm mb-4">
            Get the latest design insights and updates delivered straight to your inbox.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 mt-8 py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} UIUX Design Labs. All rights reserved.
      </div>
    </footer>
  );
}
