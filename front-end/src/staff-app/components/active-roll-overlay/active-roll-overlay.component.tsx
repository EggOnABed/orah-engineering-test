import React, { useContext, useEffect, useState } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/Button"
import { BorderRadius, Spacing } from "shared/styles/styles"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import { AppCtx } from "staff-app/app"

export type ActiveRollAction = "filter" | "exit"
interface Props {
  isActive: boolean
  onItemClick: (action: ActiveRollAction, value?: string) => void,
  setStudentData: Function,
  setFreshAttendance: Function
}

export const ActiveRollOverlay: React.FC<Props> = React.memo((props) => {
  const appContext = useContext(AppCtx)
  const { isActive, onItemClick } = props

  // logic to count no. of present, late & absent students
  function reducer(dataSource: any, reduceBy: string){
    return dataSource?.reduce((total:number, currentValue:any)=>{
      return total + (currentValue.attendanceState === reduceBy ? 1 : 0)
    },0) || 0
  }

  // states to manage count of student roll-states
  const [all, setAll] = useState(appContext?.appData.students?.length || 0)
  const [present, setPresent] = useState(reducer(appContext?.appData.students, 'present'))
  const [late, setLate] = useState(reducer(appContext?.appData.students, 'late'))
  const [absent, setAbsent] = useState(reducer(appContext?.appData.students, 'absent'))
  // filterDataBy can be '', 'present', 'late' or 'absent'
  const [filterDataBy, setFilterDataBy] = useState('')

  // update states if appContext changed by change of roll-states by user from home-board component
  useEffect(()=>{
    setAll(appContext?.appData.students?.length || 0)
    setPresent(reducer(appContext?.appData.students, 'present'))
    setLate(reducer(appContext?.appData.students, 'late'))
    setAbsent(reducer(appContext?.appData.students, 'absent'))
  },[appContext])

  // if user clicks on any roll-state icons in footer to filter results by that roll-state
  useEffect(()=>{
    props.setFreshAttendance(false)
    props?.setStudentData({ students: filterDataBy === 'all' ? appContext?.appData.students : appContext?.appData.students?.filter((student:any)=>{
        if(student.attendanceState === filterDataBy){
          return student
        }
      }) 
    })
  },[filterDataBy])

  function filterHandler(){
    onItemClick("filter")
  }

  function exitHandler(){
    onItemClick("exit")
  }

  return (
    <S.Overlay isActive={isActive}>
      <S.Content>
        <div>Class Attendance</div>
        <div>
          <RollStateList
            stateList={[
              { type: "all", count : all! },
              { type: "present", count: present },
              { type: "late", count: late },
              { type: "absent", count: absent },
            ]}
            onItemClick={setFilterDataBy}
          />
          <div style={{ marginTop: Spacing.u6 }}>
            <Button color="inherit" onClick={exitHandler}>
              Exit
            </Button>
            <Button color="inherit" style={{ marginLeft: Spacing.u2 }} onClick={filterHandler}>
              Complete
            </Button>
          </div>
        </div>
      </S.Content>
    </S.Overlay>
  )
})

const S = {
  Overlay: styled.div<{ isActive: boolean }>`
    position: fixed;
    bottom: 0;
    left: 0;
    height: ${({ isActive }) => (isActive ? "120px" : 0)};
    width: 100%;
    background-color: rgba(34, 43, 74, 0.92);
    backdrop-filter: blur(2px);
    color: #fff;
  `,
  Content: styled.div`
    display: flex;
    justify-content: space-between;
    width: 52%;
    height: 100px;
    margin: ${Spacing.u3} auto 0;
    border: 1px solid #f5f5f536;
    border-radius: ${BorderRadius.default};
    padding: ${Spacing.u4};
  `,
}
