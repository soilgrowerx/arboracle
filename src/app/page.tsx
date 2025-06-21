export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌳</div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">Arboracle</h1>
                <p className="text-sm text-green-600">Your Digital Tree Inventory</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-12 shadow-lg">
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">MVP v0.0.1</h2>
            <p className="text-lg text-green-700 mb-6">
              Arboracle is successfully deployed and running!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-600 text-sm">
                This is a simplified version for initial deployment. The full tree inventory 
                features will be available in upcoming releases.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🌳</span>
              <span className="text-lg font-semibold">Arboracle</span>
            </div>
            <p className="text-green-200 text-sm">
              Building a sustainable future, one tree at a time
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}