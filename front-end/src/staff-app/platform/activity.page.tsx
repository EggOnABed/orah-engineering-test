import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"

export const ActivityPage: React.FC = () => {
  const [getActivities, activityData] = useApi<{ activity: Activity[] }>({ url: "get-activities" })
  const [activity, setActivity] = useState(activityData?.activity)

  useEffect(()=>{
    if(activityData?.activity){
      console.log(activityData.activity)
      setActivity(activityData.activity)
    }
  },[activityData])

  useEffect(()=>{
    getActivities()
  },[getActivities])

  return <S.Container>
    {
      activity?.length! > 0 ? <>
        {
          activity?.map(item=>{
            return <div>
              <span>Time</span>
              <div>
                
              </div>
            </div>
          })
        }
      </> : <S.NoActivity>No Activity as yet. Looks like holidays.</S.NoActivity>
    }
  </S.Container>
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50vw;
    margin: 5vh auto 0;
  `,
  NoActivity: styled.span`
    display: flex;
    justify-content: center;
    margin-top: 30vh;
    font-size: 35px;
    font-weight: 200;
    word-spacing: 5px;
  `
}
