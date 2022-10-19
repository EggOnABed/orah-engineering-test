import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import * as moment from 'moment'
import ActivityDetailsPopup from "elements/modal"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const ActivityPage: React.FC = () => {
  // GET mock-API for fetching activities data on initial page load
  const [getActivities, activityData, loaderState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })
  const [activity, setActivity] = useState(activityData?.activity)
  // state to show modal if user clicks on any activity row
  const [showModalId, setShowModalId] = useState(-1)

  // update activity state if response from mock-API received
  useEffect(()=>{
    if(activityData?.activity){
      setActivity(activityData.activity)
    }
  },[activityData])

  // call mock-API on initial page-load
  useEffect(()=>{
    getActivities()
  },[getActivities])

  // logic to count no. of 'present', 'late' & 'absent' students
  function reducer(source:any, reduceBy:string){
    return !!source ? source.reduce((total:any,current:any)=>{ return total + (current.roll_state === reduceBy ? 1 : 0) },0) : null
  }

  return <S.Container>
    { 
      loaderState === "loading" && (
        <CenteredContainer>
          <FontAwesomeIcon icon="spinner" size="2x" spin />
        </CenteredContainer>
      )
    }
    {
      loaderState === "loaded" && (
        activity?.length! > 0 ? <>
          {
            activity?.map(item=>{
              return <S.ActivityList key={ JSON.stringify(item.date) } onClick={()=> { setShowModalId(item.entity.id) }}>
                <S.Time>{ moment(item.date).format('LLL') }</S.Time>
                <RollStateList
                  stateList={[
                    { type: "all", count : item.entity?.student_roll_states?.length },
                    { type: "present", count: reducer(item.entity.student_roll_states, 'present') },
                    { type: "late", count: reducer(item.entity.student_roll_states, 'late') },
                    { type: "absent", count: reducer(item.entity.student_roll_states, 'absent') },
                  ]}
                />
                {
                  showModalId === item.entity.id ? <ActivityDetailsPopup data={item.entity.student_roll_states} setShowModalId={setShowModalId}/> : null
                } 
              </S.ActivityList>
            })
          }
        </> : <S.NoActivity>No Activity as yet. Looks like holidays.</S.NoActivity>
      )
    }
    {
      loaderState === "error" && (
        <CenteredContainer>
          <div>Failed to load</div>
        </CenteredContainer>
      )
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
