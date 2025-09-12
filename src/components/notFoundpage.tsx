import notFoundImg from "../assets/notfound page.png"; 

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
      <img
        src={notFoundImg}
        alt="Not Found"
        className="w-80 h-auto mb-6"
      />
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-gray-500 mt-2">The page you’re looking for doesn’t exist.</p>
    </div>
  );
};

export default NotFoundPage;
