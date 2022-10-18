import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import * as moment from 'moment'
import { Roll } from "shared/models/roll"

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

  function reducer(source:any, reduceBy:string){
    return source.reduce((total:any,current:any)=>{ return total + (current.roll_state === reduceBy ? 1 : 0) },0)
  }

  return <S.Container>
    {
      activity?.length! > 0 ? <>
        {
          activity?.map(item=>{
            return <S.ActivityList key={ JSON.stringify(item.date) }>
              <S.Time>{ moment(item.date).format('LLL') }</S.Time>
              <RollStateList
                stateList={[
                  { type: "all", count : item.entity.student_roll_states.length },
                  { type: "present", count: reducer(item.entity.student_roll_states, 'present') },
                  { type: "late", count: reducer(item.entity.student_roll_states, 'late') },
                  { type: "absent", count: reducer(item.entity.student_roll_states, 'absent') },
                ]}
              />
            </S.ActivityList>
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
    margin: 10vh auto 0;
  `,
  NoActivity: styled.span`
    display: flex;
    justify-content: center;
    margin-top: 30vh;
    font-size: 35px;
    font-weight: 200;
    word-spacing: 5px;
  `,
  ActivityList: styled.div`
    height: 100px;
    font-size: 20px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    border-bottom: solid 0.5px;
    padding: 10px;
    cursor: pointer;
    &:hover{
      background-color: gainsboro;
    }
  `,
  Time: styled.span`
    margin: auto;
    margin-left: 0;
  `
}
