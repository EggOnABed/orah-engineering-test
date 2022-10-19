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
import _ from 'lodash'

export const HomeBoardPage: React.FC = () => {
  const [loader, setLoader] = useState('loaded')
  const appContext = useContext(AppCtx)
  // state to manage attendance view
  const [isRollMode, setIsRollMode] = useState(false)
  // re-initialize all roll states to unmark on click of 'Start Roll'
  const [freshAttendance, setFreshAttendance] = useState(false)
  // POST mock-API for saving attendance data to local-storage (mock backend)
  const [saveActiveRoll, rollSaveData] = useApi<{ success: boolean }>({ url: "save-roll" })
  // GET mock-API for fetching student data on initial page load
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  // state to manage filtering of student data from search bar w/o changing the unfiltered 'data' from inital API   
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
    // on click of 'Start roll'
    if (action === "roll") {
      setFreshAttendance(true)
      const unmarkedStudentData = appContext?.appData?.students?.map(student=>{
        student.attendanceState = 'unmark'
        return student
      })
      
      appContext?.updateAppData({ students: unmarkedStudentData })
      // open attendance view
      setIsRollMode(true) 
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    // on click of 'submit' roll calls
    if(action === "filter"){
      // prepare POST packet
      const packet = { 
        student_roll_states: appContext?.appData.students?.map(student=>{
          return {
            student_id: student.id, 
            roll_state: student.attendanceState,
            first_name: student.first_name,
            last_name: student.last_name,
          }
        })
      }
      // call POST API to save roll data on backend (in local storage)
      saveActiveRoll(packet)
    }
    // back to student view
    setIsRollMode(false)
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar setLoader={setLoader} onItemClick={onToolbarAction} data={data!} studentData={studentData!} getStudents={getStudents} setStudentData={setStudentData}/>

        { (loadState === "loading" || loader === "loading") && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && loader === 'loaded' && data?.students && (
          <>
            {studentData?.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} editable={true} student={s} freshAttendance={freshAttendance}/>
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
      {/* footer component for attendance mgmt */}
      <ActiveRollOverlay isActive={isRollMode} setFreshAttendance={setFreshAttendance} onItemClick={onActiveRollAction} setStudentData={setStudentData}/>
    </>
  )
}

type ToolbarAction = "roll" | "sort"
// allowed variables for props 
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void,
  studentData: { students: Person[]; },
  data: { students: Person[]; },
  getStudents: Function,
  setStudentData: Function,
  setLoader: Function
}

// React components re-render anytime the props object changes or the component's states or context changes
// Using memoization we prevent re-rendering incase the props don't change (shallow-level)
// It still would re-render if its states or context change
const Toolbar: React.FC<ToolbarProps> = React.memo((props) => {
  // state for sorting popup visibility toggling
  const [showSortingPopup, setShowSortingPopup] = useState(null)
  // state to toggle sorting direction on user-click events
  const [sortingDirectionAscending, setSortingDirection] = useState(true)
  // state to REACTively control value of search field
  const [searchFieldValue, setSearchFieldValue] = useState('')
  const { onItemClick } = props;

  // core filtering logic - check if included in f_name || l_name || full_name
  function filteringLogic(dataSource, value:string){
    return dataSource.filter(student=>{
      return student.first_name.toLowerCase().includes(value.toLowerCase()) || student.last_name.toLowerCase().includes(value.toLowerCase()) || 
      (student.first_name.toLowerCase() + ' ' + student.last_name.toLowerCase()).includes(value.toLowerCase())
    })
  }

  // runs on every onChange event in search-bar
  function handleSearch(value: string){
    // for managing an ugly edge-case
    const backSpaceBtnPressed: boolean = value.length < searchFieldValue.length;
    // start filtering by names only if search length > 2
    if(value.length > 2){
      const dataSource = backSpaceBtnPressed ? props.data.students : (props.studentData.students.length ? props.studentData.students : props.data.students)
      const students = filteringLogic(dataSource,value)
      // update studentData with filtered results
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
    props.setLoader('loaded')
  }

  // runs when user interacts with sorting functionality in myriad of ways
  function handleMenuPopup(targetElement: any, sortBy: string = 'first_name'){
    // some sorting has been done via onClick on menu-options
    if(!targetElement){
      // core sorting logic
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

  function onMouseEnterHandler(e: React.MouseEvent<any>){
    handleMenuPopup(e.currentTarget)
  }

  // debounce search handler by 0.5 seconds
  // if user types in the 500ms window, handleSearch won't run. It will run after that window
  function searchHandler(e: any){
    setSearchFieldValue(e.target.value);
    props.setLoader('loading');
    (_.debounce(()=>handleSearch(e.target.value),500))()
  }

  function onItemClickHandler(){
    onItemClick("roll")
  }

  return (
    <S.ToolbarContainer onClick={(e: React.MouseEvent<any>) => handleMenuPopup('closePopup')}>
      <S.Name>
        <div onMouseEnter={onMouseEnterHandler}>
          {
            sortingDirectionAscending ? <ArrowDownwardIcon/> :  <ArrowUpwardIcon/>
          }
        </div>

        {
          !!showSortingPopup ? <BasicMenu el={showSortingPopup} handleMenuPopup={handleMenuPopup}/> : null
        }
        <S.NameSpan>Name</S.NameSpan>
      </S.Name>
      <div><S.Input placeholder="Search" value={searchFieldValue} onChange={searchHandler}/></div>
      <S.Button onClick={onItemClickHandler}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
})

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
