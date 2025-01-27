export const HomePageFooter = () => {
  return (
    <footer className="mt-16 sm:mt-32 bg-gray-800 text-white w-full">
      <div className="w-full px-4  py-8 ">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">Uplearn</h3>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Empowering learners worldwide with accessible and engaging online
              education.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {["Home", "Courses", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold">Follow Us</h3>
            <div className="flex flex-col space-y-2 sm:space-y-3">
              {["Facebook", "Twitter", "LinkedIn", "Instagram"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {social}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold">Contact Us</h3>
            <div className="space-y-2 sm:space-y-3 text-gray-400">
              <p className="flex items-center text-sm sm:text-base">
                <span className="mr-2">📧</span>
                support@uplearn.com
              </p>
              <p className="flex items-center text-sm sm:text-base">
                <span className="mr-2">📱</span>
                +1 (123) 456-7890
              </p>
              <p className="flex items-center text-sm sm:text-base">
                <span className="mr-2">📍</span>
                123 Learning Street, Education City
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} Uplearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
