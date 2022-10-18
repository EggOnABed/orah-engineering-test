import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import './index.css';
import { AppCtx } from 'staff-app/app';
import { StudentListTile } from 'staff-app/components/student-list-tile/student-list-tile.component';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ActivityDetailsPopup({ data, setShowModal }) {
  const [open, setOpen] = React.useState(true);

  console.log(data)

  const handleClose = () => {
    setOpen(false);
    setShowModal(-1)
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        {
          data.map((item:any) => (
            <StudentListTile key={item.student_id} isRollMode={true} student={item} freshAttendance={false}/>
          ))
        }
      </Dialog>
    </div>
  );
}
