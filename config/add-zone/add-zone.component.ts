import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { HttpService } from '../../../../services/http.service';
import { AppConfigService } from '../../../../services/app-config.service';
import { ToastrService } from 'ngx-toastr';

export interface DialogData {
  data: any;
}

@Component({
  selector: 'app-add-zone',
  templateUrl: './add-zone.component.html',
  styleUrls: ['./add-zone.component.css']
})
export class AddZoneComponent implements OnInit {

  dialogData: any;
  zoneForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddZoneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private appConfigService: AppConfigService,
    private httpService: HttpService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    try{
      this.resetZoneForm();
      console.log('data', data);
      this.dialogData = data;
    }catch(e){
      this.toastr.error(e.message);
    }
  }

  ngOnInit() {
    try{
      this.objZone = this.dialogData.zoneData;
      this.buildZoneForm();
    }catch(e){
      this.toastr.error(e.message);
    }
  }

  objZone: any;
  resetZoneForm() {
    try{

      let userInfo = this.appConfigService.getSessionObj('userInfo');
      console.log('userInfo', userInfo);

      this.objZone = {
        zone_id: 0,
        zone_name: null,
        active: 1,
        user_id: this.appConfigService.getSessionObj('userInfo') ? this.appConfigService.getSessionObj('userInfo').user_id : 0
      }
    }catch(e){
      this.toastr.error(e.message);
    }
  }

  buildZoneForm() {
    try{

      console.log('In build form function');

      this.zoneForm = this.formBuilder.group({
        zone_id: [this.objZone.zone_id, Validators.required],
        zone_name: [this.objZone.zone_name, Validators.required],
        active: [this.objZone.active, Validators.required],
        user_id: [this.objZone.user_id ? this.objZone.user_id : this.appConfigService.getSessionObj('userInfo').user_id, Validators.required],
      });
    }catch(e){
      this.toastr.error(e.message);
    }
  }

  onNoClick(): void {
    try{
      this.dialogRef.close();
    }catch(e){
      this.toastr.error(e.message);
    }
  }

  showLoading: boolean = false;
  onYesClick(){
    try{

      this.showLoading = true;

      let data = {
        objZoneData: this.zoneForm.value
      }

      console.log('data', data);

      this.httpService.post(`saveZone`, data).subscribe((res: any) => {

        console.log('res', res);
        if(res && res.status.trim().toLowerCase() == 'success'){
          this.toastr.success(res.message);
          this.dialogRef.close(this.dialogData);
        }else if(res && res.status.trim().toLowerCase() == 'error'){
          this.toastr.error(res.message);
        }else{

        }
        this.showLoading = false;
      }, (err) => {
        this.showLoading = false;
        console.log(err.statusText);
      });

    }catch(e){
      this.toastr.error(e.message);
    }
  }

}
