import React, { useState, useEffect, useContext } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BasicMenu from "elements/popup-menu/index"
import { AppCtx } from "staff-app/app"

export const HomeBoardPage: React.FC = () => {
  const appContext = useContext(AppCtx)
  const [isRollMode, setIsRollMode] = useState(false)
  const [freshAttendance, setFreshAttendance] = useState(false)

  const [saveActiveRoll, rollSaveData] = useApi<{ success: boolean }>({ url: "save-roll" })
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  
  const [studentData, setStudentData] = useState(data)

  // on initial page-load, call mock-API & fetch student data
  useEffect(() => {
    void getStudents()
  }, [getStudents])

  // on initial page-load, fill data in context API & studentData 
  useEffect(()=>{
    setStudentData(data)
    appContext?.updateAppData({ students : data?.students.map(student=>{
      return {
        ...student, attendanceState: 'unmark'
      }
    })})
  },[data])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setFreshAttendance(true)
      const unmarkedStudentData = appContext?.appData?.students?.map(student=>{
        student.attendanceState = 'unmark'
        return student
      })
      console.log(unmarkedStudentData)
      appContext?.updateAppData({ students: unmarkedStudentData })
      setIsRollMode(true) 

      // setTimeout(()=>{
      //   setFreshAttendance(false)
      // },1000)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if(action === "filter"){
      const packet = { 
        student_roll_states: appContext?.appData.students?.map(student=>{
          return {
            student_id: student.id, 
            roll_state: student.attendanceState
          }
        })
      }
      // call POST API to save roll data on backend (in local storage)
      saveActiveRoll(packet)
    }
    setIsRollMode(false)
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} data={data!} studentData={studentData!} getStudents={getStudents} setStudentData={setStudentData}/>

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {studentData?.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} freshAttendance={freshAttendance}/>
            ))}
            {
              studentData?.students.length === 0 ? <S.NoStudentFound>No such student in class</S.NoStudentFound> : null
            }
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} setStudentData={setStudentData}/>
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void,
  studentData: { students: Person[]; },
  data: { students: Person[]; },
  getStudents: Function,
  setStudentData: Function
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [showSortingPopup, setShowSortingPopup] = useState(null)
  const [sortingDirectionAscending, setSortingDirection] = useState(true)
  const [searchFieldValue, setSearchFieldValue] = useState('')
  const { onItemClick } = props;

  function handleSearch(value: string){
    setSearchFieldValue(value)
    // start filtering by names only if search length > 2
    if(value.length > 2){
      const dataSource = props.studentData.students.length > 0 ? props.studentData.students : props.data.students
      const students = dataSource.filter(student=>{
        return student.first_name.toLowerCase().includes(value.toLowerCase()) || student.last_name.toLowerCase().includes(value.toLowerCase()) || 
        (student.first_name.toLowerCase() + ' ' + student.last_name.toLowerCase()).includes(value.toLowerCase())
      })
      props.setStudentData({
        students: students, type: 'success'
      })
    }
    // fill previous unfiltered data back if search length <= 2
    else{
      props.setStudentData({
        students: props.data.students, type: 'success'
      })
    }
  }

  function handleMenuPopup(targetElement: any, sortBy: string = 'first_name'){
    // some sorting has been done via onClick on menu-options
    if(!targetElement){
      props.data.students.sort((a,b)=>{
        if ( a[sortBy] < b[sortBy] ){
          return sortingDirectionAscending ? 1 : -1;
        }
        if ( a[sortBy] > b[sortBy] ){
          return sortingDirectionAscending ? -1 : 1;
        }
        return 0;
      })
      // Change arrow direction to opposite of the currentlt sorted direction
      setSortingDirection(!sortingDirectionAscending)
      // update studentData & re-render HomeBoardPage component to reflect the sorted changes in the DOM
      props.setStudentData({
        students: props.data.students, type: 'success'
      })
    }
    // user click anywhere outside the menu to close the popup
    else if(targetElement === 'closePopup'){
      setShowSortingPopup(null)
    }
    else setShowSortingPopup(targetElement)
  }

  return (
    <S.ToolbarContainer onClick={(e: React.MouseEvent<any>) => handleMenuPopup('closePopup')}>
      <S.Name>
        <div onMouseEnter={(e: React.MouseEvent<any>) => handleMenuPopup(e.currentTarget)}>
          {
            sortingDirectionAscending ? <ArrowDownwardIcon/> :  <ArrowUpwardIcon/>
          }
        </div>

        {
          !!showSortingPopup ? <BasicMenu el={showSortingPopup} handleMenuPopup={handleMenuPopup}/> : null
        }
        <S.NameSpan >Name</S.NameSpan>
      </S.Name>
      <div><S.Input placeholder="Search" value={searchFieldValue} onChange={(e)=>{handleSearch(e.target.value)}}/></div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  Name: styled.div`
    display: flex;
  `,
  NameSpan: styled.span`
    display: flex;
    margin: auto;
    margin-left: 30px;
  `,
  Input: styled.input`
    width: 150px;
    height: 25px;
    background: none;
    text-align: center;
    color: white;
    border: none;
    font-size: 13px;
    font-weight: 600;
  `,
  NoStudentFound: styled.span`
    display: flex;
    justify-content: center;
    font-weight: 300;
    font-size: 30px;
    margin-top: 35vh;
  `
}
