export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-6 mt-auto bg-gray-900/50 border-t border-gray-700">
      <div className="container px-4 mx-auto text-center text-gray-400">
        <p>&copy; {currentYear} ini Footer.</p>
        <p className="mt-1 text-sm">
        </p>
      </div>
    </footer>
  );
}