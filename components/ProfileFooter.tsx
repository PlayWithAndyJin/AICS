export default function ProfileFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-2 text-center text-sm text-gray-600 dark:text-gray-300">
        {year} | Built By AndyJin
      </div>
    </footer>
  )
} 