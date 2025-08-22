export default function HMSPrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Modern Blog - HarmonyOS端用户隐私协议</title>
        <meta name="description" content="Modern Blog APP HarmonyOS端用户隐私协议" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 