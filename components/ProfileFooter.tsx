export default function ProfileFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
        <span>{year} | Built By AndyJin</span>
        <iframe 
          src="https://status.andyjin.website/badge?theme=system" 
          width="150" 
          height="30" 
          frameBorder="0" 
          scrolling="no" 
          style={{ colorScheme: 'normal', marginLeft: '30px' }}
        ></iframe>
      </div>
    </footer>
  )
} 
