import { Outlet } from 'react-router'
import { ScrollRestoration } from 'react-router'
const RootLayout = () => {
  return (
    <div>
      <ScrollRestoration />
        <Outlet />
    </div>
  )
}

export default RootLayout