import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resumeformat',
  templateUrl: './resumeformat.component.html',
  styleUrls: ['./resumeformat.component.css']
})
export class ResumeformatComponent {
  formdata= new FormGroup({
    selectedcoord:new FormControl('Select',Validators.required)
  })
  OnSubmit() {
    const selectedValue = this.formdata.get('selectedcoord')!.value;
    let fileName: string="";

    if (selectedValue === 'ResumeFormat') {
      fileName = 'ResumeFormat.doc'; 
    } else if (selectedValue === 'ResumeExample') {
      fileName = 'ResumeExample.doc'; 
    }

    if (fileName) {
      this.downloadFile(fileName);
    }
  }

  downloadFile(fileName: string) {
    const filePath = `assets/${fileName}`;
    fetch(filePath)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}

