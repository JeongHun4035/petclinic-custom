import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from '@/layouts/Layout/Layout'
import NotFound from '@/NotFound'
import Dashboard from '@/pages/Dashboard/Dashboard'
import ConfirmPage from '@/pages/Examples/children/Confirm'
import PopupPage from '@/pages/Examples/children/Popup'
import SelectPage from '@/pages/Examples/children/Select'
import ExampleDetail from '@/pages/Examples/ExampleDetail'
import Examples from '@/pages/Examples/Examples'
import SignIn from '@/pages/Sign/Sign-in'
import { ROUTE_PATHS } from '@/routes/route'

const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={ROUTE_PATHS.SIGN_IN} replace />} />
      <Route
        path={ROUTE_PATHS.SIGN_IN}
        element={<SignIn />}
      />
      {/* 레이아웃 라우트 */}
      <Route element={<Layout />}>
        {/* 예: /home -> / 리다이렉트 */}
        {/* <Route index element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} /> */}
        <Route
          path={ROUTE_PATHS.DASHBOARD}
          element={<Dashboard />}
        />
        <Route
          path={ROUTE_PATHS.EXAMPLES}
          element={<Examples />}
        />
        <Route path="/examples" element={<ExampleDetail />} >
          <Route
            path="select"
            element={<SelectPage />}
          />
          <Route
            path="popup"
            element={<PopupPage />}
          />
          <Route
            path="confirm"
            element={<ConfirmPage />}
          />
        </Route>
        {/* 404 */}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter