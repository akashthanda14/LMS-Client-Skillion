export default function TestRedirectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600">🎉 Redirect Test Success!</h1>
        <p className="text-xl text-gray-700 mt-4">
          If you see this page, the redirect is working!
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}
        </p>
      </div>
    </div>
  );
}
