import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-placementcoordinator',
  templateUrl: './placementcoordinator.component.html',
  styleUrls: ['./placementcoordinator.component.css']
})
export class PlacementcoordinatorComponent {
formdata= new FormGroup({
  selectedcoord:new FormControl('Select Company',Validators.required)
})
OnSubmit() {
  console.warn('this')
}
}
