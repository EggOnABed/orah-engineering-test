import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import './index.css';
import { StudentListTile } from 'staff-app/components/student-list-tile/student-list-tile.component';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ActivityDetailsPopup({ data, setShowModalId }) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    // to remove the modal
    setOpen(false);
    // edge-case - to open the previously closed modal again
    setTimeout(()=>{
      setShowModalId(-1)
    })
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        {
          data.map((item:any) => (
            <StudentListTile editable={false} key={item.student_id} isRollMode={true} student={item} freshAttendance={false}/>
          ))
        }
      </Dialog>
    </div>
  );
}
