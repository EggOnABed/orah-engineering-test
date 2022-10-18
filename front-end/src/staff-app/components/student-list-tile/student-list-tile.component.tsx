import React, { useContext, useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Images } from "assets/images"
import { Colors } from "shared/styles/colors"
import { Person, PersonHelper } from "shared/models/person"
import { RollStateSwitcher } from "staff-app/components/roll-state/roll-state-switcher.component"
import { AppCtx } from "staff-app/app"

interface Props {
  isRollMode?: boolean
  student: any, 
  freshAttendance: boolean,
  editable: boolean
}
export const StudentListTile: React.FC<Props> = ({ editable = true, isRollMode, student, freshAttendance = false }) => {
  const appContext = useContext(AppCtx)
  const appDataSource = (appContext?.appData?.students?.filter(item=>{ return item.id === student.id }))
  const initialState = freshAttendance ? 'unmark' : (appDataSource?.length > 0 ? appDataSource[0]?.attendanceState : student.roll_state)
  const [state, setState] = useState(initialState);
  
  useEffect(()=>{
    const updatedStudentList = appContext?.appData.students?.map(obj=>{
      if(obj.id === student.id){
        return {...obj, attendanceState: state}
      }
      else{
        return obj
      }
    })
    appContext?.updateAppData({students: updatedStudentList})
  },[state])

  return (
    <S.Container style={{pointerEvents: editable ? 'all' : 'none'}}>
      <S.Avatar url={Images.avatar}></S.Avatar>
      <S.Content>
        <div>{PersonHelper.getFullName(student)}</div>
      </S.Content>
      {isRollMode && (
        <S.Roll>
          <RollStateSwitcher initialState={freshAttendance ? initialState : state} onStateChange={setState} />
        </S.Roll>
      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    margin-top: ${Spacing.u3};
    padding-right: ${Spacing.u2};
    display: flex;
    height: 60px;
    border-radius: ${BorderRadius.default};
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;
    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Avatar: styled.div<{ url: string }>`
    width: 60px;
    background-image: url(${({ url }) => url});
    border-top-left-radius: ${BorderRadius.default};
    border-bottom-left-radius: ${BorderRadius.default};
    background-size: cover;
    background-position: 50%;
    align-self: stretch;
  `,
  Content: styled.div`
    flex-grow: 1;
    padding: ${Spacing.u2};
    color: ${Colors.dark.base};
    font-weight: ${FontWeight.strong};
  `,
  Roll: styled.div`
    display: flex;
    align-items: center;
    margin-right: ${Spacing.u4};
  `,
}
