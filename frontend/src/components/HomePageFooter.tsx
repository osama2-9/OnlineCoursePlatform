
export const HomePageFooter = () => {
  return (
    <div className="mt-32 bg-gray-800 text-white py-12">
      <div className="container ml-2 md:ml-20 mx-auto flex flex-wrap justify-between">
        <div className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <h3 className="text-xl font-bold mb-4">Uplearn</h3>
          <p className="text-gray-400">
            Empowering learners worldwide with accessible and engaging online
            education.
          </p>
        </div>
        <div className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="text-gray-400">
            <li className="mb-2">
              <a href="#" className="hover:text-orange-500">
                Home
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-orange-500">
                Courses
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-orange-500">
                About Us
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-orange-500">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-orange-500">
              Facebook
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-500">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-500">
              LinkedIn
            </a>
          </div>
        </div>
        <div className="w-full lg:w-1/4">
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="text-gray-400">Email: support@uplearn.com</p>
          <p className="text-gray-400">Phone: +1 (123) 456-7890</p>
        </div>
      </div>
    </div>
  );
};
