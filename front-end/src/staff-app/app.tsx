import React, { useState } from "react"
import { Routes, Route } from "react-router-dom"
import "shared/helpers/load-icons"
import { Header } from "staff-app/components/header/header.component"
import { HomeBoardPage } from "staff-app/daily-care/home-board.page"
import { ActivityPage } from "staff-app/platform/activity.page"

import { createContext } from "react";

interface AppContextInterface {
  appData: AppDataI;
  updateAppData: Function
}

interface Attendance{
  present: boolean,
  late: boolean,
  absent: boolean
}

interface AppDataI {
  attendanceState?: Attendance[]
}

export const AppCtx = createContext<AppContextInterface | null>(null);

function App() {
  const [appData, setAppData] = useState({})

  const updateAppData = (item) => {
    setAppData(oldObj => {
        return { ...oldObj, ...item }
    });
}

  return (
    <>
      <AppCtx.Provider value={ { appData, updateAppData } }>
        <Header />
        <Routes>
          <Route path="daily-care" element={<HomeBoardPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="*" element={<div>No Match</div>} />
        </Routes>
      </AppCtx.Provider>
    </>
  )
}

export default App
