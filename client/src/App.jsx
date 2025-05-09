import { useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import buildsService from './services/builds';
import { clearAnonymousUserId, getAnonymousUserId } from './services/anonymousUserId';

import AuthContext from './context/AuthContext';

import Explorer from './pages/Explorer/Explorer';
import Profile from './pages/Profile/Profile';
import Register from './pages/Auth/Register/Register';
import Login from './pages/Auth/Login/Login';
import DS2Planner from './pages/Planners/DS2Planner/DS2Planner';
import DS3Planner from './pages/Planners/DS3Planner/DS3Planner';
import ERPlanner from './pages/Planners/ERPlanner/ERPlanner';
import DS1PlannerLayout from './components/layouts/DS1PlannerLayout';
import DS2PlannerLayout from './components/layouts/DS2PlannerLayout';
import DS3PlannerLayout from './components/layouts/DS3PlannerLayout';
import ERPlannerLayout from './components/layouts/ERPlannerLayout';
import Home from './pages/Home/Home';
import Sidebar from './components/Sidebar/Sidebar';
import SelectPlanner from './pages/SelectPlanner/SelectPlanner';
import NoPage from './pages/NoPage/NoPage';
import DS1Create from './pages/Planners/DS1Planner/DS1Create';
import DS1Edit from './pages/Planners/DS1Planner/DS1Edit';

const App = () => {
  const { setAuthInfo } = useContext(AuthContext);

  useEffect(() => {
    const userInfo = window.localStorage.getItem('userInfo');
    if (userInfo) {
      const newAuthInfo = JSON.parse(userInfo);
      setAuthInfo(newAuthInfo);
      buildsService.setToken(newAuthInfo.token);
      clearAnonymousUserId();
    } else {
      getAnonymousUserId();
    }
  }, [setAuthInfo]);

  return (
    <>
      <Sidebar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />

        <Route path="login" element={<Login />} />
        <Route path="profile">
          <Route index element={<Profile />} />
          <Route path=":id" element={<Profile />} />
        </Route>

        <Route path="planner">
          <Route index element={<SelectPlanner />} />

          <Route element={<DS1PlannerLayout />}>
            <Route path="dark-souls-1" element={<DS1Create />} />
            <Route path="dark-souls-1/:id" element={<DS1Edit />} />
          </Route>

          <Route path="dark-souls-2" element={<DS2PlannerLayout />}>
            <Route index element={<DS2Planner />} />
            <Route path=":id" element={<DS2Planner />} />
          </Route>

          <Route path="dark-souls-3" element={<DS3PlannerLayout />}>
            <Route index element={<DS3Planner />} />
            <Route path=":id" element={<DS3Planner />} />
          </Route>

          <Route path="elden-ring" element={<ERPlannerLayout />}>
            <Route index element={<ERPlanner />} />
            <Route path=":id" element={<ERPlanner />} />
          </Route>
        </Route>

        <Route path="explorer" element={<Explorer />} />

        <Route path="*" element={<NoPage />} />
      </Routes>
    </>
  );
};

export default App;
