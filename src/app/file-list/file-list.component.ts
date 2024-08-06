import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-list',
  standalone: true,
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css'],
  imports: [CommonModule, FormsModule]
})
export class FileListComponent implements OnInit {
  @Output() fileSelected = new EventEmitter<string>();
  files: { name: string, originalData: any, modifiedData: any }[] = [];
  newFileName: string = '';
  newFileOriginalData: string = '';
  newFileModifiedData: string = '';
  showAddDoc:boolean=false

  changeAddDoc(){
    this.showAddDoc=!this.showAddDoc
  }

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    const fileList = JSON.parse(localStorage.getItem('fileList') || '[]');
    this.files = fileList.map((file: any) => ({
      name: file.name,
      originalData: file.originalData,
      modifiedData: file.modifiedData
    }));
  }

  addFile(event: Event) {
    event.preventDefault();

    if (!this.newFileName || !this.newFileOriginalData) {
      alert('Please provide file name and original data.');
      return;
    }

    try {
      const originalJsonData = JSON.parse(this.newFileOriginalData);
      const modifiedJsonData = this.newFileModifiedData 
        ? JSON.parse(this.newFileModifiedData) 
        : originalJsonData; // Use original data if modified data is not provided

      const newFile = { 
        name: this.newFileName, 
        originalData: originalJsonData, 
        modifiedData: modifiedJsonData,
        approved:true 
      };
      this.files.push(newFile);
      this.saveFiles();
      this.newFileName = '';
      this.newFileOriginalData = '';
      this.newFileModifiedData = ''; 
      this.showAddDoc=!this.showAddDoc
    } catch (error) {
      alert('Invalid JSON data.');
    }
  }

  selectFile(file: { name: string, originalData: any, modifiedData: any }) {
    this.fileSelected.emit(file.name);
  }

  saveFiles() {
    localStorage.setItem('fileList', JSON.stringify(this.files));
  }
}
